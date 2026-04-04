"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { useCheckout } from "@/providers/CheckoutProvider";
import axios from "axios";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PaymentStatus() {
    const router = useRouter();
    const searchParams = useSearchParams()!;
    const { resetCheckout } = useCheckout();
    const { clearCart } = useCart();

    const [status, setStatus] = useState<
        "checking" | "pending" | "success" | "failed" | "timeout"
    >("checking");
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    // Refs to prevent race conditions
    const isCheckingRef = useRef(false);
    const hasCompletedRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const transactionRef = useRef<{
        transactionId: string | null;
        orderId: string | null;
        amount: string | null;
        name: string | null;
        mobile: string | null;
    }>({ transactionId: null, orderId: null, amount: null, name: null, mobile: null });

    const MAX_RETRIES = 10; // 50 seconds total (10 × 5s)
    const RETRY_INTERVAL = 5000; // 5 seconds

    useEffect(() => {
        // Prevent running if already completed
        if (hasCompletedRef.current) return;

        // Get transaction details once and store in ref
        const transactionId =
            searchParams.get("transactionId") ||
            sessionStorage.getItem("phonepe_transaction_id");
        const orderId = sessionStorage.getItem("phonepe_order_id");
        const amount = sessionStorage.getItem("phonepe_amount");
        const name = sessionStorage.getItem("phonepe_name");
        const mobile = sessionStorage.getItem("phonepe_mobile");

        transactionRef.current = { transactionId, orderId, amount, name, mobile };

        if (!transactionId) {
            console.error("[PaymentStatus] Missing transaction ID");
            setStatus("failed");
            setErrorMessage(
                "Could not verify payment - missing transaction ID",
            );
            toast({
                title: "Error",
                description:
                    "Could not verify payment - missing transaction ID",
                variant: "destructive",
            });
            setTimeout(() => router.replace("/checkout"), 2000);
            return;
        }

        const checkPaymentStatus = async (attempt: number) => {
            // Prevent duplicate concurrent calls
            if (isCheckingRef.current || hasCompletedRef.current) {
                return;
            }

            isCheckingRef.current = true;
            setRetryCount(attempt);

            try {
                const response = await axios.get(
                    `/api/check-status/${transactionRef.current.transactionId}`,
                    { timeout: 15000 }, // 15 second timeout for API call
                );

                const { success, code, message } = response.data;

                if (success && code === "PAYMENT_SUCCESS") {
                    handleSuccess();
                } else if (code === "PAYMENT_PENDING") {
                    handlePending(attempt);
                } else {
                    handleFailure(message || "Payment failed");
                }
            } catch (error: any) {
                console.error("[PaymentStatus] Error:", error);
                handleError(attempt, error);
            }
        };

        const handleSuccess = async () => {
            hasCompletedRef.current = true;
            isCheckingRef.current = false;
            setStatus("success");

            // Clear session storage
            sessionStorage.removeItem("phonepe_transaction_id");
            sessionStorage.removeItem("phonepe_order_id");
            sessionStorage.removeItem("phonepe_amount");
            sessionStorage.removeItem("phonepe_name");
            sessionStorage.removeItem("phonepe_mobile");

            // Clear cart and reset checkout
            try {
                await clearCart();
                resetCheckout();
            } catch (e) {
                console.error("[PaymentStatus] Error clearing cart:", e);
            }

            // Redirect after brief delay
            setTimeout(() => {
                const { transactionId, orderId, amount } =
                    transactionRef.current;
                router.replace(
                    `/payment/success?txnId=${transactionId}&amount=${amount}&orderId=${orderId}`,
                );
            }, 1000);
        };

        const handlePending = (attempt: number) => {
            setStatus("pending");
            isCheckingRef.current = false;

            if (attempt < MAX_RETRIES - 1) {
                timeoutRef.current = setTimeout(() => {
                    checkPaymentStatus(attempt + 1);
                }, RETRY_INTERVAL);
            } else {
                handleTimeout();
            }
        };

        const handleFailure = (message: string) => {
            hasCompletedRef.current = true;
            isCheckingRef.current = false;
            setStatus("failed");
            setErrorMessage(message);

            toast({
                title: "Payment Failed",
                description: message,
                variant: "destructive",
            });
        };

        const handleTimeout = () => {
            hasCompletedRef.current = true;
            isCheckingRef.current = false;
            setStatus("timeout");

            toast({
                title: "Verification Timeout",
                description:
                    "Payment verification is taking longer than expected.",
            });
        };

        const handleError = (attempt: number, error: any) => {
            isCheckingRef.current = false;

            // Network error or timeout - retry
            if (attempt < MAX_RETRIES - 1) {
                timeoutRef.current = setTimeout(() => {
                    checkPaymentStatus(attempt + 1);
                }, RETRY_INTERVAL);
            } else {
                handleTimeout();
            }
        };

        // Start checking
        checkPaymentStatus(0);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency - run once on mount

    const handleRetryPayment = async () => {
        const { orderId, amount, name, mobile } =
            transactionRef.current;

        if (!orderId || !amount) {
            toast({
                title: "Error",
                description: "Missing payment details. Please try again from checkout.",
                variant: "destructive",
            });
            router.push("/checkout");
            return;
        }

        setIsRetrying(true);

        try {
            // Generate a new transaction ID (PhonePe rejects reused ones)
            const newTransactionId = `TXN${Date.now()}${Math.random()
                .toString(36)
                .slice(2, 8)}`;

            // Update the order in DB with the new transaction ID
            const retryRes = await axios.post("/api/orders/retry-payment", {
                orderId,
                newTransactionId,
            });

            if (!retryRes.data?.success) {
                throw new Error("Failed to prepare retry");
            }

            // Update refs and sessionStorage with new transaction ID
            transactionRef.current.transactionId = newTransactionId;
            sessionStorage.setItem("phonepe_transaction_id", newTransactionId);

            // Initiate PhonePe payment with the new transaction ID
            const response = await axios.post("/api/order", {
                name: name || "Customer",
                amount: parseFloat(amount),
                mobile: mobile || "",
                transactionId: newTransactionId,
                orderId,
                MUID: `MUID${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
            });

            if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
                window.location.href =
                    response.data.data.instrumentResponse.redirectInfo.url;
            } else {
                throw new Error("Failed to initiate payment");
            }
        } catch (error: any) {
            console.error("[PaymentStatus] Retry error:", error);
            toast({
                title: "Retry Failed",
                description:
                    error.response?.data?.details ||
                    error.response?.data?.error ||
                    error.message ||
                    "Could not re-initiate payment. Please try again.",
                variant: "destructive",
            });
            setIsRetrying(false);
        }
    };

    const handleContactSupport = () => {
        const { transactionId, orderId } = transactionRef.current;
        const message = `Hi, I need help with my order.\nOrder ID: ${orderId || "N/A"}\nTransaction ID: ${transactionId || "N/A"}`;
        const phone = "919599523434";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    const handleGoToOrders = () => {
        router.push("/profile?tab=orders");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 max-w-md">
                {/* Checking / Pending State */}
                {(status === "checking" || status === "pending") && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                        <h2 className="text-xl font-semibold mb-2">
                            Verifying Payment
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Please wait while we confirm your payment status...
                        </p>
                        {retryCount > 0 && (
                            <p className="text-sm text-gray-400">
                                Checking... ({retryCount + 1}/{MAX_RETRIES})
                            </p>
                        )}
                    </>
                )}

                {/* Success State */}
                {status === "success" && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-green-600">
                            Payment Successful!
                        </h2>
                        <p className="text-gray-500">
                            Redirecting to order confirmation...
                        </p>
                    </>
                )}

                {/* Failed State */}
                {status === "failed" && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-red-600">
                            Payment Failed
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {errorMessage || "Your payment could not be completed. Please try again."}
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={handleRetryPayment}
                                className="w-full"
                                disabled={isRetrying}
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting to Payment...
                                    </>
                                ) : (
                                    "Retry Payment"
                                )}
                            </Button>
                            <Button
                                onClick={handleGoToOrders}
                                variant="outline"
                                className="w-full"
                            >
                                View Orders
                            </Button>
                            <Button
                                onClick={handleContactSupport}
                                variant="ghost"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact Support
                            </Button>
                        </div>
                    </>
                )}

                {/* Timeout State */}
                {status === "timeout" && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-amber-600">
                            Verification Timeout
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Payment verification is taking longer than expected.
                            If money was deducted, your order will be confirmed
                            automatically.
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={handleRetryPayment}
                                className="w-full"
                                disabled={isRetrying}
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting to Payment...
                                    </>
                                ) : (
                                    "Retry Payment"
                                )}
                            </Button>
                            <Button
                                onClick={handleGoToOrders}
                                variant="outline"
                                className="w-full"
                            >
                                View Orders
                            </Button>
                            <Button
                                onClick={handleContactSupport}
                                variant="ghost"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact Support
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
