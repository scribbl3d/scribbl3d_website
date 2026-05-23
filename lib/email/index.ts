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

import { sendEmail } from "./sendEmail";
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
 * Send order confirmation email after successful payment
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
    return sendEmail({
        to: data.customerEmail,
        subject: `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()}`,
        html: orderConfirmationTemplate(data),
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
    const subjectMap: Record<AdminNotificationType, string> = {
        "order-confirmed": "New Order Confirmed",
        "personalise-response": "New Personalise Form Response",
        "form3d-response": "New 3D Printing Request",
        "prototyping-request": "New Prototyping Request",
        "small-batch-manufacturing": "New Small Batch Manufacturing Request",
        "stock-notification": "New Out-of-Stock Notification",
    };

    return sendEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `[Scribbl3D Admin] ${subjectMap[type]}`,
        html: adminNotificationTemplate({ type, details, subItems }),
    });
}
