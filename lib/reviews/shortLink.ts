import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { siteBaseUrl } from "./link";

/**
 * Short review links: /r/<code> redirects to the signed /review/<token> link.
 * The code is random (not derived from the order ID), stored once on
 * ReviewRequest and reused on every share.
 */

// No look-alike characters (0/O, 1/l/I)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const CODE_LENGTH = 8;
const MAX_ATTEMPTS = 5;

export const SHORT_CODE_PATTERN = /^[A-Za-z0-9]{8}$/;

function generateShortCode(): string {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
    return code;
}

function isUniqueViolation(err: unknown): boolean {
    return (err as { code?: string } | null)?.code === "P2002";
}

/** Returns the order's short code, creating it on first use */
export async function ensureReviewShortCode(orderId: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const existing = await prisma.reviewRequest.findUnique({ where: { orderId }, select: { shortCode: true } });
        if (existing?.shortCode) return existing.shortCode;

        const code = generateShortCode();
        try {
            if (!existing) {
                await prisma.reviewRequest.create({ data: { orderId, shortCode: code } });
                return code;
            }
            // Only fill an empty code, so a concurrent share keeps the first one
            const { count } = await prisma.reviewRequest.updateMany({
                where: { orderId, shortCode: null },
                data: { shortCode: code },
            });
            if (count === 1) return code;
        } catch (err) {
            // Code collision, or the request row was created concurrently: retry
            if (!isUniqueViolation(err)) throw err;
        }
    }
    throw new Error("Could not create a short review link");
}

export async function reviewShortUrl(orderId: string): Promise<string> {
    return `${siteBaseUrl()}/r/${await ensureReviewShortCode(orderId)}`;
}

/** Order ID for a short code, otherwise null */
export async function resolveReviewShortCode(code: unknown): Promise<string | null> {
    if (typeof code !== "string" || !SHORT_CODE_PATTERN.test(code)) return null;
    const request = await prisma.reviewRequest.findUnique({ where: { shortCode: code }, select: { orderId: true } });
    return request?.orderId ?? null;
}
