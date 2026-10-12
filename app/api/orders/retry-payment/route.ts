import { confirmPayment } from "@/lib/payments/confirmPayment";
import { PHONEPE_HOST, paymentDetailsFrom, signRequest } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

/** PhonePe's current answer for a transaction, or null when it can't be reached */
async function phonepeStatus(transactionId: string): Promise<any | null> {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const path = `/pg/v1/status/${merchantId}/${transactionId}`;
    try {
        const res = await axios.get(`${PHONEPE_HOST}${path}`, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": signRequest("", path),
                "X-MERCHANT-ID": merchantId,
            },
            timeout: 10000,
        });
        return res.data ?? null;
    } catch (error: any) {
        // PhonePe answers unknown/failed transactions with an error status and a code
        return error?.response?.data?.code ? error.response.data : null;
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { orderId, newTransactionId } = await req.json();

        if (!orderId || !newTransactionId) {
            return NextResponse.json(
                { error: "orderId and newTransactionId are required" },
                { status: 400 },
            );
        }
        // PhonePe merchantTransactionId: letters, digits, _ and -, at most 35 characters
        if (typeof newTransactionId !== "string" || !/^[A-Za-z0-9_-]{8,35}$/.test(newTransactionId)) {
            return NextResponse.json(
                { error: "Invalid transaction" },
                { status: 400 },
            );
        }

        // Find the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 },
            );
        }

        // Only allow retry for pending/failed payments
        if (order.status !== "payment_pending" && order.status !== "payment_failed") {
            return NextResponse.json(
                { error: `Cannot retry payment for order with status: ${order.status}` },
                { status: 400 },
            );
        }

        // Never start a second payment while the first one may still succeed
        if (order.transactionId) {
            const previous = await phonepeStatus(order.transactionId);
            if (!previous) {
                return NextResponse.json(
                    { error: "We couldn't confirm your earlier payment attempt. Please try again in a minute.", code: "STATUS_UNAVAILABLE" },
                    { status: 503 },
                );
            }
            if (previous.success && previous.code === "PAYMENT_SUCCESS") {
                const outcome = await confirmPayment(
                    order.transactionId,
                    Number(previous.data?.amount),
                    paymentDetailsFrom(previous.data?.paymentInstrument, previous.data?.transactionId),
                    "status-check",
                );
                const underReview = outcome === "amount_mismatch" || outcome === "not_payable";
                return NextResponse.json(
                    underReview
                        ? { error: "We received a payment for this order and our team is reviewing it.", code: "PAYMENT_REVIEW" }
                        : { error: "This order has already been paid.", code: "ALREADY_PAID" },
                    { status: 409 },
                );
            }
            if (previous.code === "PAYMENT_PENDING") {
                return NextResponse.json(
                    { error: "Your earlier payment is still processing. Please wait a few minutes before trying again.", code: "PAYMENT_PENDING" },
                    { status: 409 },
                );
            }
        }

        // Atomic: a confirmation or another retry in between wins
        const updated = await prisma.order.updateMany({
            where: {
                id: orderId,
                userId: session.user.id,
                transactionId: order.transactionId,
                status: { in: ["payment_pending", "payment_failed"] },
            },
            data: {
                transactionId: newTransactionId,
                status: "payment_pending",
            },
        });
        if (updated.count === 0) {
            return NextResponse.json(
                { error: "This order changed while retrying. Please check your orders." },
                { status: 409 },
            );
        }

        return NextResponse.json({
            success: true,
            orderId,
            transactionId: newTransactionId,
        });
    } catch (error) {
        console.error("[RetryPayment] Error:", error);
        return NextResponse.json(
            { error: "Failed to update payment details" },
            { status: 500 },
        );
    }
}
