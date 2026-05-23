// ─────────────────────────────────────────────────
// lib/email/index.ts
// Central email module — import from "@/lib/email"
// ─────────────────────────────────────────────────

export { sendEmail } from "./sendEmail";
export type {
    CancelEmailData,
    OrderEmailData,
    OrderItem,
    ShipmentEmailData,
} from "./templates/types";
export type { AdminNotificationType } from "./templates/adminNotification";

// Templates
export { adminNotificationTemplate } from "./templates/adminNotification";

// Templates
export { orderCancelledTemplate } from "./templates/orderCancelled";
export { orderConfirmationTemplate } from "./templates/orderConfirmation";
export { orderDeliveredTemplate } from "./templates/orderDelivered";
export { orderShippedTemplate } from "./templates/orderShipped";

// ─────────────────────────────────────────────────
// Convenience functions — use these in your API routes
// ─────────────────────────────────────────────────

import { generateInvoicePdfBuffer } from "@/lib/invoice/generateInvoicePdf";
import { sendEmail } from "./sendEmail";
import type { EmailAttachment } from "./sendEmail-zeptomail";
import { orderCancelledTemplate } from "./templates/orderCancelled";
import { orderConfirmationTemplate } from "./templates/orderConfirmation";
import { orderDeliveredTemplate } from "./templates/orderDelivered";
import { orderShippedTemplate } from "./templates/orderShipped";
import { adminNotificationTemplate } from "./templates/adminNotification";
import type { AdminNotificationType } from "./templates/adminNotification";
import type {
    CancelEmailData,
    OrderEmailData,
    ShipmentEmailData,
} from "./templates/types";

const ADMIN_NOTIFICATION_EMAIL = "logistics.scribbl3d@gmail.com";

/**
 * Send order confirmation email after successful payment.
 * Generates and attaches the Tax Invoice PDF.
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
    let attachments: EmailAttachment[] | undefined;

    try {
        const { buffer, invoiceNumber } = await generateInvoicePdfBuffer(data.orderId);
        attachments = [
            {
                content: buffer.toString("base64"),
                mime_type: "application/pdf",
                name: `Invoice_${invoiceNumber.replace(/\//g, "_")}.pdf`,
            },
        ];
        console.log(`[Email] Invoice PDF generated for order ${data.orderId} (${invoiceNumber})`);
    } catch (err: any) {
        console.error(
            `[Email] Failed to generate invoice PDF for order ${data.orderId}:`,
            err?.message || err,
        );
        // Continue sending the email without attachment
    }

    return sendEmail({
        to: data.customerEmail,
        subject: `Order Confirmed — Tax Invoice #${data.orderId.slice(-8).toUpperCase()}`,
        html: orderConfirmationTemplate(data),
        attachments,
    });
}

/**
 * Send shipment notification when order status is "manifested"
 */
export async function sendOrderShipped(data: ShipmentEmailData) {
    return sendEmail({
        to: data.customerEmail,
        subject: `Your Order Has Been Shipped — #${data.orderId.slice(-8).toUpperCase()}`,
        html: orderShippedTemplate(data),
    });
}

/**
 * Send delivery confirmation
 */
export async function sendOrderDelivered(data: OrderEmailData) {
    return sendEmail({
        to: data.customerEmail,
        subject: `Order Delivered — #${data.orderId.slice(-8).toUpperCase()}`,
        html: orderDeliveredTemplate(data),
    });
}

/**
 * Send cancellation email (works for both customer and admin cancellation)
 */
export async function sendOrderCancelled(data: CancelEmailData) {
    return sendEmail({
        to: data.customerEmail,
        subject: `Order Cancelled — #${data.orderId.slice(-8).toUpperCase()}`,
        html: orderCancelledTemplate(data),
    });
}

/**
 * Send admin notification email to logistics when a new item
 * appears in any admin dashboard table.
 */
export async function sendAdminNotification({
    type,
    details,
    subItems,
}: {
    type: AdminNotificationType;
    details: Record<string, string | number | null | undefined>;
    subItems?: Array<Record<string, string | number | null | undefined>>;
}) {
    console.log(`[Admin Email] sendAdminNotification called — type: ${type}, to: ${ADMIN_NOTIFICATION_EMAIL}`);

    const subjectMap: Record<AdminNotificationType, string> = {
        "order-confirmed": "New Order Confirmed",
        "personalise-response": "New Personalise Form Response",
        "form3d-response": "New 3D Printing Request",
        "prototyping-request": "New Prototyping Request",
        "small-batch-manufacturing": "New Small Batch Manufacturing Request",
        "stock-notification": "New Out-of-Stock Notification",
    };

    try {
        const subject = `[Scribbl3D Admin] ${subjectMap[type]}`;
        console.log(`[Admin Email] Generating template for "${subject}"...`);
        const html = adminNotificationTemplate({ type, details, subItems });
        console.log(`[Admin Email] Template generated (${html.length} chars). Calling sendEmail...`);

        const result = await sendEmail({
            to: ADMIN_NOTIFICATION_EMAIL,
            subject,
            html,
        });

        console.log(`[Admin Email] sendEmail returned:`, JSON.stringify(result));
        return result;
    } catch (err) {
        console.error(`[Admin Email] sendAdminNotification THREW:`, err);
        throw err;
    }
}
