"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { useCheckout } from "@/providers/CheckoutProvider";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PhonePePaymentProps {
    amount: number;
    name: string;
    mobile: string;
    items: any[];
    mode: "cart" | "buynow";
}

export default function PhonePePayment({
    amount,
    name,
    mobile,
    items,
    mode,
}: PhonePePaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<
        "idle" | "processing" | "success" | "error"
    >("idle");

    const router = useRouter();
    const { resetCheckout, state } = useCheckout();

    const handlePayment = async () => {
        try {
            setIsLoading(true);
            setPaymentStatus("processing");

            if (!amount || amount <= 0) {
                throw new Error("Invalid amount");
            }

            if (!items || items.length === 0) {
                throw new Error("No checkout items found");
            }

            const transactionId = `T${Date.now()}${Math.random()
                .toString(36)
                .slice(2)}`;
            const shippingMode =
                state.selectedShipping?.id === "premium"
                    ? "Express"
                    : "Surface";

            // ✅ CREATE ORDER (CART OR BUY NOW)
            const orderResponse = await axios.post("/api/create-order", {
                mode,
                items,
                totalAmount: amount,
                shippingMode,
                shippingAddress: state.shippingDetails,
                billingAddress: state.shippingDetails,
                paymentMethod: "PhonePe",
                transactionId,
            });

            const orderId = orderResponse.data.orderId;
            if (!orderId) {
                throw new Error("Failed to create order");
            }

            // ✅ PHONEPE INIT
            const response = await axios.post("/api/order", {
                name,
                amount,
                mobile,
                transactionId,
                orderId,
                MUID: `MUID${Date.now()}${Math.random().toString(36).slice(2)}`,
            });
            console.log("resposne from paytm after payment ", response);
            if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
                sessionStorage.setItem("phonepe_transaction_id", transactionId);
                sessionStorage.setItem("phonepe_order_id", orderId);
                sessionStorage.setItem("phonepe_amount", amount.toString());

                window.location.href =
                    response.data.data.instrumentResponse.redirectInfo.url;
            } else {
                throw new Error("Invalid PhonePe response");
            }
        } catch (error: any) {
            setPaymentStatus("error");
            toast({
                title: "Payment Error",
                description:
                    error.response?.data?.details ||
                    error.message ||
                    "Payment failed",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const checkPaymentStatus = useCallback(
        async (transactionId: string, orderId: string) => {
            try {
                const response = await axios.get(
                    `/api/check-status/${transactionId}`,
                );

                if (
                    response.data.success &&
                    response.data.code === "PAYMENT_SUCCESS"
                ) {
                    setPaymentStatus("success");
                    resetCheckout();

                    router.push(
                        `/payment/success?txnId=${transactionId}&amount=${amount}&orderId=${orderId}`,
                    );
                } else if (response.data.code === "PAYMENT_PENDING") {
                    setTimeout(
                        () => checkPaymentStatus(transactionId, orderId),
                        5000,
                    );
                } else {
                    setPaymentStatus("error");
                    router.push(
                        `/payment/failure?txnId=${transactionId}&orderId=${orderId}`,
                    );
                }
            } catch {
                setPaymentStatus("error");
                router.push(`/payment/failure`);
            }
        },
        [router, amount, resetCheckout],
    );

    useEffect(() => {
        const txnId = sessionStorage.getItem("phonepe_transaction_id");
        const orderId = sessionStorage.getItem("phonepe_order_id");

        if (txnId && orderId) {
            checkPaymentStatus(txnId, orderId);
            sessionStorage.removeItem("phonepe_transaction_id");
            sessionStorage.removeItem("phonepe_order_id");
        }
    }, [checkPaymentStatus]);

    return (
        <Button
            onClick={handlePayment}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading || paymentStatus === "processing"}
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
    );
}
