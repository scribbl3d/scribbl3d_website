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

        // Someone else is already syncing
        if (lock.count === 0) {
            return NextResponse.json({ skipped: true });
        }

        /**
         * 1️⃣ Fetch shipment + order
         */
        const shipment = await prisma.shipment.findUnique({
            where: { orderId },
            include: { order: true },
        });

        if (!shipment || !shipment.waybill) {
            throw new Error("Shipment or waybill not found");
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
            "[SHIPMENT SYNC] Delhivery shipment scans:",
            shipmentData.Status,
        );

        const delhiveryStatus =
            shipmentData?.Status?.Status?.toLowerCase() || "unknown";

        console.log(`[SHIPMENT SYNC] ${shipment.waybill} → ${delhiveryStatus}`);

        /**
         * 3️⃣ Update Shipment
         */
        const updatedShipment = await prisma.shipment.update({
            where: { orderId },
            data: {
                status: delhiveryStatus,
                rawResponse: trackingJson,
                attempts: { increment: 1 },
                lastError: null,
                lastSyncedAt: new Date(),
            },
        });

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
         * 5️⃣ Release lock
         */
        await prisma.shipment.update({
            where: { orderId },
            data: {
                syncing: false,
            },
        });

        return NextResponse.json({
            success: true,
            shipmentStatus: updatedShipment.status,
            orderStatus: newOrderStatus,
        });
    } catch (err: any) {
        console.error("SYNC SHIPMENT ERROR", err);

        /**
         * Best-effort error logging + lock release
         */
        if (orderId) {
            await prisma.shipment.update({
                where: { orderId },
                data: {
                    syncing: false,
                    lastError: err.message,
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
