// app/api/check-status/[transactionId]/route.ts
import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";

const prisma = new PrismaClient();

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const ENV = process.env.PHONEPE_ENV === "prod" ? "prod" : "UAT";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "";

// Only set SendGrid if configured
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Dev / Prod combined handler:
 * - If NEXT_PUBLIC_MOCK_PHONEPE === "true" => mark order confirmed in DB and return PAYMENT_SUCCESS (dev-safe).
 *   Optionally send email in dev if MOCK_SEND_EMAIL_IN_DEV === "true" (not recommended).
 * - Else => perform real PhonePe status check and update DB + send email as in production.
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ transactionId: string }> }
) {
    // extract transactionId first (important)
    const { transactionId } = await context.params;

    if (!transactionId) {
        return NextResponse.json(
            { success: false, message: "transactionId required" },
            { status: 400 }
        );
    }

    // === DEV MOCK PATH: mark order confirmed and return success ===
    if (process.env.NEXT_PUBLIC_MOCK_PHONEPE === "true") {
        try {
            console.log(
                "[MOCK PAYMENT] Simulating payment success for:",
                transactionId
            );

            const order = await prisma.order.findFirst({
                where: { transactionId },
                include: { user: true },
            });
            console.log(
                "[MOCK PAYMENT] Order found (before update):",
                order ?? "null"
            );

            if (order) {
                if (order.status !== "confirmed") {
                    const updated = await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "confirmed" },
                    });
                    console.log("[MOCK PAYMENT] Order updated:", updated);
                } else {
                    console.log(
                        "[MOCK PAYMENT] Order already confirmed:",
                        order.id
                    );
                }
            } else {
                console.warn(
                    "[MOCK PAYMENT] No order found for:",
                    transactionId
                );
            }
        } catch (err) {
            console.error(
                "[MOCK PAYMENT] Error updating order in mock flow:",
                err
            );
            // We intentionally fallthrough to return success for dev convenience
        }

        // return the same shape your frontend expects
        return NextResponse.json(
            {
                success: true,
                code: "PAYMENT_SUCCESS",
                state: "COMPLETED",
                transactionId,
                message: "Mocked success (dev)",
            },
            { status: 200 }
        );
    }

    // === PRODUCTION / REAL PATH: call PhonePe status API (unchanged behaviour) ===
    try {
        console.log(
            "[Payment Status Check] Starting status check for transaction:",
            transactionId
        );

        const merchantId = MERCHANT_ID;
        const url = `https://api${ENV === "prod" ? "" : "-preprod"}.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`;

        const stringToSign = `/pg/v1/status/${merchantId}/${transactionId}${SALT_KEY}`;
        const sha256 = crypto
            .createHash("sha256")
            .update(stringToSign)
            .digest("hex");
        const xVerify = `${sha256}###${SALT_INDEX}`;

        console.log("[PhonePe API] Request details:", {
            url,
            merchantId,
            transactionId,
            xVerifyPrefix: xVerify.substring(0, 20) + "...",
        });

        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": xVerify,
                "X-MERCHANT-ID": merchantId,
            },
        });

        console.log("[PhonePe API] Response received:", {
            status: response.status,
            data: response.data,
        });

        const result = response.data;

        // If PhonePe says success
        if (result.success && result.code === "PAYMENT_SUCCESS") {
            console.log(
                "[Payment Status Check] Payment successful, updating order status"
            );

            const order = await prisma.order.findFirst({
                where: { transactionId },
                include: { user: true },
            });

            if (order) {
                if (order.status !== "confirmed") {
                    const updatedOrder = await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "confirmed" },
                        include: { user: true },
                    });
                    console.log(
                        "[Database] Order status updated successfully:",
                        {
                            orderId: updatedOrder.id,
                            newStatus: updatedOrder.status,
                        }
                    );

                    // Send confirmation email if SendGrid configured
                    if (SENDGRID_API_KEY && SENDGRID_FROM_EMAIL) {
                        try {
                            await sendOrderConfirmationEmail(updatedOrder);
                            console.log(
                                "[Email] Confirmation email sent successfully for order:",
                                updatedOrder.id
                            );
                        } catch (emailError: any) {
                            console.error(
                                "[Email] Failed to send confirmation email:",
                                {
                                    error: emailError?.message,
                                    orderId: updatedOrder.id,
                                }
                            );
                        }
                    } else {
                        console.log(
                            "[Email] SendGrid not configured, skipping email send."
                        );
                    }
                } else {
                    console.log(
                        "[Database] Order already confirmed, skipping email:",
                        order.id
                    );
                }
            } else {
                console.error(
                    "[Database] No order found with transactionId:",
                    transactionId
                );
            }

            return NextResponse.json(
                { success: true, code: "PAYMENT_SUCCESS", data: result },
                { status: 200 }
            );
        }

        // Pending status
        if (result.code === "PAYMENT_PENDING") {
            console.log("[Payment Status Check] Payment is still pending");
            return NextResponse.json(
                {
                    success: false,
                    code: "PAYMENT_PENDING",
                    message: "Payment is still being processed",
                },
                { status: 200 }
            );
        }

        // Other / failed
        console.log(
            "[Payment Status Check] Payment failed or unknown status:",
            result.code
        );
        return NextResponse.json(
            {
                success: false,
                code: result.code || "PAYMENT_FAILED",
                message: result.message || "Payment failed or status unknown",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("[Payment Status Check] Unhandled error:", error);
        // If PhonePe call failed with a known response, bubble it up
        if (error?.response?.data) {
            return NextResponse.json(
                {
                    success: false,
                    code: error.response.data.code || "ERROR",
                    message: error.response.data.message || "PhonePe API error",
                    data: error.response.data,
                },
                { status: error.response?.status || 500 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                code: "ERROR",
                message: "Failed to check payment status",
            },
            { status: 500 }
        );
    }
}

// --------------------- helper: sendOrderConfirmationEmail (unchanged) ---------------------
async function sendOrderConfirmationEmail(order: any) {
    const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

    let items;
    try {
        items =
            typeof order.items === "string" && order.items.trim() !== ""
                ? JSON.parse(order.items)
                : order.items;
    } catch (error) {
        console.error("[Email] Error parsing order items:", error);
        items = [];
    }

    if (!Array.isArray(items)) {
        console.warn("[Email] Order items is not an array:", items);
        items = [];
    }

    const userEmail = order.user?.email || "customer@example.com";

    if (!userEmail || userEmail === "customer@example.com") {
        throw new Error(`Invalid email address for order ${order.id}`);
    }

    const msg = {
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: "Your Order is Confirmed! - Scribbl3D",
        html: `
      <!DOCTYPE html>
      <html lang="en"><head><meta charset="utf-8"/></head><body>
      <h1>Order Confirmed</h1>
      <p>Order #${order.id} - ${formatPrice(order.totalAmount)}</p>
      </body></html>
    `,
    };

    try {
        console.log(
            "[Email] Attempting to send confirmation email to:",
            userEmail
        );
        const response = await sgMail.send(msg);
        console.log("[Email] SendGrid API Response:", {
            statusCode: response[0]?.statusCode,
            headers: response[0]?.headers,
            orderId: order.id,
        });
        return true;
    } catch (error: any) {
        console.error("[Email] Failed to send confirmation email:", {
            error: error.message,
            code: error.code,
            response: error.response?.body,
            orderId: order.id,
            userEmail,
        });
        throw error;
    }
}
