import crypto from "crypto";

const PHONEPE_BASE_URL = process.env.PHONEPE_URL!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;

interface RefundParams {
    merchantRefundId: string;
    originalTransactionId: string;
    amount: number; // paise
}

export async function initiatePhonePeRefund({
    merchantRefundId,
    originalTransactionId,
    amount,
}: RefundParams) {
    const payload = {
        merchantId: MERCHANT_ID,
        merchantRefundId,
        originalTransactionId,
        amount,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64",
    );

    const stringToSign = payloadBase64 + "/pg/v1/refund" + SALT_KEY;

    const checksum =
        crypto.createHash("sha256").update(stringToSign).digest("hex") +
        "###" +
        SALT_INDEX;

    const res = await fetch(`${PHONEPE_BASE_URL}/pg/v1/refund`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
        },
        body: JSON.stringify({
            request: payloadBase64,
        }),
    });

    const data = await res.json();

    if (!data.success) {
        throw new Error(data.message || "PhonePe refund failed");
    }

    return data;
}
