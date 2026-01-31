import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;
const ENV = process.env.PHONEPE_ENV === "prod" ? "prod" : "UAT";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;

sgMail.setApiKey(SENDGRID_API_KEY);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ transactionId: string }> },
) {
    const startTime = Date.now();

    try {
        const { transactionId } = await context.params;

        console.log("[CheckStatus] Starting for:", transactionId);

        if (!transactionId) {
            return NextResponse.json(
                {
                    success: false,
                    code: "INVALID_REQUEST",
                    message: "Transaction ID required",
                },
                { status: 400 },
            );
        }

        // First, check if order is already confirmed in our DB
        const existingOrder = await prisma.order.findFirst({
            where: { transactionId },
            select: { id: true, status: true },
        });

        if (
            existingOrder?.status === "confirmed" ||
            existingOrder?.status === "shipped"
        ) {
            console.log(
                "[CheckStatus] Order already confirmed in DB:",
                existingOrder.id,
            );
            return NextResponse.json({
                success: true,
                code: "PAYMENT_SUCCESS",
                message: "Payment already confirmed",
            });
        }

        // Call PhonePe Status API
        const statusUrl = `https://api${ENV === "prod" ? "" : "-preprod"}.phonepe.com/apis/hermes/pg/v1/status/${MERCHANT_ID}/${transactionId}`;

        const stringToSign = `/pg/v1/status/${MERCHANT_ID}/${transactionId}${SALT_KEY}`;
        const sha256 = crypto
            .createHash("sha256")
            .update(stringToSign)
            .digest("hex");
        const xVerify = `${sha256}###${SALT_INDEX}`;

        console.log("[CheckStatus] Calling PhonePe API...");

        const phonepeResponse = await axios.get(statusUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": xVerify,
                "X-MERCHANT-ID": MERCHANT_ID,
            },
            timeout: 10000, // 10 second timeout
        });

        const result = phonepeResponse.data;
        console.log("[CheckStatus] PhonePe response:", {
            code: result.code,
            success: result.success,
        });

        // Handle SUCCESS
        if (result.success && result.code === "PAYMENT_SUCCESS") {
            await handlePaymentSuccess(transactionId, result);

            console.log(
                `[CheckStatus] Completed in ${Date.now() - startTime}ms - SUCCESS`,
            );
            return NextResponse.json({
                success: true,
                code: "PAYMENT_SUCCESS",
                data: result,
            });
        }

        // Handle PENDING
        if (result.code === "PAYMENT_PENDING") {
            console.log(
                `[CheckStatus] Completed in ${Date.now() - startTime}ms - PENDING`,
            );
            return NextResponse.json({
                success: false,
                code: "PAYMENT_PENDING",
                message: "Payment is still processing",
            });
        }

        // Handle FAILURE
        console.log(
            `[CheckStatus] Completed in ${Date.now() - startTime}ms - FAILED`,
        );
        return NextResponse.json({
            success: false,
            code: result.code || "PAYMENT_FAILED",
            message: result.message || "Payment failed",
        });
    } catch (error: any) {
        console.error("[CheckStatus] Error:", error.message);

        // If PhonePe API times out, return PENDING so client retries
        if (
            error.code === "ECONNABORTED" ||
            error.message?.includes("timeout")
        ) {
            return NextResponse.json({
                success: false,
                code: "PAYMENT_PENDING",
                message: "Status check timed out, please wait",
            });
        }

        return NextResponse.json(
            {
                success: false,
                code: "ERROR",
                message: "Failed to check payment status",
            },
            { status: 500 },
        );
    }
}

async function handlePaymentSuccess(transactionId: string, result: any) {
    const order = await prisma.order.findFirst({
        where: { transactionId },
        include: { user: true },
    });

    if (!order) {
        console.error("[CheckStatus] Order not found for txn:", transactionId);
        return;
    }

    // Skip if already confirmed
    if (order.status === "confirmed" || order.status === "shipped") {
        console.log("[CheckStatus] Order already confirmed, skipping update");
        return;
    }

    // Extract payment instrument details
    const pi = result.data?.paymentInstrument;
    let paymentMethod: string | null = null;
    let maskedPaymentId: string | null = null;
    let utrNumber: string | null = null;
    let brnNumber: string | null = null;
    let cardNetwork: string | null = null;

    if (pi?.type === "UPI") {
        paymentMethod = "UPI";
        maskedPaymentId = pi.payerVpa ?? null;
        utrNumber = pi.utr ?? null;
    } else if (pi?.type === "CARD") {
        paymentMethod = pi.cardType ?? "CARD";
        maskedPaymentId = pi.maskedCardNumber ?? null;
        brnNumber = pi.brn ?? null;
        cardNetwork = pi.cardNetwork ?? null;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            status: "confirmed",
            paymentMethod,
            paymentReference: result.data?.transactionId,
            maskedPaymentId,
            utrNumber,
            brnNumber,
            cardNetwork,
        },
        include: { user: true },
    });

    console.log("[CheckStatus] Order confirmed:", updatedOrder.id);

    // Send email (non-blocking)
    sendOrderConfirmationEmail(updatedOrder).catch((err) => {
        console.error("[CheckStatus] Email failed:", err);
    });
}

async function sendOrderConfirmationEmail(order: any) {
    const userEmail = order.user?.email;
    if (!userEmail) return;

    const msg = {
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: "Your Order is Confirmed! - Scribbl3D",
        html: `
            <h2>Your order has been confirmed 🎉</h2>
            <p>Order ID: ${order.id}</p>
            <p>Amount: ₹${order.totalAmount}</p>
            <p>Thank you for shopping with Scribbl3D!</p>
        `,
    };

    await sgMail.send(msg);
    console.log("[CheckStatus] Confirmation email sent to:", userEmail);
}
