/**
 * Format order ID for display
 * @param orderId - Full order ID
 * @param variant - 'short' for abbreviated display, 'full' for complete ID
 * @returns Formatted order ID string
 */
export function formatOrderId(
    orderId: string,
    variant: "short" | "full" = "short",
): string {
    if (variant === "full") {
        return orderId.toUpperCase();
    }
    // Use last 8 characters (more unique than first 8)
    // Format: #XXXXXXXX
    return `#${orderId.slice(-8).toUpperCase()}`;
}

/**
 * Format order ID without the # prefix
 * Useful for places where # is added separately
 */
export function formatOrderIdRaw(orderId: string): string {
    return orderId.slice(-8).toUpperCase();
}
