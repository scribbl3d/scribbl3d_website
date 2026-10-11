import { recordDiscountUsage } from "@/app/cart/utils/validateDiscountEligibility";
import { sendAdminNotification, sendOrderConfirmation } from "@/lib/email/index";
import { mapOrderToEmailData } from "@/lib/email/mapOrderToEmailData";
import { prisma } from "@/lib/prisma";
import { toPaise } from "./phonepe";

/**
 * Applies a verified PhonePe result to an order exactly once. Used by the
 * server-to-server callback and the status check; whichever runs first wins
 * and performs the side effects (discount usage, cart clearing, emails).
 */

export type PaymentDetails = {
    paymentMethod?: string | null;
    paymentReference?: string | null;
    maskedPaymentId?: string | null;
    utrNumber?: string | null;
    brnNumber?: string | null;
    cardNetwork?: string | null;
};

export type ConfirmResult = "confirmed" | "already_confirmed" | "amount_mismatch" | "not_found" | "not_payable";

const PAID_STATUSES = ["confirmed", "shipped", "delivered", "processing"];
// A verified success for this transaction is honoured even after a failure notice
const CONFIRMABLE_STATUSES = ["payment_pending", "payment_failed"];

export async function confirmPayment(
    transactionId: string,
    amountPaidPaise: number,
    details: PaymentDetails,
    source: "callback" | "status-check",
): Promise<ConfirmResult> {
    const order = await prisma.order.findFirst({
        where: { transactionId },
        select: { id: true, status: true, totalAmount: true },
    });
    if (!order) return "not_found";
    if (PAID_STATUSES.includes(order.status)) return "already_confirmed";
    if (!CONFIRMABLE_STATUSES.includes(order.status)) return "not_payable";

    const expectedPaise = toPaise(order.totalAmount);
    if (amountPaidPaise !== expectedPaise) {
        console.error(`[Payment] Amount mismatch for order ${order.id} (${source}): paid ${amountPaidPaise}, expected ${expectedPaise}`);
        await sendAdminNotification({
            type: "payment-review",
            details: {
                "Order ID": `#${order.id.slice(-8).toUpperCase()}`,
                "Transaction ID": transactionId,
                "Paid (₹)": (amountPaidPaise / 100).toFixed(2),
                "Order total (₹)": order.totalAmount.toFixed(2),
                Issue: "PhonePe reported a successful payment that does not match the order total. The order was NOT confirmed.",
            },
        }).catch((err) => console.error("[Payment] Review notification failed:", err?.message || err));
        return "amount_mismatch";
    }

    // Atomic transition: only one caller can move the order to confirmed
    const updated = await prisma.order.updateMany({
        where: { id: order.id, status: { in: CONFIRMABLE_STATUSES } },
        data: { status: "confirmed", ...details },
    });
    if (updated.count === 0) return "already_confirmed";

    await afterConfirmation(order.id, source);
    return "confirmed";
}

/** Failure notice: only an unpaid order can become failed (never a confirmed one) */
export async function failPayment(transactionId: string): Promise<boolean> {
    const updated = await prisma.order.updateMany({
        where: { transactionId, status: "payment_pending" },
        data: { status: "payment_failed" },
    });
    return updated.count > 0;
}

async function afterConfirmation(orderId: string, source: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
    if (!order) return;
    console.log(`[Payment] Order confirmed via ${source}:`, order.id);

    // Record discount usage only after confirmed payment
    if (order.discountCode && order.userId) {
        try {
            const discount = await prisma.discount.findFirst({
                where: { code: order.discountCode.toUpperCase() },
            });
            if (discount) {
                const existingUsage = await prisma.discountUsage.findFirst({
                    where: { orderId: order.id, discountId: discount.id, userId: order.userId },
                });
                if (!existingUsage) await recordDiscountUsage(discount.id, order.userId, order.id);
            }
        } catch (err) {
            console.error("[Payment] Failed to record discount usage:", err instanceof Error ? err.message : err);
        }
    }

    // Clear the customer's cart
    try {
        const cart = await prisma.cart.findFirst({ where: { userId: order.userId } });
        if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    } catch (err) {
        console.error("[Payment] Failed to clear cart:", err instanceof Error ? err.message : err);
    }

    // Customer confirmation email
    if (order.user?.email) {
        await sendOrderConfirmation(mapOrderToEmailData(order)).catch((err) =>
            console.error("[Email] Order confirmation failed:", err?.message || err),
        );
    }

    // Admin notification
    const items = Array.isArray(order.items) ? (order.items as any[]) : [];
    const raw = order.shippingAddress as any;
    const addr = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
    const shippingAddr = addr
        ? {
              name: addr.name || addr.fullName || "",
              line1: addr.line1 || addr.addressLine1 || addr.street || addr.address || "",
              line2: addr.line2 || addr.addressLine2 || "",
              city: addr.city || "",
              state: addr.state || "",
              pincode: addr.pincode || addr.postalCode || addr.zip || "",
              phone: addr.phone || addr.mobile || "",
          }
        : null;

    await sendAdminNotification({
        type: "order-confirmed",
        details: {
            "Order ID": `#${order.id.slice(-8).toUpperCase()}`,
            "Customer Name": order.user?.name || shippingAddr?.name || "—",
            "Customer Email": order.user?.email || "—",
            Phone: shippingAddr?.phone || "—",
            "Payment Method": order.paymentMethod || "—",
            Subtotal: `₹${order.subtotal}`,
            Discount: order.discountAmount ? `₹${order.discountAmount} (${order.discountCode || ""})` : "—",
            Shipping: `₹${order.shippingPrice} (${order.shippingMode || "Surface"})`,
            Tax: `₹${order.tax || 0}`,
            "Total Amount": `₹${order.totalAmount}`,
            "Shipping Address": shippingAddr
                ? `${shippingAddr.line1}${shippingAddr.line2 ? ", " + shippingAddr.line2 : ""}, ${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode}`
                : "—",
        },
        subItems: items.map((item: any) => ({
            Item: item.name || "—",
            Type: item.itemType || "—",
            Quantity: item.quantity || 1,
            Price: `₹${item.price || 0}`,
            Size: item.size,
            Color: item.color,
        })),
    }).catch((err) => console.error("[Admin Email] Order confirmed notification failed:", err?.message || err));
}
