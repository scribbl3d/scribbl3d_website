import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { shipmentId, status } = await req.json();

    const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: { status },
    });

    await prisma.order.update({
        where: { id: shipment.orderId },
        data: {
            trackingInfo: {
                waybill: shipment.waybill,
                provider: shipment.provider,
                status,
            },
        },
    });

    return NextResponse.json({ success: true });
}
