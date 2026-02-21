"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { useCheckout } from "@/providers/CheckoutProvider";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
    const { state } = useCheckout();

    const handlePayment = async () => {
        try {
            setIsLoading(true);

            // Validation
            if (!amount || amount <= 0) {
                throw new Error("Invalid amount");
            }

            if (!items || items.length === 0) {
                throw new Error("No checkout items found");
            }

            // Prepare order data
            const subtotal = state.pricing?.subtotal ?? amount;
            const discountAmount = state.pricing?.discountAmount ?? 0;
            const discountCode = state.pricing?.appliedDiscountCode ?? null;
            const shippingPrice = state.selectedShipping?.price ?? 0;
            const tax = state.pricing?.tax ?? 0;

            const transactionId = `TXN${Date.now()}${Math.random()
                .toString(36)
                .slice(2, 8)}`;
            const shippingMode =
                state.selectedShipping?.id === "premium"
                    ? "Express"
                    : "Surface";

            // Step 1: Create order in database
            const orderResponse = await axios.post("/api/create-order", {
                mode,
                items,
                subtotal,
                discountAmount,
                discountCode,
                shippingPrice,
                totalAmount: amount,
                tax,
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

            // Step 2: Initiate PhonePe payment
            const response = await axios.post("/api/order", {
                name,
                amount,
                mobile,
                transactionId,
                orderId,
                MUID: `MUID${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
            });

            if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
                // Store transaction details for status page
                sessionStorage.setItem("phonepe_transaction_id", transactionId);
                sessionStorage.setItem("phonepe_order_id", orderId);
                sessionStorage.setItem("phonepe_amount", amount.toString());

                // Redirect to PhonePe
                window.location.href =
                    response.data.data.instrumentResponse.redirectInfo.url;
            } else {
                throw new Error("Invalid PhonePe response");
            }
        } catch (error: any) {
            console.error("[PhonePe Payment] Error:", error);
            toast({
                title: "Payment Error",
                description:
                    error.response?.data?.details ||
                    error.message ||
                    "Payment failed. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
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
    );
}
