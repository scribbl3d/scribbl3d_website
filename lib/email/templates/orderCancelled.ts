import {
    button,
    divider,
    emailLayout,
    heading,
    paragraph,
    statusBadge,
} from "./layout";
import type { CancelEmailData } from "./types";

export function orderCancelledTemplate(data: CancelEmailData): string {
    const { orderId, customerName } = data;

    const firstName = customerName.split(" ")[0] || "there";

    const body = `
        ${heading("Order Cancelled")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been successfully cancelled.`)}

        <div style="background-color:#fee2e2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
            ${statusBadge("Cancelled", "red")}
        </div>

        ${paragraph("If a payment was made, the refund has been initiated to your original payment method. Please allow 5–7 business days for the amount to reflect, depending on your bank or payment provider.")}

        ${paragraph("If a Tax Invoice had been generated, it has been cancelled in our records.")}

        ${divider()}

        ${paragraph("If there's anything we can assist you with — whether placing a new order or clarifying details — we're here to help.")}

        ${paragraph("Thank you for your understanding.")}

        ${button("Browse Products", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/`)}

        <p style="margin:24px 0 0;font-size:14px;color:#3f3f46;">
            Best regards,<br/>
            <strong>Team Scribbl3D</strong>
        </p>
    `;

    return emailLayout({
        preheader: `Order #${orderId.slice(-8).toUpperCase()} has been cancelled. Refund initiated.`,
        body,
    });
}
