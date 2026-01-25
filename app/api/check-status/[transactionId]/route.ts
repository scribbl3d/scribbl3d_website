// app/api/check-status/[transactionId]/route.ts

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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

sgMail.setApiKey(SENDGRID_API_KEY);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ transactionId: string }> },
) {
    try {
        const { transactionId } = await context.params;

        console.log(
            "[Payment Status Check] Starting status check for:",
            transactionId,
        );

        if (!transactionId) {
            return NextResponse.json(
                { success: false, message: "Transaction ID required" },
                { status: 400 },
            );
        }

        /* -------------------------
       1️⃣ Call PhonePe Status API
       ------------------------- */
        const merchantId = MERCHANT_ID;
        const statusUrl = `https://api${
            ENV === "prod" ? "" : "-preprod"
        }.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`;

        const stringToSign = `/pg/v1/status/${merchantId}/${transactionId}${SALT_KEY}`;
        const sha256 = crypto
            .createHash("sha256")
            .update(stringToSign)
            .digest("hex");
        const xVerify = `${sha256}###${SALT_INDEX}`;

        const phonepeResponse = await axios.get(statusUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": xVerify,
                "X-MERCHANT-ID": merchantId,
            },
        });

        const result = phonepeResponse.data;

        console.log("[PhonePe Status API] Response:", result);

        /* -------------------------
       2️⃣ Payment SUCCESS
       ------------------------- */
        if (result.success && result.code === "PAYMENT_SUCCESS") {
            const order = await prisma.order.findFirst({
                where: { transactionId },
                include: { user: true },
            });

            if (!order) {
                return NextResponse.json(
                    { success: false, code: "ORDER_NOT_FOUND" },
                    { status: 404 },
                );
            }

            if (order.status !== "confirmed" && order.status !== "shipped") {
                const pi = result.data?.paymentInstrument;

                let paymentMethod: string | null = null;
                let maskedPaymentId: string | null = null;

                if (pi?.type === "UPI") {
                    paymentMethod = "UPI";
                    maskedPaymentId = pi.payerVpa ?? null;
                }

                if (pi?.type === "CARD") {
                    paymentMethod = pi.cardType ?? "CARD";
                    maskedPaymentId = pi.maskedCardNumber ?? null;
                }

                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "confirmed",

                        paymentMethod,
                        paymentReference: result.data.transactionId, // PhonePe dispute ref
                        maskedPaymentId,
                    },
                    include: { user: true },
                });

                console.log(
                    "[Order] Confirmed & payment details saved:",
                    updatedOrder.id,
                );

                /* 📧 Send confirmation email */
                try {
                    await sendOrderConfirmationEmail(updatedOrder);
                } catch (err) {
                    console.error("[Email] Failed:", err);
                }

                /* 🚚 Trigger shipment */
                // try {
                //     await fetch(`${APP_URL}/api/internal/create-shipment`, {
                //         method: "POST",
                //         headers: { "Content-Type": "application/json" },
                //         body: JSON.stringify({ orderId: updatedOrder.id }),
                //     });
                // } catch (shipErr) {
                //     console.error("[Shipment] Failed:", shipErr);
                // }
            }

            return NextResponse.json({
                success: true,
                code: "PAYMENT_SUCCESS",
                data: result,
            });
        }

        /* -------------------------
       3️⃣ Payment PENDING
       ------------------------- */
        if (result.code === "PAYMENT_PENDING") {
            return NextResponse.json({
                success: false,
                code: "PAYMENT_PENDING",
                message: "Payment is still processing",
            });
        }

        /* -------------------------
       4️⃣ Payment FAILED
       ------------------------- */
        return NextResponse.json({
            success: false,
            code: result.code || "PAYMENT_FAILED",
            message: result.message || "Payment failed",
        });
    } catch (error) {
        console.error("[Payment Status Check] Error:", error);
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

/* -------------------------
   EMAIL (UNCHANGED LOGIC)
   ------------------------- */
async function sendOrderConfirmationEmail(order: any) {
    const userEmail = order.user?.email;
    if (!userEmail) return;

    const msg = {
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: "Your Order is Confirmed! - Scribbl3D",
        html: "<h2>Your order has been confirmed 🎉</h2>",
    };

    await sgMail.send(msg);
}
