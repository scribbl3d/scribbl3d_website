import { createHash, timingSafeEqual } from "crypto";

/**
 * PhonePe (PG v1) helpers. Payment initiation and status checks both use the
 * production host (initiation has always been production-only). The key
 * (salt) index comes from PHONEPE_KEY_INDEX, then PHONEPE_SALT_INDEX, then "1".
 */

export const PHONEPE_HOST = "https://api.phonepe.com/apis/hermes";

const PHONEPE_REFUND_PRODUCTION_HOST = "https://mercury-t2.phonepe.com";

/**
 * Host for refunds and refund status (v3 credit API). PHONEPE_REFUND_URL
 * overrides it; outside production it must be set explicitly so local and
 * preview cancellations never send real refunds.
 */
export function phonepeRefundHost(): string {
    const configured = process.env.PHONEPE_REFUND_URL?.trim();
    if (configured) return configured.replace(/\/+$/, "");
    if (process.env.NODE_ENV === "production") return PHONEPE_REFUND_PRODUCTION_HOST;
    throw new Error("PHONEPE_REFUND_URL is not configured; refunds are disabled outside production");
}

export const phonepeSaltIndex = () => process.env.PHONEPE_KEY_INDEX || process.env.PHONEPE_SALT_INDEX || "1";

function saltKey(): string {
    const key = process.env.PHONEPE_SALT_KEY;
    if (!key) throw new Error("Missing PhonePe credentials in environment variables");
    return key;
}

/** Rupees (stored order total) → paise (PhonePe amount) */
export function toPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/** X-VERIFY for a request: sha256(payload + path + salt) ### index */
export function signRequest(payloadOrEmpty: string, path: string): string {
    const sha = createHash("sha256").update(payloadOrEmpty + path + saltKey()).digest("hex");
    return `${sha}###${phonepeSaltIndex()}`;
}

/** Server-to-server callback check: X-VERIFY must equal sha256(response + salt) ### index */
export function isValidCallbackChecksum(encodedResponse: string, received: string | null | undefined): boolean {
    if (!received) return false;
    const expected = createHash("sha256").update(encodedResponse + saltKey()).digest("hex") + "###" + phonepeSaltIndex();
    const a = Buffer.from(received.trim());
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

/** Order payment fields from a PhonePe paymentInstrument */
export function paymentDetailsFrom(instrument: any, providerTransactionId: string | null | undefined) {
    const pi = instrument || {};
    const base = { paymentReference: providerTransactionId ?? null };
    if (pi.type === "UPI") {
        return { ...base, paymentMethod: "UPI", maskedPaymentId: pi.payerVpa ?? null, utrNumber: pi.utr ?? null };
    }
    if (pi.type === "CARD") {
        return {
            ...base,
            paymentMethod: pi.cardType ?? "CARD",
            maskedPaymentId: pi.maskedCardNumber ?? null,
            brnNumber: pi.brn ?? null,
            cardNetwork: pi.cardNetwork ?? null,
        };
    }
    return { ...base, paymentMethod: pi.type || "PhonePe", utrNumber: pi.utr ?? null };
}
