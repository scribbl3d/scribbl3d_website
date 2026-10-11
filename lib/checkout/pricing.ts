import { calculateDiscount } from "@/app/cart/utils/calculateDiscount";
import { validateDiscountEligibility } from "@/app/cart/utils/validateDiscountEligibility";
import { quoteExpressPackages, type ChargeQuoter } from "@/app/checkout/components/expressShipping";
import { loadCartItems, type CartResponseItem } from "@/lib/cart/loadCartItems";
import { prisma } from "@/lib/prisma";
import { chargeAmount, getDelhiveryCharge } from "@/lib/shipping/delhiveryQuote";
import type { CartItem } from "@/providers/CartProvider";

/**
 * Server-side checkout pricing. The browser shows the same numbers, but the
 * server's figures are what gets stored on the order and charged.
 *
 * Rules (matching app/cart/shopping-cart.tsx, CartProvider and checkout):
 * - subtotal = Σ price × quantity (prices are whole rupees, GST included)
 * - discount = calculateDiscount on the applicable subtotal (item-type scoped)
 * - tax (GST, 18% included) = round(afterDiscount − afterDiscount / 1.18); shipping not taxed
 * - shipping: Surface = free; Express = live Delhivery quote per package
 * - total = subtotal − discount + shipping
 */

export const GST_RATE = 0.18;
const round2 = (n: number) => Math.round(n * 100) / 100;

export type ShippingMode = "Surface" | "Express";

export type CheckoutPricing = {
    subtotal: number;
    discountAmount: number;
    discountCode: string | null;
    tax: number;
    shippingPrice: number;
    totalAmount: number;
};

export type PricingErrorCode =
    | "CART_EMPTY"
    | "ITEM_UNAVAILABLE"
    | "DISCOUNT_INVALID"
    | "EXPRESS_NOT_ALLOWED"
    | "SHIPPING_UNAVAILABLE";

export class CheckoutPricingError extends Error {
    constructor(
        message: string,
        public code: PricingErrorCode,
    ) {
        super(message);
    }
}

/** GST included in a GST-inclusive amount, rounded to the rupee */
export function gstIncluded(amount: number): number {
    const value = Math.max(0, amount);
    return Math.round(value - value / (1 + GST_RATE));
}

export function findActiveDiscount(code: string) {
    return prisma.discount.findFirst({
        where: {
            code: code.trim().toUpperCase(),
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: { itemTypes: true },
    });
}

type ActiveDiscount = NonNullable<Awaited<ReturnType<typeof findActiveDiscount>>>;

/** Same calculation as the cart: applicable subtotal by item type, then calculateDiscount */
export function discountFor(
    discount: ActiveDiscount,
    items: { itemType?: string | null; price?: number | null; quantity?: number | null }[],
): number {
    const allowedTypes =
        discount.scope === "item_type" && discount.itemTypes.length > 0
            ? discount.itemTypes.map((t) => t.itemType as string)
            : undefined;
    const subtotal = items
        .filter((item) => !allowedTypes || allowedTypes.includes(String(item.itemType)))
        .reduce(
            (sum, item) => sum + (Number(item.price) || 0) * Math.max(1, Math.round(Number(item.quantity) || 0)),
            0,
        );
    return calculateDiscount(discount as any, subtotal);
}

const serverChargeQuoter: ChargeQuoter = async (item, originPincode, destinationPincode) =>
    chargeAmount(
        await getDelhiveryCharge({
            shippingMode: "Express",
            weight: item.weight,
            length: item.length,
            breadth: item.breadth,
            height: item.height,
            originPincode,
            destinationPincode,
            paymentType: "Pre-paid",
        }),
    );

function isUnavailable(item: CartResponseItem) {
    return (
        item._orphaned ||
        item._error ||
        item.itemType === "unknown" ||
        !(Number(item.price) > 0) ||
        item.inStock === false
    );
}

export async function priceCheckout(input: {
    userId: string;
    shippingMode: ShippingMode;
    destinationPincode: string | null | undefined;
    discountCode: string | null | undefined;
    quoter?: ChargeQuoter; // tests
}): Promise<CheckoutPricing> {
    const items = await loadCartItems(input.userId);
    if (items.length === 0) {
        throw new CheckoutPricingError("Your cart is empty.", "CART_EMPTY");
    }
    // Never sell missing, zero-priced or out-of-stock items
    const unavailable = items.filter(isUnavailable);
    if (unavailable.length > 0) {
        throw new CheckoutPricingError(
            "Some items in your cart are unavailable or out of stock. Please update your cart.",
            "ITEM_UNAVAILABLE",
        );
    }

    const priced = items.map((item) => ({ ...item, quantity: Math.max(1, Math.round(Number(item.quantity) || 0)) }));
    const subtotal = round2(priced.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));

    let discountAmount = 0;
    let discountCode: string | null = null;
    if (input.discountCode) {
        const discount = await findActiveDiscount(input.discountCode);
        const eligibility = discount
            ? await validateDiscountEligibility(discount.id, input.userId)
            : { eligible: false, reason: "Invalid or expired discount" };
        if (!discount || !eligibility.eligible) {
            throw new CheckoutPricingError(eligibility.reason || "This discount cannot be applied", "DISCOUNT_INVALID");
        }
        discountAmount = discountFor(discount, priced);
        if (discountAmount <= 0) {
            throw new CheckoutPricingError("This coupon is not applicable to your order", "DISCOUNT_INVALID");
        }
        discountCode = discount.code;
    }

    let shippingPrice = 0;
    if (input.shippingMode === "Express") {
        const pincode = String(input.destinationPincode || "").trim();
        if (!/^\d{6}$/.test(pincode)) {
            throw new CheckoutPricingError("A valid delivery pincode is needed for Express shipping.", "SHIPPING_UNAVAILABLE");
        }
        let quoted;
        try {
            quoted = await quoteExpressPackages(priced as unknown as CartItem[], pincode, input.quoter ?? serverChargeQuoter);
        } catch {
            throw new CheckoutPricingError(
                "We couldn't confirm the Express shipping price right now. Please try again or choose Free Shipping.",
                "SHIPPING_UNAVAILABLE",
            );
        }
        if (!quoted.allowed) {
            throw new CheckoutPricingError(quoted.reason || "Express shipping is not available for this order.", "EXPRESS_NOT_ALLOWED");
        }
        if (!(quoted.price > 0)) {
            throw new CheckoutPricingError(
                "We couldn't confirm the Express shipping price right now. Please try again or choose Free Shipping.",
                "SHIPPING_UNAVAILABLE",
            );
        }
        shippingPrice = quoted.price;
    }

    return {
        subtotal,
        discountAmount,
        discountCode,
        tax: gstIncluded(subtotal - discountAmount),
        shippingPrice,
        totalAmount: round2(subtotal - discountAmount + shippingPrice),
    };
}
