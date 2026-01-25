// lib/refundStatus.ts
import crypto from "crypto";

const PHONEPE_BASE_URL = process.env.PHONEPE_URL!;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;

export async function checkPhonePeRefundStatus(refundId: string) {
    console.log("🔍 [REFUND-STATUS] Checking refund status");
    console.log("➡️ refundTransactionId:", refundId);

    const path = `/v3/transaction/${MERCHANT_ID}/${refundId}/status`;
    const stringToSign = path + SALT_KEY;

    const checksum =
        crypto.createHash("sha256").update(stringToSign).digest("hex") +
        "###" +
        SALT_INDEX;

    console.log("🔐 [REFUND-STATUS] X-VERIFY:", checksum);

    const res = await fetch(`${PHONEPE_BASE_URL}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
        },
    });

    const data = await res.json();

    console.log("📦 [REFUND-STATUS] PhonePe Response:", data);

    return data;
}
