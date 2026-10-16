import { createHmac, timingSafeEqual } from "crypto";

/**
 * Review links: /review/<orderId>.<signature>
 *
 * The signature is an HMAC of the order ID, so links can be regenerated on
 * every share (same link each time) and nothing secret is stored.
 * Uses REVIEW_LINK_SECRET when set, otherwise a key derived from
 * NEXTAUTH_SECRET. Changing either invalidates existing links.
 */

const LINK_VALID_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function signingKey(): string {
    const dedicated = process.env.REVIEW_LINK_SECRET;
    if (dedicated) return dedicated;
    const base = process.env.NEXTAUTH_SECRET;
    if (!base) throw new Error("Review link signing is not configured");
    return createHmac("sha256", base).update("scribbl3d-review-link").digest("hex");
}

function sign(orderId: string): string {
    return createHmac("sha256", signingKey())
        .update(`review:${orderId}`)
        .digest("base64url");
}

export function createReviewToken(orderId: string): string {
    return `${orderId}.${sign(orderId)}`;
}

export function siteBaseUrl(): string {
    return (process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com").replace(/\/$/, "");
}

export function reviewLinkUrl(orderId: string): string {
    return `${siteBaseUrl()}/review/${createReviewToken(orderId)}`;
}

/** Returns the order ID for a valid token, otherwise null */
export function verifyReviewToken(token: unknown): string | null {
    if (typeof token !== "string" || token.length > 200) return null;
    const dot = token.lastIndexOf(".");
    if (dot <= 0) return null;

    const orderId = token.slice(0, dot);
    const provided = Buffer.from(token.slice(dot + 1));
    if (!/^[A-Za-z0-9_-]+$/.test(orderId)) return null;

    try {
        const expected = Buffer.from(sign(orderId));
        return provided.length === expected.length && timingSafeEqual(provided, expected)
            ? orderId
            : null;
    } catch {
        return null;
    }
}

/** Review-system launch date (REVIEW_LAUNCH_AT). Unset = not launched yet. */
export function reviewLaunchDate(): Date | null {
    const raw = process.env.REVIEW_LAUNCH_AT;
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Pre-launch orders: delivered before launch, no recorded delivery date,
 * or the launch date is not set yet.
 */
export function isPreLaunchOrder(deliveredAt: Date | null, launch = reviewLaunchDate()): boolean {
    return !deliveredAt || !launch || deliveredAt < launch;
}

/** Links work for 30 days after delivery; pre-launch orders never expire (L4) */
export function isReviewLinkOpen(deliveredAt: Date | null, now = new Date(), launch = reviewLaunchDate()): boolean {
    if (isPreLaunchOrder(deliveredAt, launch)) return true;
    return now.getTime() <= deliveredAt!.getTime() + LINK_VALID_DAYS * DAY_MS;
}
