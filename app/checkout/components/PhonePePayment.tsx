"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { useCheckout } from "@/providers/CheckoutProvider";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PhonePePaymentProps {
    amount: number;
    name: string;
    mobile: string;
}

export default function PhonePePayment({
    amount,
    name,
    mobile,
}: PhonePePaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<
        "idle" | "processing" | "success" | "error"
    >("idle");
    const router = useRouter();
    const { resetCheckout, state } = useCheckout();
    const { cart, clearCart } = useCart();

    const handlePayment = async () => {
        try {
            console.log("[Payment Flow] Initiating payment process");
            setIsLoading(true);
            setPaymentStatus("processing");

            if (!amount || amount <= 0) throw new Error("Invalid amount");

            // Generate stable unique transaction id
            const transactionId = `T${Date.now()}${Math.random()
                .toString(36)
                .slice(2)}`;
            console.log(
                "[Payment Flow] Generated transaction ID:",
                transactionId
            );

            // Create order in DB (server will return orderId)
            const orderResponse = await axios.post("/api/create-order", {
                items: cart,
                totalAmount: amount,
                shippingAddress: state.shippingDetails,
                billingAddress: state.shippingDetails,
                paymentMethod: "PhonePe",
                transactionId,
            });

            console.log(
                "[Payment Flow] Order creation response:",
                orderResponse.data
            );

            if (!orderResponse.data?.orderId) {
                throw new Error("Failed to create order");
            }
            const orderId = orderResponse.data.orderId;

            // Write canonical sessionStorage keys BEFORE redirect
            // Save info so the client can detect the redirect after we come back
            sessionStorage.setItem("phonepe_transaction_id", transactionId);
            sessionStorage.setItem("phonepe_amount", amount.toString());
            sessionStorage.setItem("phonepe_order_id", orderId);

            // Redirect to our local 'phonepe-redirect' route which will forward back to the app
            // This simulates PhonePe returning the user to your redirect endpoint.
            // include amount in the redirect so the landing page can read it directly
            window.location.href = `/api/phonepe-redirect?merchantOrderId=${encodeURIComponent(
                orderId
            )}&transactionId=${encodeURIComponent(transactionId)}&amount=${encodeURIComponent(
                amount.toString()
            )}`;

            // DO NOT clear these keys here — we need them after redirect on the landing page.
            console.log(
                "[PhonePe] MOCK redirect done - saved txn/order/amount to sessionStorage"
            );
            return;

            // REAL flow: call server endpoint which calls PhonePe and returns redirect url
            const payload = {
                name,
                amount,
                mobile,
                MUID: `MUID${Date.now()}${Math.random().toString(36).slice(2)}`,
                transactionId,
                orderId,
            };

            console.log(
                "[Payment Flow] request to /api/order payload:",
                payload
            );
            const response = await axios.post("/api/order", payload);
            console.log("[Payment Flow] /api/order response:", response.data);

            // Find redirect url in normalized or raw shapes
            const redirectUrl =
                response.data?.redirectUrl ||
                response.data?.data?.instrumentResponse?.redirectInfo?.url ||
                response.data?.phonepe?.data?.instrumentResponse?.redirectInfo
                    ?.url ||
                response.data?.phonepe?.data?.redirectInfo?.url ||
                response.data?.phonepe?.data?.redirectUrl ||
                null;

            if (!redirectUrl) {
                console.error(
                    "No redirect url in /api/order response:",
                    response.data
                );
                throw new Error(
                    response.data?.phonepe?.message ||
                        response.data?.message ||
                        "Invalid payment response structure"
                );
            }

            // Persist session (already saved above) and navigate to PhonePe
            console.log(
                "[Payment Flow] Redirecting to payment provider:",
                redirectUrl
            );
            window.location.href = redirectUrl;
        } catch (error: any) {
            console.error("[Payment Flow] Error:", error);
            setPaymentStatus("error");
            toast({
                title: "Payment Error",
                description:
                    error?.response?.data?.details ||
                    error?.message ||
                    "An error occurred while processing your payment.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Polling logic: when the client returns from PhonePe redirect, landing page will call this
    const checkPaymentStatus = useCallback(
        async (transactionId: string, orderId: string) => {
            try {
                setPaymentStatus("processing");

                // simple retry loop with modest backoff
                const maxAttempts = 6;
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    console.log(
                        `[Payment Status] Attempt ${attempt} checking ${transactionId}`
                    );
                    const res = await axios.get(
                        `/api/check-status/${transactionId}`
                    );
                    const body = res.data;
                    console.log("[Payment Status] Response body:", body);

                    const success =
                        (body.success === true &&
                            (body.code === "PAYMENT_SUCCESS" ||
                                body.state === "COMPLETED")) ||
                        body?.state === "COMPLETED";

                    if (success) {
                        console.log(
                            "[Payment Status] Payment success detected"
                        );
                        setPaymentStatus("success");
                        await clearCart();
                        resetCheckout();
                        toast({
                            title: "Payment Successful",
                            description:
                                "Your payment has been processed successfully.",
                        });
                        const storedAmount =
                            sessionStorage.getItem("phonepe_amount") ||
                            String(amount);
                        // canonical params names: use txn and orderId
                        router.push(
                            `/payment/success?txn=${encodeURIComponent(transactionId)}&amount=${encodeURIComponent(storedAmount)}&orderId=${encodeURIComponent(orderId)}`
                        );
                        return;
                    }

                    if (
                        body.code === "PAYMENT_PENDING" ||
                        body.success === false
                    ) {
                        // wait then retry
                        const waitMs = 1000 * Math.min(1 + attempt * 1.5, 6);
                        console.log(
                            `[Payment Status] Pending — waiting ${waitMs}ms then retry`
                        );
                        await new Promise((r) => setTimeout(r, waitMs));
                        continue;
                    }

                    // unexpected or failure -> break
                    console.warn(
                        "[Payment Status] Unexpected response — treating as failed:",
                        body
                    );
                    break;
                }

                // if we exit loop without success:
                setPaymentStatus("error");
                toast({
                    title: "Payment Failed",
                    description:
                        "Your payment could not be verified. Please contact support or try again.",
                    variant: "destructive",
                });
                router.push(`/payment/failure`);
            } catch (err) {
                console.error("[Payment Status] error:", err);
                setPaymentStatus("error");
                toast({
                    title: "Error",
                    description:
                        "An error occurred while checking your payment status.",
                    variant: "destructive",
                });
                router.push(`/payment/failure`);
            }
        },
        [router, amount, clearCart, resetCheckout, toast]
    );

    // landing useEffect: if the page finds a session txn (set earlier), start polling
    useEffect(() => {
        // When user returns from PhonePe, redirect will include query params or we stored them earlier.
        const params = new URLSearchParams(window.location.search);
        const urlTxn =
            params.get("txn") ||
            params.get("txnId") ||
            params.get("transactionId");
        const urlOrder = params.get("orderId") || params.get("merchantOrderId");

        if (urlTxn) {
            console.log("[landing] txn found in url:", urlTxn);
            sessionStorage.setItem("phonepe_transaction_id", urlTxn);
        }
        if (urlOrder) {
            console.log("[landing] orderId found in url:", urlOrder);
            sessionStorage.setItem("phonepe_order_id", urlOrder);
        }

        // polling uses sessionStorage canonical keys
        const txn = sessionStorage.getItem("phonepe_transaction_id");
        const order = sessionStorage.getItem("phonepe_order_id");
        if (txn && order) {
            console.log("[landing] starting checkPaymentStatus for", txn);
            // small delay to allow server-side redirect work
            setTimeout(() => checkPaymentStatus(txn, order), 1000);
        } else {
            console.log("[landing] no txn/order found in sessionStorage");
        }
    }, [checkPaymentStatus]);

    return (
        <>
            {paymentStatus === "idle" && (
                <Button
                    onClick={handlePayment}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        `Pay ${formatPrice(amount)} with PhonePe`
                    )}
                </Button>
            )}
            {paymentStatus === "processing" && (
                <Button disabled className="w-full bg-purple-600 text-white">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Payment...
                </Button>
            )}
            {paymentStatus === "success" && (
                <Button disabled className="w-full bg-green-600 text-white">
                    Payment Successful - Redirecting...
                </Button>
            )}
            {paymentStatus === "error" && (
                <Button
                    onClick={handlePayment}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                    Retry Payment
                </Button>
            )}
        </>
    );
}
