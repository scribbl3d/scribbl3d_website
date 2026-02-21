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
    const { orderId, customerName } = data;

    const firstName = customerName.split(" ")[0] || "there";

    const body = `
        ${heading("Order Delivered!")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`We hope your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> reached you safely and that everything is working just as expected.`)}

        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
            ${statusBadge("Delivered", "green")}
        </div>

        ${paragraph("If you have a moment, we would truly appreciate your feedback. Your review helps us improve and assists other customers in making informed decisions.")}

        ${button("Leave a Review", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/profile/orders/${orderId}`)}

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
