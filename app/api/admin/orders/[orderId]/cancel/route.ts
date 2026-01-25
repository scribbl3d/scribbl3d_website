import { prisma } from "@/lib/prisma";
import { initiatePhonePeRefund } from "@/lib/refund";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: any) {
    const { orderId } = context.params;

    // 1️⃣ Fetch order
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2️⃣ Validate cancellation state
    if (!["confirmed", "processing"].includes(order.status)) {
        return NextResponse.json(
            { error: "Order cannot be cancelled now" },
            { status: 400 },
        );
    }

    if (!order.transactionId || !order.paymentReference) {
        return NextResponse.json(
            { error: "Payment transaction missing" },
            { status: 400 },
        );
    }

    if (order.refundStatus === "initiated") {
        return NextResponse.json(
            { error: "Refund already initiated" },
            { status: 400 },
        );
    }

    const merchantRefundId = `RFD_${order.id}_${Date.now()}`;

    try {
        // 3️⃣ Initiate PhonePe refund
        await initiatePhonePeRefund({
            merchantRefundId,
            originalTransactionId: order.transactionId,
            amount: Math.round(order.totalAmount * 100),
        });

        // 4️⃣ Update DB
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: "cancelled",
                refundStatus: "initiated",
                refundId: merchantRefundId,
                refundInitiatedAt: new Date(),
            },
        });

        return NextResponse.json({
            ok: true,
            message: "Order cancelled and refund initiated",
        });
    } catch (err) {
        console.error("Refund failed:", err);
        return NextResponse.json(
            { error: "Refund initiation failed" },
            { status: 500 },
        );
    }
}
