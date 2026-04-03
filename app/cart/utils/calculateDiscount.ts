import { Discount } from "@/app/ops/control/discounts/types";

export function calculateDiscount(
    discount: Discount,
    subtotal: number,
): number {
    // No applicable items
    if (subtotal <= 0) return 0;

    // Inactive
    if (!discount.isActive) return 0;

    // Expired
    if (discount.expiresAt) {
        const now = new Date();
        if (new Date(discount.expiresAt) < now) return 0;
    }

    // Minimum order value
    if (
        discount.minOrderValue !== null &&
        discount.minOrderValue !== undefined &&
        subtotal < discount.minOrderValue
    ) {
        return 0;
    }

    let discountAmount = 0;

    if (discount.valueType === "percentage") {
        discountAmount = (subtotal * discount.value) / 100;
    }

    if (discount.valueType === "flat") {
        discountAmount = discount.value;
    }

    // Max cap
    if (discount.maxDiscount !== null && discount.maxDiscount !== undefined) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
    }

    // Never discount more than the applicable subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return Math.max(0, Math.round(discountAmount));
}
