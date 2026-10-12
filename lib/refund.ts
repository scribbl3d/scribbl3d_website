import { phonepeRefundHost, signRequest } from "@/lib/payments/phonepe";

const REFUND_PATH = "/v3/credit/backToSource";

interface RefundParams {
    refundTransactionId: string; // NEW refund txn id
    providerReferenceId: string; // OMOxxxx (PhonePe txn id)
    amount: number; // paise
    orderId: string;
}

/** PhonePe answered and refused the refund (safe to retry with a new ID) */
export class PhonePeRefundRejectedError extends Error {}

/** Why a refund cannot be sent right now (missing configuration), or null */
export function refundConfigError(): string | null {
    if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY) {
        return "Missing PhonePe credentials in environment variables";
    }
    try {
        phonepeRefundHost();
        return null;
    } catch (err) {
        return err instanceof Error ? err.message : "PhonePe refunds are not configured";
    }
}

// Never log the payload, signature or salt: only IDs and status codes.
export async function initiatePhonePeRefund({
    refundTransactionId,
    providerReferenceId,
    amount,
    orderId,
}: RefundParams) {
    if (!providerReferenceId) {
        throw new Error("providerReferenceId (OMO id) is required");
    }
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    if (!merchantId) {
        throw new Error("Missing PhonePe credentials in environment variables");
    }
    const host = phonepeRefundHost();

    const payload = {
        merchantId,
        transactionId: refundTransactionId, // refund txn id
        providerReferenceId, // OMO id
        amount,
        merchantOrderId: orderId,
        message: "Refund for cancelled order",
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64",
    );

    const res = await fetch(`${host}${REFUND_PATH}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": signRequest(payloadBase64, REFUND_PATH),
        },
        body: JSON.stringify({
            request: payloadBase64,
        }),
        signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    console.log("[REFUND] PhonePe response:", {
        orderId,
        refundTransactionId,
        httpStatus: res.status,
        success: data?.success,
        code: data?.code,
    });

    if (!data.success) {
        throw new PhonePeRefundRejectedError(
            data.message || data.code || "PhonePe refund failed",
        );
    }

    return data;
}
