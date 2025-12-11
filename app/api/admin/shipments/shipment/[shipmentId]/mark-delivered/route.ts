// app/api/admin/shipments/shipment/[shipmentId]/mark-delivered/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// Optional: import your email helper if available
// import { sendOrderDeliveredEmail } from "@/lib/emails";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ shipmentId: string }> }
) {
    try {
        const { shipmentId } = await context.params;
        if (!shipmentId)
            return NextResponse.json(
                { ok: false, message: "shipmentId required" },
                { status: 400 }
            );

        // Update the shipment to delivered
        const shipment = await prisma.shipment.update({
            where: { id: shipmentId },
            data: { status: "delivered" },
        });

        // Update the corresponding order: mark delivered and update trackingInfo
        const updatedOrder = await prisma.order.update({
            where: { id: shipment.orderId },
            data: {
                status: "delivered",
                trackingInfo: {
                    provider: shipment.provider,
                    waybill: shipment.waybill,
                    status: "delivered",
                },
            },
            include: { user: true },
        });

        return NextResponse.json({ ok: true, shipment, order: updatedOrder });
    } catch (err: any) {
        console.error("MARK DELIVERED ERROR:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
