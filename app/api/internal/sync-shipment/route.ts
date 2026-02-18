import { getDelhiveryTracking } from "@/lib/delhivery/getTracking";
import { sendOrderDelivered, sendOrderShipped } from "@/lib/email/index";
import {
    mapOrderToEmailData,
    mapOrderToShipmentEmailData,
} from "@/lib/email/mapOrderToEmailData";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Derive order status from shipment + order
 */
function deriveOrderStatus(order: any, shipment: any) {
    if (!order.transactionId) return "payment_pending";
    if (!shipment?.waybill) return "confirmed";

    const delivered =
        shipment.status === "delivered" ||
        shipment.rawResponse?.ShipmentData?.[0]?.Shipment?.DeliveryDate;

    if (delivered) return "delivered";

    return "shipped";
}

/**
 * Statuses that indicate the order is in transit (past manifested)
 */
const IN_TRANSIT_STATUSES = [
    "in transit",
    "in_transit",
    "dispatched",
    "out for delivery",
    "out_for_delivery",
];
const PRE_TRANSIT_STATUSES = ["manifested", "created", "pending", "unknown"];

function isInTransit(status: string): boolean {
    return IN_TRANSIT_STATUSES.includes(status.toLowerCase());
}

function isPreTransit(status: string): boolean {
    return PRE_TRANSIT_STATUSES.includes(status.toLowerCase());
}

export async function POST(req: NextRequest) {
    let orderId: string | null = null;
    let shipmentId: string | null = null;

    try {
        const body = await req.json();
        orderId = body?.orderId;

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId is required" },
                { status: 400 },
            );
        }

        /**
         * 0️⃣ Acquire DB lock (prevents duplicate syncs)
         */
        const lock = await prisma.shipment.updateMany({
            where: {
                orderId,
                syncing: false,
            },
            data: {
                syncing: true,
            },
        });

        if (lock.count === 0) {
            return NextResponse.json({ skipped: true });
        }

        /**
         * 1️⃣ Fetch master shipment + order + user
         */
        const shipment = await prisma.shipment.findFirst({
            where: {
                orderId,
                isMaster: true,
            },
            include: {
                order: {
                    include: { user: true },
                },
            },
        });

        if (!shipment) {
            throw new Error("Shipment not found");
        }

        shipmentId = shipment.id;
        const previousStatus = shipment.status; // ← Track previous status

        if (!shipment.waybill) {
            throw new Error("Waybill not found");
        }

        /**
         * 2️⃣ Call Delhivery tracking API
         */
        const trackingJson = await getDelhiveryTracking({
            waybill: shipment.waybill,
        });

        const shipmentData = trackingJson?.ShipmentData?.[0]?.Shipment;
        console.log(
            "[SHIPMENT SYNC] Delhivery tracking response:",
            trackingJson?.ShipmentData,
        );

        if (!shipmentData) {
            throw new Error("Invalid Delhivery tracking response");
        }

        console.log(
            "[SHIPMENT SYNC] Delhivery shipment scans:",
            shipmentData.Scans,
        );
        console.log(
            "[SHIPMENT SYNC] Delhivery shipment status:",
            shipmentData.Status,
        );

        const delhiveryStatus =
            shipmentData?.Status?.Status?.toLowerCase() || "unknown";

        console.log(
            `[SHIPMENT SYNC] ${shipment.waybill} → ${delhiveryStatus} (was: ${previousStatus})`,
        );

        /**
         * 3️⃣ Update Master Shipment
         */
        const updatedShipment = await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
                status: delhiveryStatus,
                rawResponse: trackingJson,
                attempts: { increment: 1 },
                lastError: null,
                lastSyncedAt: new Date(),
                syncing: false,
            },
        });

        /**
         * 3.5️⃣ For MPS: Sync child shipments too
         */
        if (
            shipment.shipmentType === "MPS" &&
            shipment.childWaybills?.length > 0
        ) {
            for (const childWaybill of shipment.childWaybills) {
                try {
                    const childTracking = await getDelhiveryTracking({
                        waybill: childWaybill,
                    });

                    const childStatus =
                        childTracking?.ShipmentData?.[0]?.Shipment?.Status?.Status?.toLowerCase() ||
                        "unknown";

                    await prisma.shipment.updateMany({
                        where: {
                            orderId,
                            waybill: childWaybill,
                        },
                        data: {
                            status: childStatus,
                            rawResponse: childTracking,
                            lastSyncedAt: new Date(),
                            syncing: false,
                        },
                    });

                    console.log(
                        `[SHIPMENT SYNC] Child ${childWaybill} → ${childStatus}`,
                    );
                } catch (childErr: any) {
                    console.error(
                        `[SHIPMENT SYNC] Failed to sync child ${childWaybill}:`,
                        childErr.message,
                    );
                }
            }
        }

        /**
         * 4️⃣ Derive + update Order status (only if changed)
         */
        const newOrderStatus = deriveOrderStatus(
            shipment.order,
            updatedShipment,
        );

        if (shipment.order.status !== newOrderStatus) {
            await prisma.order.update({
                where: { id: shipment.order.id },
                data: { status: newOrderStatus },
            });
        }

        /**
         * 5️⃣ Send emails on status transitions
         */
        const userEmail = shipment.order.user?.email;

        // Shipped email: when status transitions FROM pre-transit TO in-transit
        if (
            userEmail &&
            isPreTransit(previousStatus) &&
            isInTransit(delhiveryStatus)
        ) {
            console.log("[Email] Sending order shipped email...");
            const emailData = mapOrderToShipmentEmailData(shipment.order, {
                waybill: shipment.waybill,
                trackingUrl:
                    shipment.trackingUrl ||
                    `https://www.delhivery.com/track/package/${shipment.waybill}`,
                provider: "Delhivery",
            });
            sendOrderShipped(emailData).catch((err) =>
                console.error("[Email] Order shipped email failed:", err),
            );
        }

        // Delivered email: when status transitions TO delivered
        if (
            userEmail &&
            previousStatus !== "delivered" &&
            delhiveryStatus === "delivered"
        ) {
            console.log("[Email] Sending order delivered email...");
            sendOrderDelivered(mapOrderToEmailData(shipment.order)).catch(
                (err) =>
                    console.error("[Email] Order delivered email failed:", err),
            );
        }

        /**
         * 6️⃣ Release lock on any remaining shipments
         */
        await prisma.shipment.updateMany({
            where: {
                orderId,
                syncing: true,
            },
            data: {
                syncing: false,
            },
        });

        return NextResponse.json({
            success: true,
            shipmentStatus: updatedShipment.status,
            orderStatus: newOrderStatus,
            shipmentType: shipment.shipmentType,
        });
    } catch (err: any) {
        console.error("SYNC SHIPMENT ERROR", err);

        if (orderId) {
            await prisma.shipment.updateMany({
                where: { orderId },
                data: {
                    syncing: false,
                    lastError: err.message?.slice(0, 500),
                    attempts: { increment: 1 },
                },
            });
        }

        return NextResponse.json(
            { error: err.message || "Failed to sync shipment" },
            { status: 500 },
        );
    }
}
