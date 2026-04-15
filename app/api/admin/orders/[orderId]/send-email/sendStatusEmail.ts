import { sendEmail } from "@/lib/email/sendEmail";

export interface TrackingInfo {
  trackingNumber?: string;
  trackingLink?: string;
  carrier?: string;
}

export default async function sendStatusEmail(
  order: Record<string, any>,
  status: string,
  trackingInfo?: TrackingInfo
) {
  const userEmail = order.user?.email;
  if (!userEmail) throw new Error("No user email found for this order");

  const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;
  let items: any[];
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch {
    items = [];
  }

  // Email subject and status-specific content
  let subject = `Your Order #${order.id.slice(-6)} Status Update: ${status}`;
  let headerIcon = "";
  let headerTitle = "";
  let headerMsg = "";
  let statusSection = "";
  const ctaLink = "https://scribbl3d.com/profile";
  let ctaText = "View Order Details";

  if (status === "processing") {
    subject = `Your Order is Being 3D Printed! - Scribbl3D`;
    headerIcon = "🖨️";
    headerTitle = "Your Order is Being 3D Printed!";
    headerMsg =
      "We're excited to let you know that your order is now in production and our 3D printers are working on your items.";
    statusSection = `<div class="status-info" style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
      <h3 style="color:#2c5282;margin:0 0 10px 0;">🖨️ Printing in Progress</h3>
      <p style="margin:5px 0;color:#2d3748;">Our team is carefully printing your custom items. We'll notify you as soon as your order is ready to ship!</p>
    </div>`;
    ctaText = "Track Your Order";
  } else if (status === "delivered") {
    subject = `Your Order Has Been Delivered! - Scribbl3D`;
    headerIcon = "🎁";
    headerTitle = "Order Delivered!";
    headerMsg =
      "We hope you enjoy your Scribbl3D creation. Thank you for choosing us for your 3D printing needs!";
    statusSection = `<div class="status-info" style="background:#e6ffe6;padding:20px;border-radius:8px;margin:20px 0;">
      <h3 style="color:#43b581;margin:0 0 10px 0;">🎉 Delivered Successfully</h3>
      <p style="margin:5px 0;color:#2d3748;">Your order has arrived! If you love your product, we'd appreciate a review. If you need help, we're here for you.</p>
      <a href="https://scribbl3d.com/review" style="display:inline-block;margin-top:10px;background:#6a82fb;color:#fff;padding:10px 24px;border-radius:20px;text-decoration:none;font-weight:500;">Leave a Review</a>
    </div>`;
    ctaText = "Order Details & Support";
  } else if (status === "shipped") {
    subject = "Your Order Has Been Shipped! - Scribbl3D";
    headerIcon = "🚚";
    headerTitle = "Your Order is on the Way!";
    headerMsg = "Great news! Your Scribbl3D order has been shipped.";
    statusSection = `<div class="tracking-info">
      <h3>📦 Tracking Information</h3>
      ${
        trackingInfo?.trackingNumber
          ? `<p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>`
          : ""
      }
      ${
        trackingInfo?.trackingLink
          ? `<p><strong>Tracking Link:</strong> <a href="${trackingInfo.trackingLink}" class="tracking-link">Track Your Package</a></p>`
          : ""
      }
      ${
        trackingInfo?.carrier
          ? `<p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>`
          : ""
      }
    </div>`;
    ctaText = "View Order Details";
  } else {
    // fallback for other statuses (e.g. confirmed)
    headerIcon = "🔔";
    headerTitle = `Order Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    headerMsg = `Your order status has been updated to <b>${status}</b>.`;
    statusSection = "";
    ctaText = "View Order Details";
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Order Update</title>
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
        .tracking-info, .status-info { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tracking-info h3, .status-info h3 { color: #2c5282; margin: 0 0 10px 0; }
        .tracking-info p, .status-info p { margin: 5px 0; color: #2d3748; }
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
          <h1>${headerIcon} ${headerTitle}</h1>
          <p>${headerMsg}</p>
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
              <td class="value">${order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-"}</td>
            </tr>
            <tr>
              <td class="label">Total Amount:</td>
              <td class="value">${formatPrice(order.totalAmount)}</td>
            </tr>
          </table>
        </div>
        ${statusSection}
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
        <a href="${ctaLink}" class="cta">${ctaText}</a>
        <div class="footer">
          Need help? <a href="mailto:support@scribbl3d.com" style="color:#6a82fb;">Contact Support</a><br>
          <br>
          &copy; ${new Date().getFullYear()} Scribbl3D. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  // Send via ZeptoMail
  await sendEmail({
    to: userEmail,
    subject,
    html,
  });
}