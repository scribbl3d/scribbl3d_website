import { getDelhiveryTracking } from "@/lib/delhivery/getTracking";
import { sendOrderDelivered, sendOrderShipped } from "@/lib/email/index";
import {
    mapOrderToEmailData,
    mapOrderToShipmentEmailData,
} from "@/lib/email/mapOrderToEmailData";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function POST() {
    try {
        // 1. Get all active shipped shipments with user info
        const shipments = await prisma.shipment.findMany({
            where: {
                status: { not: "delivered" },
                waybill: { not: null },
            },
            include: {
                order: {
                    include: { user: true },
                },
            },
        });

        let synced = 0;

        for (const shipment of shipments) {
            try {
                const previousStatus = shipment.status; // ← Track previous

                const trackingJson = await getDelhiveryTracking({
                    waybill: shipment.waybill!,
                });

                const shipmentData = trackingJson?.ShipmentData?.[0]?.Shipment;

                if (!shipmentData) continue;

                const delhiveryStatus =
                    shipmentData?.Status?.Status?.toLowerCase() || "unknown";

                const isDelivered =
                    delhiveryStatus === "delivered" ||
                    shipmentData.DeliveryDate;

                // Update shipment
                await prisma.shipment.update({
                    where: { id: shipment.id },
                    data: {
                        status: delhiveryStatus,
                        rawResponse: trackingJson,
                        attempts: { increment: 1 },
                        lastError: null,
                    },
                });

                // Update order if delivered
                if (isDelivered && shipment.order.status !== "delivered") {
                    await prisma.order.update({
                        where: { id: shipment.orderId },
                        data: { status: "delivered" },
                    });
                }

                // ── Email triggers (only on status transitions) ──

                const userEmail = shipment.order.user?.email;

                // Shipped email: pre-transit → in-transit
                if (
                    userEmail &&
                    isPreTransit(previousStatus) &&
                    isInTransit(delhiveryStatus)
                ) {
                    console.log(
                        `[Email] Sending shipped email for order ${shipment.orderId}`,
                    );
                    sendOrderShipped(
                        mapOrderToShipmentEmailData(shipment.order, {
                            waybill: shipment.waybill!,
                            trackingUrl:
                                shipment.trackingUrl ||
                                `https://www.delhivery.com/track/package/${shipment.waybill}`,
                            provider: "Delhivery",
                        }),
                    ).catch((err) =>
                        console.error(
                            `[Email] Shipped email failed for ${shipment.orderId}:`,
                            err,
                        ),
                    );
                }

                // Delivered email: not-delivered → delivered
                if (
                    userEmail &&
                    previousStatus !== "delivered" &&
                    isDelivered
                ) {
                    console.log(
                        `[Email] Sending delivered email for order ${shipment.orderId}`,
                    );
                    sendOrderDelivered(
                        mapOrderToEmailData(shipment.order),
                    ).catch((err) =>
                        console.error(
                            `[Email] Delivered email failed for ${shipment.orderId}:`,
                            err,
                        ),
                    );
                }

                synced++;
            } catch (innerErr: any) {
                await prisma.shipment.update({
                    where: { id: shipment.id },
                    data: {
                        lastError: innerErr.message,
                        attempts: { increment: 1 },
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            syncedShipments: synced,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Bulk sync failed" },
            { status: 500 },
        );
    }
}
