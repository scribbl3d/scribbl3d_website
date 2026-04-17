import type { CartItem } from "@/providers/CartProvider";

/**
 * Cart-specific utility functions for safe number handling and calculations
 */

/** Safely coerce any value to a finite number, defaulting to 0 */
export function safeNum(val: unknown): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/** Format a number for Indian locale — never returns "NaN" */
export function formatINR(val: unknown): string {
    return safeNum(val).toLocaleString("en-IN");
}

/** Safe line total for a cart item */
export function safeLineTotal(item: { price?: unknown; quantity?: unknown }): number {
    return safeNum(item.price) * safeNum(item.quantity);
}

/** Safe subtotal for an array of cart items, optionally filtered */
export function safeSubtotal(
    items: CartItem[],
    filterFn?: (item: CartItem) => boolean
): number {
    const list = filterFn ? items.filter(filterFn) : items;
    return list.reduce((sum, item) => sum + safeLineTotal(item), 0);
}
