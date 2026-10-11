import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { confirmPayment } from "@/lib/payments/confirmPayment";
import { PHONEPE_HOST, paymentDetailsFrom, signRequest } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

const PAID_STATUSES = ["confirmed", "shipped", "delivered", "processing"];

// Payment status polling from the status/success pages. Only the order's
// owner can check it; a success from PhonePe is applied through
// confirmPayment (amount must match the stored total, exactly once).
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ transactionId: string }> },
) {
    const startTime = Date.now();

    try {
        const { transactionId } = await context.params;
        if (!transactionId || !/^[A-Za-z0-9_-]{1,64}$/.test(transactionId)) {
            return NextResponse.json(
                { success: false, code: "INVALID_REQUEST", message: "Transaction ID required" },
                { status: 400 },
            );
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, code: "UNAUTHORIZED", message: "Please sign in to check your payment" },
                { status: 401 },
            );
        }

        const order = await prisma.order.findFirst({
            where: { transactionId },
            select: { id: true, status: true, userId: true },
        });
        if (!order || order.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "Order not found" },
                { status: 404 },
            );
        }

        if (PAID_STATUSES.includes(order.status)) {
            return NextResponse.json({ success: true, code: "PAYMENT_SUCCESS", message: "Payment already confirmed" });
        }

        // Ask PhonePe (production, same host as payment initiation)
        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const path = `/pg/v1/status/${merchantId}/${transactionId}`;
        const phonepeResponse = await axios.get(`${PHONEPE_HOST}${path}`, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": signRequest("", path),
                "X-MERCHANT-ID": merchantId,
            },
            timeout: 10000,
        });

        const result = phonepeResponse.data;
        console.log("[CheckStatus] PhonePe:", { transactionId, code: result?.code, success: result?.success });

        if (result?.success && result.code === "PAYMENT_SUCCESS") {
            const outcome = await confirmPayment(
                transactionId,
                Number(result.data?.amount),
                paymentDetailsFrom(result.data?.paymentInstrument, result.data?.transactionId),
                "status-check",
            );
            if (outcome === "amount_mismatch" || outcome === "not_payable") {
                return NextResponse.json({
                    success: false,
                    code: "PAYMENT_REVIEW",
                    message: "We received a payment for this order and our team is reviewing it. We'll contact you shortly.",
                });
            }
            console.log(`[CheckStatus] Completed in ${Date.now() - startTime}ms - SUCCESS (${outcome})`);
            return NextResponse.json({ success: true, code: "PAYMENT_SUCCESS" });
        }

        if (result?.code === "PAYMENT_PENDING") {
            return NextResponse.json({ success: false, code: "PAYMENT_PENDING", message: "Payment is still processing" });
        }

        return NextResponse.json({
            success: false,
            code: result?.code || "PAYMENT_FAILED",
            message: result?.message || "Payment failed",
        });
    } catch (error: any) {
        console.error("[CheckStatus] Error:", error?.message);

        if (error?.response?.data) {
            const phonepeData = error.response.data;
            return NextResponse.json({
                success: false,
                code: phonepeData.code || "PAYMENT_PENDING",
                message: phonepeData.message || "Status check failed",
            });
        }

        // Network/timeout errors — treat as pending so the page retries
        return NextResponse.json({
            success: false,
            code: "PAYMENT_PENDING",
            message:
                error?.code === "ECONNABORTED" || error?.message?.includes("timeout")
                    ? "Status check timed out, please wait"
                    : "Unable to verify payment status, retrying...",
        });
    }
}
