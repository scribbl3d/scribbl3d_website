import {
    divider,
    emailLayout,
    heading,
    paragraph,
    statusBadge,
} from "./layout";
import { reviewLinkUrl } from "@/lib/reviews/link";
import type { OrderEmailData } from "./types";

/** "How was your experience?" block: each star opens the review page with that rating selected */
export function reviewRequestBlock(reviewUrl: string): string {
    const stars = [1, 2, 3, 4, 5]
        .map(
            (n) =>
                `<a href="${reviewUrl}?rating=${n}" target="_blank" title="Rate ${n} star${n > 1 ? "s" : ""}" style="display:inline-block;padding:0 4px;font-size:34px;line-height:40px;color:#fbbf24;text-decoration:none;">&#9733;</a>`,
        )
        .join("");

    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;background-color:#f5f7ff;border:1px solid #e0e7ff;border-radius:12px;">
        <tr>
            <td align="center" style="padding:24px 20px;">
                <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#18181b;">How was your experience?</p>
                <div style="margin:0 0 12px;">${stars}</div>
                <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#3f3f46;">Share your honest feedback with us. As a thank-you for your review, we&rsquo;ll send you a coupon for your next SCRIBBL3D purchase.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px auto 8px;">
                    <tr>
                        <td style="background-color:#4f46e5;border-radius:8px;">
                            <a href="${reviewUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Review your order</a>
                        </td>
                    </tr>
                </table>
                <p style="margin:0;font-size:12px;color:#71717a;">It only takes a few minutes.</p>
            </td>
        </tr>
    </table>`;
}

export function orderDeliveredTemplate(data: OrderEmailData): string {
    const { orderId, customerName } = data;

    const firstName = customerName.split(" ")[0] || "there";

    const body = `
        ${heading("Order Delivered!")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`We hope your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> reached you safely and that everything is working just as expected.`)}

        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
            ${statusBadge("Delivered", "green")}
        </div>

        ${reviewRequestBlock(reviewLinkUrl(orderId))}

        ${divider()}

        ${paragraph("If anything didn't meet your expectations, please reply to this email — we'll be glad to assist.")}

        ${paragraph("Thank you again for choosing Scribbl3D. We look forward to supporting your future projects.")}

        <p style="margin:24px 0 0;font-size:14px;color:#3f3f46;">
            Warm regards,<br/>
            <strong>Team Scribbl3D</strong>
        </p>
    `;

    return emailLayout({
        preheader: `Your order #${orderId.slice(-8).toUpperCase()} has been delivered! We'd love your feedback.`,
        body,
    });
}
