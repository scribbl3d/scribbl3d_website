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
import type { ShipmentEmailData } from "./types";

export function orderShippedTemplate(data: ShipmentEmailData): string {
    const {
        orderId,
        customerName,
        items,
        totalAmount,
        shippingAddress,
        waybill,
        trackingUrl,
        provider,
        estimatedDelivery,
    } = data;

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
        ${heading("Your Order Has Been Shipped! 🚚")}
        ${paragraph(`Hi ${customerName}, great news! Your order has been shipped and is on its way to you.`)}

        <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div style="margin-bottom:8px;">
                ${statusBadge("Shipped", "blue")}
                <span style="font-size:14px;color:#1e40af;margin-left:8px;">Order #${orderId.slice(-8).toUpperCase()}</span>
            </div>
        </div>

        <!-- Tracking info -->
        <div style="background-color:#fafafa;border-radius:8px;padding:20px;margin-bottom:24px;">
            <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">📦 Tracking Details</h3>
            ${infoTable(
                infoRow("Carrier", provider) +
                    infoRow("Tracking ID", waybill) +
                    (estimatedDelivery
                        ? infoRow("Est. Delivery", estimatedDelivery)
                        : ""),
            )}
            ${button("Track Your Order", trackingUrl)}
        </div>

        ${divider()}

        <!-- Items summary -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Items in This Shipment</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            ${itemsList}
        </table>

        <!-- Delivery address -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Delivering To</h3>
        ${paragraph(`${shippingAddress.name}<br/>${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br/>${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>Phone: ${shippingAddress.phone}`)}

        ${button("View Order Details", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/profile/orders/${orderId}`)}

        ${paragraph("You'll receive another email once your order is delivered. If you have any questions, just reply to this email.")}
    `;

    return emailLayout({
        preheader: `Your order #${orderId.slice(-8).toUpperCase()} is on its way! Track it now.`,
        body,
    });
}
