import axios from "axios";
import crypto from "crypto";
import { NextResponse } from "next/server";

const salt_key = process.env.PHONEPE_SALT_KEY;
const merchant_id = process.env.PHONEPE_MERCHANT_ID;
// const is_prod = process.env.PHONEPE_ENV === "prod";

if (!salt_key || !merchant_id) {
    throw new Error("Missing PhonePe credentials in environment variables");
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        let retryCount = 0;
        const MAX_RETRIES = 3;
        const INITIAL_RETRY_DELAY = 1000;

        const makePhonePeRequest = async () => {
            try {
                // Prepare data for PhonePe API with payment mode configuration
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
                        paymentModeConfig?: {
                            version: string;
                            enabledPaymentModes: Array<{
                                type: string;
                                flows?: string[];
                                apps?: string[];
                                types?: string[];
                                networks?: string[];
                                geoScopes?: string[];
                                banks?: string[];
                            }>;
                        };
                    };
                    orderId?: string;
                } = {
                    merchantId: merchant_id,
                    merchantTransactionId: reqBody.transactionId,
                    merchantUserId: reqBody.MUID,
                    amount: Math.round(reqBody.amount * 100),
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status`,
                    redirectMode: "REDIRECT",
                    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/phonepe-callback`,
                    mobileNumber: reqBody.mobile,
                    paymentInstrument: {
                        type: "PG_CHECKOUT",
                        paymentModeConfig: {
                            version: "V2",
                            enabledPaymentModes: [
                                // UPI Payments
                                {
                                    type: "UPI",
                                    flows: ["INTENT", "COLLECT"],
                                    apps: ["phonepe", "gpay", "paytm"],
                                },
                                // Credit Cards (includes EMI by default)
                                {
                                    type: "CARD",
                                    types: ["CREDIT_CARD"],
                                    networks: ["VISA", "MASTER_CARD", "RUPAY"],
                                    geoScopes: ["DOMESTIC"],
                                },
                                // Debit Cards
                                {
                                    type: "CARD",
                                    types: ["DEBIT_CARD"],
                                    networks: ["VISA", "MASTER_CARD", "RUPAY"],
                                    geoScopes: ["DOMESTIC"],
                                },
                                // EMI (Credit Card EMI only)
                                {
                                    type: "EMI",
                                    types: ["CREDIT_CARD"],
                                },
                                // Net Banking
                                {
                                    type: "NET_BANKING",
                                    banks: ["HDFC", "ICIC", "SBIN", "AXIS", "KOTAK"],
                                },
                            ],
                        },
                    },
                };

                // Include the order ID in the payload
                if (reqBody.orderId) {
                    data.orderId = reqBody.orderId;
                }

                const payload = JSON.stringify(data);
                const payloadMain = Buffer.from(payload).toString("base64");
                const keyIndex = 1;
                const string = payloadMain + "/pg/v1/pay" + salt_key;
                const sha256 = crypto
                    .createHash("sha256")
                    .update(string)
                    .digest("hex");
                const checksum = sha256 + "###" + keyIndex;

                const prod_URL =
                    "https://api.phonepe.com/apis/hermes/pg/v1/pay";

                console.log(
                    `[PhonePe API] Attempt ${retryCount + 1} of ${MAX_RETRIES}`
                );
                console.log(
                    "[PhonePe API] Request payload:",
                    JSON.stringify(data, null, 2)
                );
                console.log("[PhonePe API] Checksum:", checksum);
                // console.log("[PhonePe API] URL:", apiUrl);

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

                console.log(
                    "[PhonePe API] Response:",
                    JSON.stringify(response.data, null, 2)
                );
                return response.data;
            } catch (error: any) {
                console.error(
                    "[PhonePe API] Error details:",
                    error.response?.data
                );
                console.error("[PhonePe API] Full error:", error);

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
            data: error?.response?.data,
            message: error?.message,
        });

        return NextResponse.json(
            {
                error: "Payment initiation failed",
                details:
                    error?.response?.data || error?.message || "Unknown error",
                status: error?.response?.status || 500,
            },
            {
                status: error?.response?.status || 500,
            }
        );
    }
}
