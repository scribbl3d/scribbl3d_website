import { getDelhiveryTracking } from "@/lib/delhivery/getTracking";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // 1. Get all active shipped shipments
        const shipments = await prisma.shipment.findMany({
            where: {
                status: { not: "delivered" },
                waybill: { not: null },
            },
            include: {
                order: true,
            },
        });

        let synced = 0;

        for (const shipment of shipments) {
            try {
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

                // Update order ONLY if delivered
                if (isDelivered && shipment.order.status !== "delivered") {
                    await prisma.order.update({
                        where: { id: shipment.orderId },
                        data: { status: "delivered" },
                    });
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
            { status: 500 }
        );
    }
}
