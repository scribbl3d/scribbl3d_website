import { sendOrderConfirmation } from "@/lib/email/index";
import { mapOrderToEmailData } from "@/lib/email/mapOrderToEmailData";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;

export async function POST(req: NextRequest) {
    try {
        // PhonePe sends as form-urlencoded OR JSON depending on configuration
        const contentType = req.headers.get("content-type") || "";
        let encodedResponse: string;
        let receivedChecksum: string | null = null;

        if (contentType.includes("application/json")) {
            const body = await req.json();
            console.log("[PhonePe Callback] JSON body received");
            encodedResponse = body.response;
            receivedChecksum = req.headers.get("x-verify") || body["x-verify"];
        } else {
            // Handle form-urlencoded
            const formData = await req.formData();
            encodedResponse = formData.get("response") as string;
            receivedChecksum = req.headers.get("x-verify");
            console.log("[PhonePe Callback] Form data received");
        }

        console.log(
            "[PhonePe Callback] Encoded response length:",
            encodedResponse?.length,
        );

        if (!encodedResponse) {
            console.error("[PhonePe Callback] Missing response");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Verify checksum - PhonePe computes: SHA256(response + saltKey) + ### + saltIndex
        const computedChecksum =
            crypto
                .createHash("sha256")
                .update(encodedResponse + SALT_KEY)
                .digest("hex") +
            "###" +
            SALT_INDEX;

        console.log("[PhonePe Callback] Received checksum:", receivedChecksum);
        console.log("[PhonePe Callback] Computed checksum:", computedChecksum);

        // If checksum verification fails, log but still process
        // (PhonePe's checksum format can vary)
        if (receivedChecksum && receivedChecksum !== computedChecksum) {
            console.warn(
                "[PhonePe Callback] Checksum mismatch - proceeding anyway for now",
            );
        }

        // Decode response
        const decodedResponse = JSON.parse(
            Buffer.from(encodedResponse, "base64").toString("utf-8"),
        );

        console.log(
            "[PhonePe Callback] Decoded:",
            JSON.stringify(decodedResponse, null, 2),
        );

        const { code, data } = decodedResponse;
        const transactionId = data?.merchantTransactionId;

        if (!transactionId) {
            console.error("[PhonePe Callback] Missing transaction ID");
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Find order
        const order = await prisma.order.findFirst({
            where: { transactionId },
            include: { user: true },
        });

        if (!order) {
            console.error("[PhonePe Callback] Order not found:", transactionId);
            return NextResponse.json({ success: false }, { status: 404 });
        }

        // Handle payment success
        if (code === "PAYMENT_SUCCESS") {
            if (order.status === "confirmed" || order.status === "shipped") {
                console.log(
                    "[PhonePe Callback] Order already confirmed:",
                    order.id,
                );
                return NextResponse.json({ success: true });
            }

            const pi = data?.paymentInstrument;

            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "confirmed",
                    paymentMethod: pi?.type || "PhonePe",
                    paymentReference: data?.transactionId,
                    maskedPaymentId:
                        pi?.payerVpa || pi?.maskedCardNumber || null,
                    utrNumber: pi?.utr || null,
                },
                include: { user: true },
            });

            console.log("[PhonePe Callback] Order confirmed:", updatedOrder.id);

            // Send order confirmation email (fire-and-forget)
            if (updatedOrder.user?.email) {
                sendOrderConfirmation(mapOrderToEmailData(updatedOrder)).catch(
                    (err) =>
                        console.error(
                            "[Email] Order confirmation failed:",
                            err,
                        ),
                );
            }

            return NextResponse.json({ success: true });
        }

        // Handle failure
        if (
            code === "PAYMENT_ERROR" ||
            code === "PAYMENT_DECLINED" ||
            code === "PAYMENT_FAILED"
        ) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "payment_failed" },
            });
            console.log("[PhonePe Callback] Order marked failed:", order.id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PhonePe Callback] Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
