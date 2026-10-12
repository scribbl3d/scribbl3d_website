// lib/refundStatus.ts
import { phonepeRefundHost, signRequest } from "@/lib/payments/phonepe";

export async function checkPhonePeRefundStatus(refundId: string) {
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    if (!merchantId) {
        throw new Error("Missing PhonePe credentials in environment variables");
    }

    const path = `/v3/transaction/${merchantId}/${refundId}/status`;

    const res = await fetch(`${phonepeRefundHost()}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": signRequest("", path),
        },
        signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    console.log("[REFUND-STATUS] PhonePe response:", {
        refundId,
        httpStatus: res.status,
        success: data?.success,
        code: data?.code,
    });

    return data;
}
