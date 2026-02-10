import { getDelhiveryTracking } from "@/lib/delhivery/getTracking";
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
         * Lock all shipments for this order
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

        // Someone else is already syncing
        if (lock.count === 0) {
            return NextResponse.json({ skipped: true });
        }

        /**
         * 1️⃣ Fetch master shipment + order
         * Use findFirst since orderId is no longer unique
         */
        const shipment = await prisma.shipment.findFirst({
            where: {
                orderId,
                isMaster: true, // Get master shipment for MPS, or the only shipment for SPS
            },
            include: { order: true },
        });

        if (!shipment) {
            throw new Error("Shipment not found");
        }

        shipmentId = shipment.id;

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

        console.log(`[SHIPMENT SYNC] ${shipment.waybill} → ${delhiveryStatus}`);

        /**
         * 3️⃣ Update Master Shipment (use id, not orderId)
         */
        const updatedShipment = await prisma.shipment.update({
            where: { id: shipment.id }, // ✅ Use id instead of orderId
            data: {
                status: delhiveryStatus,
                rawResponse: trackingJson,
                attempts: { increment: 1 },
                lastError: null,
                lastSyncedAt: new Date(),
                syncing: false, // Release lock here
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
                    // Continue with other children even if one fails
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
         * 5️⃣ Release lock on any remaining shipments
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

        /**
         * Best-effort error logging + lock release
         */
        if (orderId) {
            // Release lock and log error on all shipments for this order
            await prisma.shipment.updateMany({
                where: { orderId },
                data: {
                    syncing: false,
                    lastError: err.message?.slice(0, 500), // Truncate long errors
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
