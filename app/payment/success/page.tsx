"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orderStatus, setOrderStatus] = useState("Processing");

    const txnId = searchParams?.get("txnId") || "N/A";
    const amount =
        searchParams?.get("amount") ||
        sessionStorage.getItem("last_payment_amount") ||
        "0";
    const orderId =
        searchParams?.get("orderId") ||
        sessionStorage.getItem("last_payment_order_id") ||
        null;

    const ordersRoute = orderId
        ? `/profile/orders/${orderId}`
        : "/profile?tab=orders";

    useEffect(() => {
        const rawTxnId = searchParams?.get("txnId");
        const rawAmount = searchParams?.get("amount");
        const paymentSuccess = sessionStorage.getItem("payment_success");
        const lastStatus = sessionStorage.getItem("last_payment_status");

        sessionStorage.setItem("last_payment_status", "success");
        sessionStorage.setItem("prevent_checkout_back", "1");
        globalThis.document.cookie =
            "post_payment_success=1; Path=/; Max-Age=45; SameSite=Lax";
        if (orderId) {
            globalThis.document.cookie = `post_payment_order_id=${encodeURIComponent(orderId)}; Path=/; Max-Age=45; SameSite=Lax`;
        }

        if (!rawTxnId || !rawAmount) {
            console.error("Missing required parameters");
            if (!paymentSuccess && lastStatus !== "success") {
                router.replace(ordersRoute);
                return;
            }
        }

        // Clear the success state
        sessionStorage.removeItem("payment_success");

        // Check order status
        const checkOrderStatus = async () => {
            try {
                if (!rawTxnId) return;

                const response = await axios.get(`/api/check-status/${rawTxnId}`);
                if (
                    response.data.success &&
                    response.data.code === "PAYMENT_SUCCESS"
                ) {
                    setOrderStatus("Confirmed");
                }
            } catch (error) {
                console.error("Error checking order status:", error);
            }
        };

        checkOrderStatus();
    }, [ordersRoute, router, searchParams]);

    useEffect(() => {
        const state = { fromPaymentSuccess: true };
        window.history.pushState(state, "", window.location.href);

        const onPopState = () => {
            router.replace(ordersRoute);
        };

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [ordersRoute, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-center text-2xl">
                        Payment Successful!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center">
                        Your payment of {formatPrice(Number(amount))} has been
                        successfully processed.
                    </p>
                    <p className="text-center text-sm text-gray-500">
                        Transaction ID: {txnId}
                    </p>
                    <p className="text-center font-semibold">
                        Order Status: {orderStatus}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button onClick={() => router.replace(ordersRoute)}>
                            View Order Details
                        </Button>
                        <Button variant="outline" onClick={() => router.replace("/")}>
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
