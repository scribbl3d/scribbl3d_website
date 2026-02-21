// ─────────────────────────────────────────────────
// lib/email/mapOrderToEmailData.ts
// Transforms your Prisma Order into email template data
// ─────────────────────────────────────────────────

import type {
    CancelEmailData,
    OrderEmailData,
    OrderItem,
    ShipmentEmailData,
} from "./templates/types";

/**
 * Map Prisma Order (with user relation) to OrderEmailData
 *
 * Usage:
 *   const order = await prisma.order.findUnique({
 *       where: { id: orderId },
 *       include: { user: true },
 *   });
 *   const emailData = mapOrderToEmailData(order);
 */
export function mapOrderToEmailData(order: any): OrderEmailData {
    // Parse items from JSON
    const items: OrderItem[] = parseOrderItems(order.items);

    // Parse shipping address from JSON
    const shippingAddress = parseAddress(order.shippingAddress);

    return {
        orderId: order.id,
        customerName: order.user?.name || shippingAddress.name || "Customer",
        customerEmail: order.user?.email || "",
        items,
        subtotal: order.subtotal ?? order.totalAmount,
        discountAmount: order.discountAmount ?? 0,
        discountCode: order.discountCode ?? undefined,
        tax: order.tax ?? 0,
        shippingPrice: order.shippingPrice ?? 0,
        totalAmount: order.totalAmount,
        shippingAddress,
        paymentMethod: formatPaymentMethod(order),
    };
}

/**
 * Extend with shipment data for shipped emails
 */
export function mapOrderToShipmentEmailData(
    order: any,
    shipment: { waybill: string; trackingUrl: string; provider?: string },
    estimatedDelivery?: string,
): ShipmentEmailData {
    return {
        ...mapOrderToEmailData(order),
        waybill: shipment.waybill,
        trackingUrl:
            shipment.trackingUrl ||
            `https://www.delhivery.com/track/package/${shipment.waybill}`,
        provider: shipment.provider || "Delhivery",
        estimatedDelivery,
    };
}

/**
 * Extend with cancellation data
 */
export function mapOrderToCancelEmailData(
    order: any,
    cancelledBy: "customer" | "admin",
    cancellationReason?: string,
): CancelEmailData {
    return {
        ...mapOrderToEmailData(order),
        cancelledBy,
        cancellationReason,
        refundStatus: order.refundStatus ?? "initiated",
        refundAmount: order.totalAmount,
    };
}

// ─────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────

function parseOrderItems(items: any): OrderItem[] {
    if (!items) return [];

    // Handle both array and stringified JSON
    const parsed = typeof items === "string" ? JSON.parse(items) : items;

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => ({
        name: item.name || item.productName || "Product",
        quantity: item.quantity || 1,
        price: item.price || item.unitPrice || 0,
        image: item.image || item.images?.[0] || undefined,
        variant: buildVariantString(item),
    }));
}

function buildVariantString(item: any): string | undefined {
    const parts: string[] = [];
    if (item.color || item.colour) parts.push(item.color || item.colour);
    if (item.weight) parts.push(item.weight);
    if (item.size) parts.push(item.size);
    if (item.variant) parts.push(item.variant);
    return parts.length > 0 ? parts.join(" / ") : undefined;
}

function parseAddress(address: any) {
    if (!address) {
        return {
            name: "",
            line1: "",
            city: "",
            state: "",
            pincode: "",
            phone: "",
        };
    }
    const parsed = typeof address === "string" ? JSON.parse(address) : address;
    return {
        name: parsed.name || parsed.fullName || "",
        line1: parsed.line1 || parsed.addressLine1 || parsed.street || "",
        line2: parsed.line2 || parsed.addressLine2 || undefined,
        city: parsed.city || "",
        state: parsed.state || "",
        pincode: parsed.pincode || parsed.postalCode || parsed.zip || "",
        phone: parsed.phone || parsed.mobile || "",
    };
}

function formatPaymentMethod(order: any): string | undefined {
    if (!order.paymentMethod) return undefined;
    const method = order.paymentMethod.toUpperCase();
    if (method === "UPI")
        return `UPI${order.maskedPaymentId ? ` (${order.maskedPaymentId})` : ""}`;
    if (method.includes("CARD"))
        return `${order.cardNetwork || "Card"}${order.maskedPaymentId ? ` ending ${order.maskedPaymentId}` : ""}`;
    return order.paymentMethod;
}
