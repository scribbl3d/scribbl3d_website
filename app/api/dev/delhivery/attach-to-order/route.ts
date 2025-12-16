import { createDelhiveryShipment } from "@/lib/delhivery/createShipment";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { orderId } = await req.json();

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: "orderId required" },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 }
        );
    }

    const result = await createDelhiveryShipment(order);

    if (!result.ok) {
        return NextResponse.json({
            success: false,
            error: "Waybill not generated",
            delhivery: result.raw,
        });
    }

    const shipment = await prisma.shipment.create({
        data: {
            orderId: order.id,
            provider: "DELHIVERY",
            waybill: result.waybill!,
            status: "created",
            rawResponse: result.raw,
            attempts: 1,
        },
    });

    return NextResponse.json({
        success: true,
        shipment,
    });
}
