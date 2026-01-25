import { db } from "@/lib/db";
import { initiatePhonePeRefund } from "@/lib/refund";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(
    _req: Request,
    context: { params: Promise<{ orderId: string }> },
) {
    try {
        const { orderId } = await context.params;

        console.log("🧨 [CANCEL] Cancel request for order:", orderId);

        const order = await db.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            console.log("❌ [CANCEL] Order not found");
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        console.log("📄 [CANCEL] Order found:", {
            id: order.id,
            paymentMethod: order.paymentMethod,
            paymentReference: order.paymentReference,
            totalAmount: order.totalAmount,
        });

        /**
         * 🔑 RULE:
         * If paymentReference (OMO...) exists → PhonePe refund
         * If not → just cancel order
         */
        if (!order.paymentReference) {
            console.log(
                "⚠️ [CANCEL] No paymentReference found. Skipping refund.",
            );

            await db.order.update({
                where: { id: order.id },
                data: {
                    status: "cancelled",
                },
            });

            return NextResponse.json({
                ok: true,
                message: "Order cancelled (no refund required)",
            });
        }

        const merchantRefundId =
            "RFD_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);

        console.log("💸 [CANCEL] Calling PhonePe refund…");

        const refundResponse = await initiatePhonePeRefund({
            merchantRefundId,
            originalTransactionId: order.paymentReference, // OMO...
            merchantTransactionId: order.transactionId!, // T176...
            amount: Math.round(order.totalAmount * 100),
        });

        await db.order.update({
            where: { id: order.id },
            data: {
                status: "cancelled",
                refundStatus: "initiated",
                refundId: merchantRefundId,
                refundInitiatedAt: new Date(),
            },
        });

        console.log("✅ [CANCEL] Order cancelled & refund initiated");

        return NextResponse.json({
            ok: true,
            refund: refundResponse,
        });
    } catch (err: any) {
        console.error("🔥 [CANCEL] Refund failed:", err);

        return NextResponse.json(
            { error: err.message || "Refund failed" },
            { status: 500 },
        );
    }
}
