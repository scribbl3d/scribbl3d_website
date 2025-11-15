import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import sendStatusEmail from "./send-email/sendStatusEmail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;

sgMail.setApiKey(SENDGRID_API_KEY);

async function sendShippingEmail(order: any, trackingInfo: any) {
  const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

  let items;
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (error) {
    console.error("[Email] Error parsing order items:", error);
    items = [];
  }

  const userEmail = order.user?.email;
  if (!userEmail) {
    throw new Error(`Invalid email address for order ${order.id}`);
  }

  const msg = {
    to: userEmail,
    from: SENDGRID_FROM_EMAIL,
    subject: "Your Order Has Been Shipped! - Scribbl3D",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Shipped</title>
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
        .tracking-info { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tracking-info h3 { color: #2c5282; margin: 0 0 10px 0; }
        .tracking-info p { margin: 5px 0; color: #2d3748; }
        .tracking-link { display: inline-block; background: #4299e1; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px; }
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
          <h1>🚚 Your Order is on the Way!</h1>
          <p>Great news! Your Scribbl3D order has been shipped.</p>
        </div>
        <div class="order-summary">
          <h2>Order Summary</h2>
          <table class="summary-table">
            <tr>
              <td class="label">Order Number:</td>
              <td class="value">#${order.id.slice(-6)}</td>
            </tr>
            <tr>
              <td class="label">Order Date:</td>
              <td class="value">${new Date(order.createdAt).toLocaleString(
                "en-IN",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                }
              )}</td>
            </tr>
            <tr>
              <td class="label">Total Amount:</td>
              <td class="value">${formatPrice(order.totalAmount)}</td>
            </tr>
          </table>
        </div>
        <div class="tracking-info">
          <h3>📦 Tracking Information</h3>
          ${
            trackingInfo.trackingNumber
              ? `<p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>`
              : ""
          }
          ${
            trackingInfo.trackingLink
              ? `<p><strong>Tracking Link:</strong> <a href="${trackingInfo.trackingLink}" class="tracking-link">Track Your Package</a></p>`
              : ""
          }
          ${
            trackingInfo.carrier
              ? `<p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>`
              : ""
          }
        </div>
        <div class="items">
          <h2 style="color:#fc5c7d;">Items in Your Order</h2>
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
        <a href="https://scribbl3d.com/profile" class="cta">View Order Details</a>
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
    await sgMail.send(msg);
    return true;
  } catch (error: any) {
    console.error("[Email] Failed to send shipping email:", {
      error: error.message,
      code: error.code,
      response: error.response?.body,
      orderId: order.id,
      userEmail,
    });
    throw error;
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const { status, trackingInfo, notifyCustomer } = await req.json();

    // Update the order status and tracking info in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingInfo: trackingInfo ? JSON.stringify(trackingInfo) : undefined,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Only send email if notifyCustomer is true
    if (notifyCustomer) {
      if (status === "shipped" && trackingInfo) {
        try {
          await sendShippingEmail(updatedOrder, trackingInfo);
        } catch (emailError) {
          console.error("Failed to send shipping email:", emailError);
        }
      } else if (status === "delivered") {
        try {
          await sendStatusEmail(updatedOrder, "delivered", trackingInfo);
        } catch (emailError) {
          console.error("Failed to send delivered email:", emailError);
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
