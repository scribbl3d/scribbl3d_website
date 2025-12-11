// app/api/admin/shipments/order/[orderId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;
        if (!orderId)
            return NextResponse.json(
                { ok: false, message: "orderId required" },
                { status: 400 }
            );

        const shipment = await prisma.shipment.findFirst({
            where: { orderId },
        });

        if (!shipment) return NextResponse.json({ ok: true, shipment: null });

        return NextResponse.json({ ok: true, shipment });
    } catch (err: any) {
        console.error("GET SHIPMENT BY ORDER ERROR:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
