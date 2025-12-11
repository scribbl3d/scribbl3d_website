// app/api/admin/shipments/order/[orderId]/retry/route.ts
import { createDelhiveryStagingShipment } from "@/lib/delhivery-staging";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            return NextResponse.json(
                { ok: false, message: "Order not found" },
                { status: 404 }
            );

        const result = await createDelhiveryStagingShipment(order);
        if (!result.ok)
            return NextResponse.json(
                { ok: false, error: result.error },
                { status: 500 }
            );

        return NextResponse.json({
            ok: true,
            saved: result.saved,
            raw: result.delhiveryResp,
        });
    } catch (err: any) {
        console.error("ADMIN RETRY ERROR:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
