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

            if (!amount || amount <= 0) {
                throw new Error("Invalid amount");
            }

            // ✅ Generate transaction ID
            const transactionId = `T${Date.now()}${Math.random()
                .toString(36)
                .slice(2)}`;

            console.log(
                "[Payment Flow] Generated transaction ID:",
                transactionId
            );

            // ✅ Create order in DB
            const orderResponse = await axios.post("/api/create-order", {
                items: cart,
                totalAmount: amount,
                shippingAddress: state.shippingDetails,
                billingAddress: state.shippingDetails,
                paymentMethod: "PhonePe",
                transactionId,
            });

            if (!orderResponse.data.orderId) {
                throw new Error("Failed to create order");
            }

            const orderId = orderResponse.data.orderId;

            // ✅ Store for status check
            sessionStorage.setItem("phonepe_transaction_id", transactionId);
            sessionStorage.setItem("phonepe_amount", amount.toString());
            sessionStorage.setItem("phonepe_order_id", orderId);

            // ✅ ✅ ✅ DEV MODE PAYMENT BYPASS (CRITICAL FIX)
            // inside handlePayment, dev bypass branch
            if (process.env.NODE_ENV !== "production") {
                console.warn("✅ DEV MODE: Skipping real PhonePe Checkout");

                // include amount and a paymentSuccess flag so success page doesn't redirect away
                const url = `/payment/success?txnId=${encodeURIComponent(
                    transactionId
                )}&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(
                    amount.toString()
                )}&paymentSuccess=true&dev=true`;

                setTimeout(() => {
                    router.push(url);
                }, 1000);

                return;
            }

            // -----------------------------
            // ✅ REAL PRODUCTION PHONEPE FLOW ONLY
            // -----------------------------
            const data = {
                name,
                amount,
                mobile,
                MUID: `MUID${Date.now()}${Math.random().toString(36).slice(2)}`,
                transactionId,
                orderId,
            };

            const response = await axios.post("/api/order", data);

            if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
                window.location.href =
                    response.data.data.instrumentResponse.redirectInfo.url;
            } else {
                throw new Error("Invalid payment response structure");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            setPaymentStatus("error");

            toast({
                title: "Payment Error",
                description:
                    error.response?.data?.details ||
                    error.message ||
                    "An error occurred while processing your payment.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const checkPaymentStatus = useCallback(
        async (transactionId: string, orderId: string) => {
            try {
                console.log(
                    "[Payment Status] Checking payment status for transaction:",
                    transactionId
                );

                setPaymentStatus("processing");

                const response = await axios.get(
                    `/api/check-status/${transactionId}`
                );

                console.log("[Payment Status] Response:", response.data);

                if (
                    response.data.success &&
                    response.data.code === "PAYMENT_SUCCESS"
                ) {
                    setPaymentStatus("success");
                    await clearCart();
                    resetCheckout();

                    toast({
                        title: "Payment Successful",
                        description:
                            "Your payment has been processed successfully.",
                    });

                    const storedAmount =
                        sessionStorage.getItem("phonepe_amount");

                    router.push(
                        `/payment/success?txnId=${transactionId}&amount=${
                            storedAmount || amount
                        }&orderId=${orderId}`
                    );
                } else if (response.data.code === "PAYMENT_PENDING") {
                    toast({
                        title: "Payment Pending",
                        description: "Your payment is still being processed.",
                    });

                    setTimeout(
                        () => checkPaymentStatus(transactionId, orderId),
                        5000
                    );
                } else {
                    setPaymentStatus("error");

                    toast({
                        title: "Payment Failed",
                        description:
                            response.data.message ||
                            "Your payment could not be processed.",
                        variant: "destructive",
                    });

                    router.push(
                        `/payment/failure?txnId=${transactionId}&orderId=${orderId}`
                    );
                }
            } catch (error) {
                console.error("[Payment Status] Error:", error);

                setPaymentStatus("error");

                toast({
                    title: "Error",
                    description:
                        "An error occurred while checking your payment status.",
                    variant: "destructive",
                });

                router.push("/payment/failure");
            }
        },
        [router, amount, clearCart, resetCheckout]
    );

    useEffect(() => {
        const storedTxnId = sessionStorage.getItem("phonepe_transaction_id");
        const storedOrderId = sessionStorage.getItem("phonepe_order_id");

        if (storedTxnId && storedOrderId) {
            console.log("[Init] Found stored transaction ID:", storedTxnId);
            // 🚨 Prevent React Strict Mode double-run
            // Clear *before* calling checkPaymentStatus
            sessionStorage.removeItem("phonepe_transaction_id");
            sessionStorage.removeItem("phonepe_order_id");

            console.log(
                "[Init] Running payment status check for:",
                storedTxnId
            );
            checkPaymentStatus(storedTxnId, storedOrderId);

            sessionStorage.removeItem("phonepe_transaction_id");
            sessionStorage.removeItem("phonepe_order_id");
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
