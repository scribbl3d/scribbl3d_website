/**
 * Admin pricing rule: when an original price (MRP) is entered, the selling
 * price must be strictly lower than it. An empty/zero MRP means "no MRP".
 */
export function salePriceError(price: unknown, originalPrice: unknown): string | null {
    const sale = Number(price);
    const mrp = Number(originalPrice);
    if (!(mrp > 0) || !Number.isFinite(sale) || String(price ?? "").trim() === "") return null;
    if (sale >= mrp) return "Price must be lower than the original price (MRP).";
    return null;
}
