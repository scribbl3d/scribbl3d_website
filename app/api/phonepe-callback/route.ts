import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;

sgMail.setApiKey(SENDGRID_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(
            "[PhonePe Callback] Received:",
            JSON.stringify(body, null, 2),
        );

        // PhonePe sends base64 encoded response
        const { response: encodedResponse, "x-verify": xVerify } = body;

        if (!encodedResponse) {
            console.error("[PhonePe Callback] Missing response in body");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Verify checksum
        const expectedChecksum =
            crypto
                .createHash("sha256")
                .update(encodedResponse + SALT_KEY)
                .digest("hex") +
            "###" +
            SALT_INDEX;

        if (xVerify !== expectedChecksum) {
            console.error("[PhonePe Callback] Checksum mismatch");
            return NextResponse.json({ success: false }, { status: 401 });
        }

        // Decode response
        const decodedResponse = JSON.parse(
            Buffer.from(encodedResponse, "base64").toString("utf-8"),
        );

        console.log(
            "[PhonePe Callback] Decoded:",
            JSON.stringify(decodedResponse, null, 2),
        );

        const { code, data } = decodedResponse;
        const transactionId = data?.merchantTransactionId;

        if (!transactionId) {
            console.error("[PhonePe Callback] Missing transaction ID");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Find order
        const order = await prisma.order.findFirst({
            where: { transactionId },
            include: { user: true },
        });

        if (!order) {
            console.error("[PhonePe Callback] Order not found:", transactionId);
            return NextResponse.json({ success: false }, { status: 404 });
        }

        // Handle payment success
        if (code === "PAYMENT_SUCCESS") {
            // Skip if already confirmed
            if (order.status === "confirmed" || order.status === "shipped") {
                console.log(
                    "[PhonePe Callback] Order already confirmed:",
                    order.id,
                );
                return NextResponse.json({ success: true });
            }

            // Extract payment details
            const pi = data?.paymentInstrument;
            let paymentMethod: string | null = null;
            let maskedPaymentId: string | null = null;
            let utrNumber: string | null = null;

            if (pi?.type === "UPI") {
                paymentMethod = "UPI";
                maskedPaymentId = pi.payerVpa ?? null;
                utrNumber = pi.utr ?? null;
            } else if (pi?.type === "CARD") {
                paymentMethod = pi.cardType ?? "CARD";
                maskedPaymentId = pi.maskedCardNumber ?? null;
            }

            // Update order
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "confirmed",
                    paymentMethod,
                    paymentReference: data?.transactionId,
                    maskedPaymentId,
                    utrNumber,
                },
                include: { user: true },
            });

            console.log("[PhonePe Callback] Order confirmed:", updatedOrder.id);

            // Send confirmation email
            if (updatedOrder.user?.email) {
                try {
                    await sgMail.send({
                        to: updatedOrder.user.email,
                        from: SENDGRID_FROM_EMAIL,
                        subject: "Your Order is Confirmed! - Scribbl3D",
                        html: `
                            <h2>Your order has been confirmed 🎉</h2>
                            <p>Order ID: ${updatedOrder.id}</p>
                            <p>Amount: ₹${updatedOrder.totalAmount}</p>
                        `,
                    });
                } catch (emailErr) {
                    console.error("[PhonePe Callback] Email failed:", emailErr);
                }
            }

            return NextResponse.json({ success: true });
        }

        // Handle payment failure
        if (code === "PAYMENT_ERROR" || code === "PAYMENT_DECLINED") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "payment_failed" },
            });

            console.log("[PhonePe Callback] Order marked as failed:", order.id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PhonePe Callback] Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
