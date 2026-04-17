import type { Discount } from "@/app/ops/control/discounts/types";
import { safeNum } from "./cart-utils";

/**
 * Discount-related utility functions
 */

export function buildValueLabel(d: Discount): string {
    if (d.valueType === "flat")
        return `Save ₹${safeNum(d.value).toLocaleString("en-IN")}`;
    return `${safeNum(d.value)}% OFF`;
}

export function buildDescription(d: Discount): string {
    const parts: string[] = [];
    if (d.valueType === "flat") {
        parts.push(`Flat ₹${safeNum(d.value).toLocaleString("en-IN")} off`);
    } else {
        parts.push(`${safeNum(d.value)}% discount`);
    }
    if (d.minOrderValue && safeNum(d.minOrderValue) > 0) {
        parts.push(
            `on orders above ₹${safeNum(d.minOrderValue).toLocaleString("en-IN")}`
        );
    }
    if (d.maxDiscount && d.valueType === "percentage") {
        parts.push(
            `up to ₹${safeNum(d.maxDiscount).toLocaleString("en-IN")}`
        );
    }
    return parts.join(". ") + ".";
}

export function formatExpiryDate(date: string | null | undefined): string | null {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
