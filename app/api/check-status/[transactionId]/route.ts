import { createFakeDelhiveryShipment } from "@/lib/delhivery-test";
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
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const { transactionId } = await context.params;

        console.log(
            "[Payment Status Check] Starting status check for transaction:",
            transactionId
        );

        if (!transactionId) {
            console.error(
                "[Payment Status Check] Transaction ID missing from params"
            );
            return NextResponse.json(
                { success: false, message: "Transaction ID is required" },
                { status: 400 }
            );
        }
        //! Here we are doing fake upodating statud for confirmed order for testing purpose

        if (process.env.NODE_ENV !== "production") {
            try {
                console.warn(
                    "[DEV MODE] Auto-confirming payment in DB for:",
                    transactionId
                );

                const order = await prisma.order.findFirst({
                    where: { transactionId },
                });

                if (!order) {
                    console.warn(
                        "[DEV MODE] Order not found for transactionId:",
                        transactionId
                    );
                    return NextResponse.json(
                        {
                            success: false,
                            code: "ORDER_NOT_FOUND",
                            message: "Order not found",
                        },
                        { status: 404 }
                    );
                }

                if (order.status !== "confirmed") {
                    const updatedOrder = await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: "confirmed",
                        },
                    });

                    console.log("✅ Order confirmed:", updatedOrder.id);

                    // ✅ PHASE 1 TEST MODE: CREATE FAKE SHIPMENT
                    await createFakeDelhiveryShipment(updatedOrder.id);
                } else {
                    console.log(
                        "[DEV MODE] Order already confirmed:",
                        order.id
                    );
                }

                return NextResponse.json({
                    success: true,
                    code: "PAYMENT_SUCCESS",
                    devMode: true,
                    transactionId,
                });
            } catch (devErr) {
                console.error("[DEV MODE] Auto-confirm failed:", devErr);
                return NextResponse.json(
                    {
                        success: false,
                        code: "DEV_CONFIRM_FAILED",
                        message: "Dev confirm failed",
                    },
                    { status: 500 }
                );
            }
        }

        //! normal code starts here
        const checkStatus = async () => {
            console.log("[PhonePe API] Preparing to call PhonePe status API");

            const merchantId = MERCHANT_ID;
            const url = `https://api${
                ENV === "prod" ? "" : "-preprod"
            }.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`;

            const string = `/pg/v1/status/${merchantId}/${transactionId}${SALT_KEY}`;
            const sha256 = crypto
                .createHash("sha256")
                .update(string)
                .digest("hex");
            const xVerify = `${sha256}###${SALT_INDEX}`;

            console.log("[PhonePe API] Request details:", {
                url,
                merchantId,
                transactionId,
                xVerifyPrefix: xVerify.substring(0, 20) + "...",
            });

            try {
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

                return response.data;
            } catch (error: any) {
                console.error("[PhonePe API] Error in API call:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers,
                });
                throw error;
            }
        };

        const result = await checkStatus();

        if (result.success && result.code === "PAYMENT_SUCCESS") {
            console.log(
                "[Payment Status Check] Payment successful, updating order status"
            );

            try {
                const order = await prisma.order.findFirst({
                    where: { transactionId: transactionId },
                    include: { user: true },
                });

                console.log("[Database] Order lookup result:", order);

                if (order) {
                    if (order.status !== "confirmed") {
                        console.log(
                            "[Database] Updating order status to confirmed for order:",
                            order.id
                        );
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

                        try {
                            await sendOrderConfirmationEmail(updatedOrder);
                            console.log(
                                "[Email] Confirmation email sent successfully for order:",
                                order.id
                            );
                        } catch (emailError: any) {
                            console.error(
                                "[Email] Failed to send confirmation email:",
                                {
                                    error: emailError.message,
                                    orderId: order.id,
                                }
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
            } catch (dbError) {
                console.error(
                    "[Database] Error updating order status:",
                    dbError
                );
                throw dbError;
            }

            return NextResponse.json({
                success: true,
                code: "PAYMENT_SUCCESS",
                data: result,
            });
        }

        if (result.code === "PAYMENT_PENDING") {
            console.log("[Payment Status Check] Payment is still pending");
            return NextResponse.json({
                success: false,
                code: "PAYMENT_PENDING",
                message: "Payment is still being processed",
            });
        }

        console.log(
            "[Payment Status Check] Payment failed or unknown status:",
            result.code
        );
        return NextResponse.json({
            success: false,
            code: result.code || "PAYMENT_FAILED",
            message: result.message || "Payment failed or status unknown",
        });
    } catch (error) {
        console.error("[Payment Status Check] Unhandled error:", error);
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
    // const userName = order.user?.name || "Valued Customer";

    if (!userEmail || userEmail === "customer@example.com") {
        throw new Error(`Invalid email address for order ${order.id}`);
    }

    const msg = {
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: "Your Order is Confirmed! - Scribbl3D",
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Confirmation</title>
      <style>
        body { background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #222; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden; }
        .header { background: linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%); color: #fff; padding: 32px 24px 24px 24px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 2rem; letter-spacing: 1px; }
        .header p { margin: 0; font-size: 1.1rem; opacity: 0.95; }
        .order-summary { padding: 24px; border-bottom: 1px solid #f0f0f0; background: #fafbfc; }
        .order-summary h2 { margin: 0 0 16px 0; font-size: 1.2rem; color: #6a82fb; letter-spacing: 0.5px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .summary-table td { padding: 6px 0; font-size: 1rem; }
        .summary-table .label { color: #888; width: 40%; }
        .summary-table .value { font-weight: 500; color: #222; }
        .items { padding: 24px; }
        .item-card { display: flex; align-items: center; background: #f7f8fa; border-radius: 10px; margin-bottom: 16px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(106,130,251,0.04); }
        .item-img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; margin-right: 16px; background: #eaeaea; }
        .item-details { flex: 1; }
        .item-name { font-weight: 600; font-size: 1.05rem; margin-bottom: 2px; }
        .item-meta { color: #888; font-size: 0.95rem; }
        .cta { display: block; width: fit-content; margin: 32px auto 0 auto; background: linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%); color: #fff !important; text-decoration: none; padding: 12px 32px; border-radius: 24px; font-weight: 600; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(252,92,125,0.12); transition: background 0.2s; }
        .cta:hover { background: linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%); }
        .footer { text-align: center; color: #aaa; font-size: 0.95rem; padding: 24px 16px 16px 16px; background: #fafbfc; }
        @media (max-width: 600px) { .container { border-radius: 0; } .order-summary, .items, .footer { padding: 16px; } .header { padding: 24px 12px 16px 12px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for shopping with Scribbl3D.<br>Your order has been placed and is being processed.</p>
        </div>
        <div class="order-summary">
          <h2>Order Summary</h2>
          <table class="summary-table">
            <tr>
              <td class="label">Order Number:</td>
              <td class="value">#${order.id}</td>
            </tr>
            <tr>
              <td class="label">Order Date:</td>
              <td class="value">${
                  order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })
                      : "-"
              }</td>
            </tr>
            <tr>
              <td class="label">Total Amount:</td>
              <td class="value">${formatPrice(order.totalAmount)}</td>
            </tr>
            <tr>
              <td class="label">Payment Status:</td>
              <td class="value" style="color: #43b581;">Confirmed</td>
            </tr>
          </table>
        </div>
        <div class="items">
          <h2 style="color:#fc5c7d;">Items Ordered</h2>
          ${
              Array.isArray(items) && items.length > 0
                  ? items
                        .map(
                            (item) => `
            <div class="item-card">
              <img src="${
                  item.image || "https://placehold.co/56x56"
              }" class="item-img" alt="${item.name}" />
              <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">
                  Quantity: ${item.quantity} &nbsp;|&nbsp; Price: ${formatPrice(
                      item.price
                  )}
                  ${item.size ? `&nbsp;|&nbsp; Size: ${item.size}` : ""}
                  ${item.color ? `&nbsp;|&nbsp; Color: ${item.color}` : ""}
                </div>
              </div>
            </div>
          `
                        )
                        .join("")
                  : `<div style="color:#888;">No items found.</div>`
          }
        </div>
        <a href="https://scribbl3d.com/profile" class="cta">Track Your Order</a>
        <div class="footer">
          Need help? <a href="mailto:support@scribbl3d.com" style="color:#6a82fb;">Contact Support</a><br>
          <br>
          &copy; ${new Date().getFullYear()} Scribbl3D. All rights reserved.
        </div>
      </div>
    </body>
    </html>
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
