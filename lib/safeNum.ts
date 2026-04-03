/** Safely coerce a value to a finite number, defaulting to 0 */
export function safeNum(val: unknown): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/** Format a number for Indian locale display — never returns "NaN" */
export function formatINR(val: unknown): string {
    const n = safeNum(val);
    return n.toLocaleString("en-IN");
}
