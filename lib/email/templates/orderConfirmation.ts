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
import type { OrderEmailData } from "./types";

export function orderConfirmationTemplate(data: OrderEmailData): string {
    const {
        orderId,
        customerName,
        items,
        subtotal,
        discountAmount,
        discountCode,
        tax,
        shippingPrice,
        totalAmount,
        shippingAddress,
        paymentMethod,
    } = data;

    const itemsHtml = items
        .map(
            (item) => `
        <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
                <div style="font-size:14px;font-weight:600;color:#18181b;">${item.name}</div>
                ${item.variant ? `<div style="font-size:13px;color:#71717a;margin-top:2px;">${item.variant}</div>` : ""}
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;text-align:center;font-size:14px;color:#3f3f46;">×${item.quantity}</td>
            <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;text-align:right;font-size:14px;font-weight:600;color:#18181b;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
        </tr>`,
        )
        .join("");

    const body = `
        ${heading("Order Places! 🎉")}
        ${paragraph(`Hi ${customerName}, thank you for your order! We've received your order and are getting it ready.`)}

        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div style="display:flex;align-items:center;gap:8px;">
                ${statusBadge("Confirmed", "green")}
                <span style="font-size:14px;color:#166534;margin-left:8px;">Order #${orderId.slice(-8).toUpperCase()}</span>
            </div>
        </div>

        <!-- Items -->
        <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Items Ordered</h3>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr style="border-bottom:2px solid #e4e4e7;">
                    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Item</td>
                    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</td>
                    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Amount</td>
                </tr>
                ${itemsHtml}
            </table>
        </div>

        <!-- Price breakdown -->
        <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin-bottom:24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="padding:4px 0;font-size:14px;color:#71717a;">Subtotal</td>
                    <td style="padding:4px 0;font-size:14px;color:#3f3f46;text-align:right;">₹${subtotal?.toLocaleString("en-IN") || totalAmount.toLocaleString("en-IN")}</td>
                </tr>
                ${
                    discountAmount && discountAmount > 0
                        ? `<tr>
                    <td style="padding:4px 0;font-size:14px;color:#166534;">Discount${discountCode ? ` (${discountCode})` : ""}</td>
                    <td style="padding:4px 0;font-size:14px;color:#166534;text-align:right;">-₹${discountAmount.toLocaleString("en-IN")}</td>
                </tr>`
                        : ""
                }
                ${
                    tax && tax > 0
                        ? `<tr>
                    <td style="padding:4px 0;font-size:14px;color:#71717a;">Tax (GST)</td>
                    <td style="padding:4px 0;font-size:14px;color:#3f3f46;text-align:right;">₹${tax.toLocaleString("en-IN")}</td>
                </tr>`
                        : ""
                }
                ${
                    shippingPrice !== undefined
                        ? `<tr>
                    <td style="padding:4px 0;font-size:14px;color:#71717a;">Shipping</td>
                    <td style="padding:4px 0;font-size:14px;color:#3f3f46;text-align:right;">${shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toLocaleString("en-IN")}`}</td>
                </tr>`
                        : ""
                }
                <tr>
                    <td style="padding:12px 0 4px;font-size:16px;font-weight:700;color:#18181b;border-top:1px solid #e4e4e7;">Total</td>
                    <td style="padding:12px 0 4px;font-size:16px;font-weight:700;color:#18181b;text-align:right;border-top:1px solid #e4e4e7;">₹${totalAmount.toLocaleString("en-IN")}</td>
                </tr>
            </table>
        </div>

        ${divider()}

        <!-- Shipping address -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Shipping Address</h3>
        ${infoTable(
            infoRow("Name", shippingAddress.name) +
                infoRow(
                    "Address",
                    `${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}`,
                ) +
                infoRow(
                    "City",
                    `${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
                ) +
                infoRow("Phone", shippingAddress.phone) +
                (paymentMethod ? infoRow("Payment", paymentMethod) : ""),
        )}

        ${button("View Order", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/profile/orders/${orderId}`)}

        ${paragraph("We'll notify you once your order is shipped. If you have any questions, just reply to this email.")}
    `;

    return emailLayout({
        preheader: `Order #${orderId.slice(-8).toUpperCase()} confirmed — we're preparing your items!`,
        body,
    });
}
