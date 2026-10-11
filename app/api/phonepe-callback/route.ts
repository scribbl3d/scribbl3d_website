import { sendAdminNotification } from "@/lib/email/index";
import { confirmPayment, failPayment } from "@/lib/payments/confirmPayment";
import { isValidCallbackChecksum, paymentDetailsFrom } from "@/lib/payments/phonepe";
import { NextRequest, NextResponse } from "next/server";

const FAILURE_CODES = ["PAYMENT_ERROR", "PAYMENT_DECLINED", "PAYMENT_FAILED"];

// PhonePe server-to-server callback. Only a correctly signed callback is
// processed; success is applied through confirmPayment (amount must match the
// stored order total, applied exactly once).
export async function POST(req: NextRequest) {
    try {
        // PhonePe sends JSON or form-urlencoded depending on configuration
        const contentType = req.headers.get("content-type") || "";
        let encodedResponse: string | null = null;
        let receivedChecksum: string | null = null;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            encodedResponse = typeof body?.response === "string" ? body.response : null;
            receivedChecksum = req.headers.get("x-verify") || body?.["x-verify"] || null;
        } else {
            const formData = await req.formData();
            const value = formData.get("response");
            encodedResponse = typeof value === "string" ? value : null;
            receivedChecksum = req.headers.get("x-verify");
        }

        if (!encodedResponse) {
            console.error("[PhonePe Callback] Missing response");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        if (!isValidCallbackChecksum(encodedResponse, receivedChecksum)) {
            console.error("[PhonePe Callback] Rejected: missing or invalid checksum");
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const decoded = JSON.parse(Buffer.from(encodedResponse, "base64").toString("utf-8"));
        const { code, data } = decoded ?? {};
        const transactionId = data?.merchantTransactionId;

        if (!transactionId) {
            console.error("[PhonePe Callback] Missing transaction ID");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        console.log("[PhonePe Callback] Received:", { transactionId, code });

        if (code === "PAYMENT_SUCCESS") {
            const result = await confirmPayment(
                transactionId,
                Number(data?.amount),
                paymentDetailsFrom(data?.paymentInstrument, data?.transactionId),
                "callback",
            );
            if (result === "not_found") {
                // Money received for a transaction no order has (e.g. replaced by a retry)
                console.error("[PhonePe Callback] Paid transaction with no order:", transactionId);
                await sendAdminNotification({
                    type: "payment-review",
                    details: {
                        "Transaction ID": transactionId,
                        "PhonePe reference": data?.transactionId || "—",
                        "Paid (₹)": (Number(data?.amount) / 100).toFixed(2),
                        Issue: "PhonePe reported a successful payment for a transaction that no order has. Please reconcile or refund.",
                    },
                }).catch((err) => console.error("[PhonePe Callback] Review notification failed:", err?.message || err));
                return NextResponse.json({ success: false }, { status: 404 });
            }
            console.log("[PhonePe Callback] Result:", { transactionId, result });
            return NextResponse.json({ success: true });
        }

        if (FAILURE_CODES.includes(code)) {
            const failed = await failPayment(transactionId);
            console.log("[PhonePe Callback] Failure notice:", { transactionId, code, updated: failed });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PhonePe Callback] Error:", error instanceof Error ? error.message : error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
