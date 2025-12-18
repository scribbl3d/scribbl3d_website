import { getDelhiveryTracking } from "@/lib/delhivery/getTracking";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId is required" },
                { status: 400 }
            );
        }

        // 1. Fetch shipment + order
        const shipment = await prisma.shipment.findUnique({
            where: { orderId },
            include: { order: true },
        });

        if (!shipment || !shipment.waybill) {
            return NextResponse.json(
                { error: "Shipment or waybill not found" },
                { status: 404 }
            );
        }

        // 2. Call Delhivery tracking API
        const trackingJson = await getDelhiveryTracking({
            waybill: shipment.waybill,
        });

        const shipmentData = trackingJson?.ShipmentData?.[0]?.Shipment;

        if (!shipmentData) {
            throw new Error("Invalid Delhivery tracking response");
        }

        const delhiveryStatus =
            shipmentData?.Status?.Status?.toLowerCase() || "unknown";

        // 3. Update Shipment
        const updatedShipment = await prisma.shipment.update({
            where: { orderId },
            data: {
                status: delhiveryStatus,
                rawResponse: trackingJson,
                attempts: { increment: 1 },
                lastError: null,
            },
        });

        // 4. Derive Order status
        const newOrderStatus = deriveOrderStatus(
            shipment.order,
            updatedShipment
        );

        // 5. Update Order ONLY if changed
        if (shipment.order.status !== newOrderStatus) {
            await prisma.order.update({
                where: { id: shipment.order.id },
                data: { status: newOrderStatus },
            });
        }

        return NextResponse.json({
            success: true,
            shipmentStatus: updatedShipment.status,
            orderStatus: newOrderStatus,
        });
    } catch (err: any) {
        console.error("SYNC SHIPMENT ERROR", err);

        // Best-effort error tracking
        if (err?.orderId) {
            await prisma.shipment.update({
                where: { orderId: err.orderId },
                data: {
                    lastError: err.message,
                    attempts: { increment: 1 },
                },
            });
        }

        return NextResponse.json(
            { error: err.message || "Failed to sync shipment" },
            { status: 500 }
        );
    }
}
