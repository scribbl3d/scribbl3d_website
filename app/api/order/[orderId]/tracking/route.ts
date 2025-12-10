import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { orderId: string } }
) {
    const { orderId } = params;

    const shipment = await prisma.shipment.findUnique({
        where: { orderId },
    });

    if (!shipment) {
        return NextResponse.json(
            { success: false, message: "No shipment found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        shipment,
    });
}
