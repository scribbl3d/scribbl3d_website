import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PHONEPE_HOST, signRequest, toPaise } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const salt_key = process.env.PHONEPE_SALT_KEY;
const merchant_id = process.env.PHONEPE_MERCHANT_ID;
// const is_prod = process.env.PHONEPE_ENV === "prod";

if (!salt_key || !merchant_id) {
    throw new Error("Missing PhonePe credentials in environment variables");
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Starts a PhonePe payment for an existing order. The amount and transaction
// ID always come from the stored order (priced by /api/create-order), never
// from the request body.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reqBody = await req.json().catch(() => ({}));
        const orderId = typeof reqBody?.orderId === "string" ? reqBody.orderId : null;
        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, userId: true, status: true, totalAmount: true, transactionId: true, shippingAddress: true },
        });
        if (!order || order.userId !== session.user.id) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.status !== "payment_pending" || !order.transactionId) {
            return NextResponse.json({ error: "This order is not awaiting payment" }, { status: 409 });
        }
        const amount = toPaise(order.totalAmount);
        if (!(amount > 0)) {
            return NextResponse.json({ error: "Invalid order amount" }, { status: 409 });
        }

        const address = (typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress) as { phone?: string | string[] } | null;
        const rawPhone = Array.isArray(address?.phone) ? address?.phone[0] : address?.phone;
        const mobileNumber = String(rawPhone || "").replace(/\D/g, "").slice(-10);
        const merchantUserId = `U${session.user.id}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 36);
        const transactionId = order.transactionId;

        let retryCount = 0;
        const MAX_RETRIES = 3;
        const INITIAL_RETRY_DELAY = 1000;

        const makePhonePeRequest = async () => {
            try {
                // Prepare data for PhonePe V1 PAY_PAGE API
                const data: {
                    merchantId: string | undefined;
                    merchantTransactionId: string;
                    merchantUserId: string;
                    amount: number;
                    redirectUrl: string;
                    redirectMode: string;
                    callbackUrl: string;
                    mobileNumber: string;
                    paymentInstrument: {
                        type: string;
                    };
                    orderId?: string;
                } = {
                    merchantId: merchant_id,
                    merchantTransactionId: transactionId,
                    merchantUserId,
                    amount,
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status`,
                    redirectMode: "REDIRECT",
                    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/phonepe-callback`,
                    mobileNumber,
                    paymentInstrument: {
                        type: "PAY_PAGE",
                    },
                };

                // Include the order ID in the payload
                data.orderId = order.id;

                const payload = JSON.stringify(data);
                const payloadMain = Buffer.from(payload).toString("base64");
                const checksum = signRequest(payloadMain, "/pg/v1/pay");
                const prod_URL = `${PHONEPE_HOST}/pg/v1/pay`;

                console.log(
                    `[PhonePe API] Attempt ${retryCount + 1} of ${MAX_RETRIES} for order ${order.id}`
                );

                // Send request to PhonePe API
                const response = await axios({
                    method: "POST",
                    url: prod_URL,
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json",
                        "X-VERIFY": checksum,
                    },
                    data: {
                        request: payloadMain,
                    },
                });

                return response.data;
            } catch (error: any) {
                console.error("[PhonePe API] Error:", {
                    status: error?.response?.status,
                    code: error?.response?.data?.code,
                    message: error?.message,
                });

                // Implement exponential backoff for rate limiting
                if (
                    error?.response?.status === 429 &&
                    retryCount < MAX_RETRIES - 1
                ) {
                    retryCount++;
                    const delayTime =
                        INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
                    console.log(
                        `[PhonePe API] Rate limited. Retrying in ${delayTime}ms...`
                    );
                    await delay(delayTime);
                    return makePhonePeRequest();
                }
                throw error;
            }
        };

        const result = await makePhonePeRequest();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[PhonePe API] Payment error:", {
            status: error?.response?.status,
            code: error?.response?.data?.code,
            message: error?.message,
        });

        return NextResponse.json(
            {
                error: "Payment initiation failed",
                status: error?.response?.status || 500,
            },
            {
                status: error?.response?.status || 500,
            }
        );
    }
}
