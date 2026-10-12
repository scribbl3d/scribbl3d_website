import { createHmac, timingSafeEqual } from "crypto";

/**
 * Proof that an email address passed OTP verification. /api/verify-otp
 * issues it and /api/register requires it, so an account can only be created
 * for an inbox the person controls. It is short-lived and bound to the email;
 * it can only ever create one account because emails are unique.
 */

const PURPOSE = "scribbl3d-register-email";
const TTL_MS = 15 * 60 * 1000;

function secret(): string {
    const value = process.env.NEXTAUTH_SECRET;
    if (!value) throw new Error("Registration tokens are not configured");
    return value;
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

function sign(email: string, expiresAt: number): string {
    return createHmac("sha256", secret())
        .update(`${PURPOSE}|${normaliseEmail(email)}|${expiresAt}`)
        .digest("base64url");
}

export function createRegistrationToken(email: string, now = Date.now()): string {
    const expiresAt = now + TTL_MS;
    return `${expiresAt}.${sign(email, expiresAt)}`;
}

export function verifyRegistrationToken(token: unknown, email: string, now = Date.now()): boolean {
    if (typeof token !== "string") return false;
    const [expiresPart, signature] = token.split(".");
    const expiresAt = Number(expiresPart);
    if (!signature || !Number.isFinite(expiresAt) || expiresAt < now) return false;
    try {
        const expected = Buffer.from(sign(email, expiresAt));
        const actual = Buffer.from(signature);
        return actual.length === expected.length && timingSafeEqual(actual, expected);
    } catch {
        return false;
    }
}
