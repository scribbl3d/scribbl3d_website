import { db } from "@/lib/db";
import { sendOrderCancelled } from "@/lib/email/index";
import { mapOrderToCancelEmailData } from "@/lib/email/mapOrderToEmailData";
import { initiatePhonePeRefund } from "@/lib/refund";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request, context: any) {
    const orderId = context.params.orderId;

    // Check if cancelledBy was sent from frontend
    let cancelledBy: "customer" | "admin" = "customer";
    let cancellationReason: string | undefined;
    try {
        const body = await req.json();
        cancelledBy = body.cancelledBy || "customer";
        cancellationReason = body.reason;
    } catch {
        // No body sent — default to customer
    }

    console.log("=================================================");
    console.log("🧨 [CANCEL] API HIT");
    console.log("🧨 [CANCEL] Order ID:", orderId);
    console.log("🧨 [CANCEL] Cancelled by:", cancelledBy);

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });

        if (!order) {
            console.log("❌ [CANCEL] Order not found");
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        console.log("📄 [CANCEL] ORDER FOUND:", {
            id: order.id,
            paymentMethod: order.paymentMethod,
            transactionId: order.transactionId,
            paymentReference: order.paymentReference,
            totalAmount: order.totalAmount,
        });

        if (!order.paymentReference) {
            throw new Error(
                "Missing providerReferenceId (paymentReference / OMO id)",
            );
        }

        const refundTxnId =
            "RFD_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);

        console.log("💸 [CANCEL] Generated refundTxnId:", refundTxnId);
        console.log("💸 [CANCEL] Initiating PhonePe refund…");

        const refundResponse = await initiatePhonePeRefund({
            refundTransactionId: refundTxnId,
            providerReferenceId: order.paymentReference,
            amount: Math.round(order.totalAmount * 100),
            orderId: order.id,
        });

        console.log("✅ [CANCEL] Refund API RESPONSE:");
        console.log(JSON.stringify(refundResponse, null, 2));

        await db.order.update({
            where: { id: order.id },
            data: {
                status: "cancelled",
                refundStatus: "initiated",
                refundId: refundTxnId,
                refundInitiatedAt: new Date(),
            },
        });

        console.log("✅ [CANCEL] Order updated in DB");

        // Send cancellation email (fire-and-forget)
        if (order.user?.email) {
            sendOrderCancelled(
                mapOrderToCancelEmailData(
                    order,
                    cancelledBy,
                    cancellationReason,
                ),
            ).catch((err) =>
                console.error("[Email] Order cancellation email failed:", err),
            );
        }

        console.log("=================================================");

        return NextResponse.json({
            success: true,
            refund: refundResponse,
        });
    } catch (err: any) {
        console.error("🔥 [CANCEL] ERROR");
        console.error(err);
        console.log("=================================================");

        return NextResponse.json(
            { error: err.message || "Cancel failed" },
            { status: 500 },
        );
    }
}
