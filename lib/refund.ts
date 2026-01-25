import crypto from "crypto";

const PHONEPE_BASE_URL = process.env.PHONEPE_URL!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;

interface RefundParams {
    merchantRefundId: string;
    originalTransactionId: string; // OMO...
    merchantTransactionId: string; // T176...
    amount: number; // paise
}

export async function initiatePhonePeRefund({
    merchantRefundId,
    originalTransactionId,
    merchantTransactionId,
    amount,
}: RefundParams) {
    console.log("🚀 [REFUND] Initiating PhonePe refund");
    console.log("➡️ merchantRefundId:", merchantRefundId);
    console.log("➡️ originalTransactionId:", originalTransactionId);
    console.log("➡️ merchantTransactionId:", merchantTransactionId);
    console.log("➡️ amount (paise):", amount);

    if (!originalTransactionId || !merchantTransactionId) {
        throw new Error(
            "Both originalTransactionId and merchantTransactionId are required",
        );
    }

    const payload = {
        merchantId: MERCHANT_ID,
        merchantRefundId,
        originalTransactionId,
        merchantTransactionId,
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

    console.log("🧾 [REFUND] Payload:", payload);
    console.log("🔐 [REFUND] X-VERIFY:", checksum);

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

    console.log("📦 [REFUND] PhonePe Response:", JSON.stringify(data, null, 2));

    if (!data.success) {
        throw new Error(
            data.message || data.data?.responseCode || "PhonePe refund failed",
        );
    }

    console.log("✅ [REFUND] PhonePe refund initiated");

    return data;
}
