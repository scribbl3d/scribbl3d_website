import crypto from "crypto";

const PHONEPE_BASE_URL = "https://mercury-t2.phonepe.com"; // PROD
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;

interface RefundParams {
    refundTransactionId: string; // NEW refund txn id
    providerReferenceId: string; // OMOxxxx (PhonePe txn id)
    amount: number; // paise
    orderId: string;
}

export async function initiatePhonePeRefund({
    refundTransactionId,
    providerReferenceId,
    amount,
    orderId,
}: RefundParams) {
    console.log("=================================================");
    console.log(" [REFUND] NEW REFUND FUNCTION LOADED (v3 CREDIT)");
    console.log(
        " [REFUND] Endpoint:",
        `${PHONEPE_BASE_URL}/v3/credit/backToSource`,
    );
    console.log("🧩 [REFUND] Inputs:", {
        refundTransactionId,
        providerReferenceId,
        amount,
        orderId,
    });

    if (!providerReferenceId) {
        throw new Error(" providerReferenceId (OMO id) is required");
    }

    const payload = {
        merchantId: MERCHANT_ID,
        transactionId: refundTransactionId, // refund txn id
        providerReferenceId, // OMO id
        amount,
        merchantOrderId: orderId,
        message: "Refund for cancelled order",
    };

    console.log(" [REFUND] FINAL PAYLOAD (before base64):", payload);

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64",
    );

    console.log("📦 [REFUND] Base64 Payload:", payloadBase64);

    const stringToSign = payloadBase64 + "/v3/credit/backToSource" + SALT_KEY;

    const checksum =
        crypto.createHash("sha256").update(stringToSign).digest("hex") +
        "###" +
        SALT_INDEX;

    console.log(" [REFUND] StringToSign:", stringToSign);
    console.log(" [REFUND] X-VERIFY:", checksum);

    const res = await fetch(`${PHONEPE_BASE_URL}/v3/credit/backToSource`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
        },
        body: JSON.stringify({
            request: payloadBase64,
        }),
    });

    console.log(" [REFUND] HTTP STATUS:", res.status);

    const data = await res.json();

    console.log("📦 [REFUND] PHONEPE RESPONSE (RAW):");
    console.log(JSON.stringify(data, null, 2));
    console.log("=================================================");

    if (!data.success) {
        throw new Error(
            data.message || data.payResponseCode || "PhonePe refund failed",
        );
    }

    return data;
}
