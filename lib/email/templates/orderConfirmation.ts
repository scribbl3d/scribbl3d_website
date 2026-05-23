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

    const firstName = customerName.split(" ")[0] || "there";
    const orderDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

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
        ${heading("Order Confirmed — Tax Invoice")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Thank you for your order with Scribbl3D. We've successfully received your payment, and your order is now confirmed.")}

        <!-- Tax Invoice Attachment Notice -->
        <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td style="font-size:14px;color:#1e40af;font-weight:600;">Your Tax Invoice is attached to this email as a PDF.</td>
                </tr>
                <tr>
                    <td style="font-size:13px;color:#3b82f6;padding-top:4px;">Please save it for your records. If GST details were provided, they have been included accordingly.</td>
                </tr>
            </table>
        </div>

        <!-- Order Details -->
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
            ${statusBadge("Confirmed", "green")}
        </div>

        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Order Details</h3>
        ${infoTable(
            infoRow("Order ID", `#${orderId.slice(-8).toUpperCase()}`) +
                infoRow("Order Date", orderDate) +
                (paymentMethod ? infoRow("Payment Method", paymentMethod) : ""),
        )}

        ${divider()}

        <!-- Items Ordered -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Items Ordered</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr style="border-bottom:2px solid #e4e4e7;">
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Item</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Qty</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Amount</td>
            </tr>
            ${itemsHtml}
        </table>

        <!-- Price breakdown -->
        <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin:20px 0 24px;">
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
                    tax !== undefined && tax !== null
                        ? `<tr>
                    <td style="padding:4px 0;font-size:14px;color:#71717a;">Taxes</td>
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
                    <td style="padding:12px 0 4px;font-size:16px;font-weight:700;color:#18181b;border-top:1px solid #e4e4e7;">Total Paid</td>
                    <td style="padding:12px 0 4px;font-size:16px;font-weight:700;color:#18181b;text-align:right;border-top:1px solid #e4e4e7;">₹${totalAmount.toLocaleString("en-IN")}</td>
                </tr>
            </table>
        </div>

        ${divider()}

        <!-- Shipping Address -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Shipping Address</h3>
        ${paragraph(`${shippingAddress.name}<br/>${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}<br/>${shippingAddress.city}, ${shippingAddress.state} – ${shippingAddress.pincode}<br/>Phone: ${shippingAddress.phone}`)}

        ${divider()}

        <!-- Estimated Dispatch Timeline -->
        <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Estimated Dispatch Timeline</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr>
                <td style="padding:6px 0;font-size:14px;color:#3f3f46;">
                    <span style="color:#71717a;">•</span>&nbsp; <strong>Filaments / Resin:</strong> 24–48 working hours
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0;font-size:14px;color:#3f3f46;">
                    <span style="color:#71717a;">•</span>&nbsp; <strong>Printers:</strong> 1–3 working days
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0;font-size:14px;color:#3f3f46;">
                    <span style="color:#71717a;">•</span>&nbsp; <strong>Custom / Prebuilt Products:</strong> As per product timeline
                </td>
            </tr>
        </table>

        ${paragraph("Tracking updates will be shared by our logistics partner once your order is dispatched.")}

        ${button("View Order", `${process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com"}/profile/orders/${orderId}`)}

        ${paragraph("If you need any assistance, simply reply to this email — we're happy to help.")}
        ${paragraph("Thank you for choosing Scribbl3D.")}

        <p style="margin:24px 0 0;font-size:14px;color:#3f3f46;">
            Warm regards,<br/>
            <strong>Team Scribbl3D</strong>
        </p>
    `;

    return emailLayout({
        preheader: `Order #${orderId.slice(-8).toUpperCase()} confirmed — we're preparing your items!`,
        body,
    });
}
