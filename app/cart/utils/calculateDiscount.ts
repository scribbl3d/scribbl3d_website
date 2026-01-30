import { Discount } from "@/app/admin/discounts/types";

/**
 * Minimal shape required for discount calculation.
 * DO NOT use CartItem here to avoid tight coupling.
 */
export type DiscountItem = {
    price: number;
    quantity: number;
    itemType: "product" | "prebuilt" | "printer" | "resin" | "unknown";
};

export function calculateDiscount(
    items: DiscountItem[],
    discount: Discount | null,
): number {
    if (!discount || !discount.isActive) return 0;

    let amount = 0;

    // 🔹 CART LEVEL DISCOUNT
    if (discount.scope === "cart") {
        const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );

        if (
            discount.minCartValue !== undefined &&
            subtotal < discount.minCartValue
        ) {
            return 0;
        }

        amount =
            discount.valueType === "percentage"
                ? (subtotal * discount.value) / 100
                : discount.value;
    }

    // 🔹 ITEM TYPE DISCOUNT
    if (discount.scope === "item_type") {
        items.forEach((item) => {
            if (item.itemType === discount.applicableItemType) {
                const itemTotal = item.price * item.quantity;

                amount +=
                    discount.valueType === "percentage"
                        ? (itemTotal * discount.value) / 100
                        : discount.value * item.quantity;
            }
        });
    }

    return amount;
}
