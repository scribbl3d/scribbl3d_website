import { createHmac, timingSafeEqual } from "crypto";

/**
 * Authentication for server-to-server calls to /api/internal routes
 * (e.g. the fire-and-forget shipment sync). The token is an HMAC (with its
 * own label) of INTERNAL_API_SECRET, or NEXTAUTH_SECRET when that is unset,
 * so the secret itself is never sent over the wire.
 */

const HEADER = "x-internal-token";

function internalToken(): string {
    const secret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("Internal API auth is not configured");
    return createHmac("sha256", secret).update("scribbl3d-internal-api").digest("hex");
}

export function internalRequestHeaders(): Record<string, string> {
    return { [HEADER]: internalToken() };
}

export function isInternalRequest(request: Request): boolean {
    const provided = request.headers.get(HEADER);
    if (!provided) return false;
    try {
        const expected = Buffer.from(internalToken());
        const actual = Buffer.from(provided);
        return actual.length === expected.length && timingSafeEqual(actual, expected);
    } catch {
        return false;
    }
}
