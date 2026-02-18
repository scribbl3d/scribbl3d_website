import {
    button,
    divider,
    emailLayout,
    heading,
    infoRow,
    infoTable,
    paragraph,
    statusBadge,
} from "./layout";
import type { CancelEmailData } from "./types";

export function orderCancelledTemplate(data: CancelEmailData): string {
    const {
        orderId,
        customerName,
        items,
        totalAmount,
        cancelledBy,
        cancellationReason,
        refundAmount,
    } = data;

    const itemsList = items
        .map(
            (item) => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:14px;color:#71717a;">
                ${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity}
            </td>
        </tr>`,
        )
        .join("");

    const cancelMessage =
        cancelledBy === "customer"
            ? `Hi ${customerName}, your order has been cancelled as requested.`
            : `Hi ${customerName}, we're sorry to inform you that your order has been cancelled by our team.${cancellationReason ? ` Reason: ${cancellationReason}` : ""}`;

    const refundAmt = refundAmount ?? totalAmount;

    const body = `
        ${heading("Order Cancelled")}
        ${paragraph(cancelMessage)}

        <div style="background-color:#fee2e2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div>
                ${statusBadge("Cancelled", "red")}
                <span style="font-size:14px;color:#991b1b;margin-left:8px;">Order #${orderId.slice(-8).toUpperCase()}</span>
            </div>
        </div>

        <!-- Refund info -->
        <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-bottom:24px;">
            <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#1e40af;">💰 Refund Details</h3>
            ${infoTable(
                infoRow(
                    "Refund Amount",
                    `₹${refundAmt.toLocaleString("en-IN")}`,
                ) +
                    infoRow("Status", "Initiated") +
                    infoRow(
                        "Timeline",
                        "5–7 business days to reflect in your original payment method",
                    ),
            )}
        </div>

        ${divider()}

        <!-- Cancelled items -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Cancelled Items</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            ${itemsList}
        </table>

        <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin-bottom:24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="font-size:14px;color:#71717a;">Order Total</td>
                    <td style="font-size:14px;color:#71717a;text-align:right;text-decoration:line-through;">₹${totalAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                    <td style="padding-top:8px;font-size:16px;font-weight:700;color:#166534;">Refund</td>
                    <td style="padding-top:8px;font-size:16px;font-weight:700;color:#166534;text-align:right;">₹${refundAmt.toLocaleString("en-IN")}</td>
                </tr>
            </table>
        </div>

        ${button("Browse Products", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/`)}

        ${paragraph("If you have any questions about your refund or need further assistance, just reply to this email.")}
    `;

    return emailLayout({
        preheader: `Order #${orderId.slice(-8).toUpperCase()} has been cancelled. Refund of ₹${refundAmt.toLocaleString("en-IN")} initiated.`,
        body,
    });
}
