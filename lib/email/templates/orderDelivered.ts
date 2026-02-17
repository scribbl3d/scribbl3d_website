import {
    button,
    divider,
    emailLayout,
    heading,
    paragraph,
    statusBadge,
} from "./layout";
import type { OrderEmailData } from "./types";

export function orderDeliveredTemplate(data: OrderEmailData): string {
    const { orderId, customerName, items, totalAmount } = data;

    const itemsList = items
        .map(
            (item) => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:14px;color:#18181b;">
                ${item.name}${item.variant ? ` <span style="color:#71717a;">(${item.variant})</span>` : ""} × ${item.quantity}
            </td>
        </tr>`,
        )
        .join("");

    const body = `
        ${heading("Your Order Has Been Delivered! ✅")}
        ${paragraph(`Hi ${customerName}, your order has been successfully delivered. We hope you love your new items!`)}

        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div>
                ${statusBadge("Delivered", "green")}
                <span style="font-size:14px;color:#166534;margin-left:8px;">Order #${orderId.slice(-8).toUpperCase()}</span>
            </div>
        </div>

        <!-- Items -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Items Delivered</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            ${itemsList}
        </table>

        <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:14px;color:#71717a;">Order Total</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#18181b;">₹${totalAmount.toLocaleString("en-IN")}</p>
        </div>

        ${divider()}

        <!-- Feedback CTA -->
        <div style="text-align:center;margin:24px 0;">
            <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#18181b;">How was your experience?</h3>
            <p style="margin:0 0 16px;font-size:14px;color:#71717a;">Your feedback helps us improve and serve you better.</p>
            ${button("Leave Feedback", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/profile/orders/${orderId}`)}
        </div>

        ${paragraph("If there's any issue with your order, please don't hesitate to reach out. We're here to help!")}
    `;

    return emailLayout({
        preheader: `Your order #${orderId.slice(-8).toUpperCase()} has been delivered! How was your experience?`,
        body,
    });
}
