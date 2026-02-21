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
    const searchParams = useSearchParams()!;
    const [orderStatus, setOrderStatus] = useState("Processing");

    useEffect(() => {
        const txnId = searchParams.get("txnId");
        const amount = searchParams.get("amount");
        const paymentSuccess = sessionStorage.getItem("payment_success");

        if (!txnId || !amount) {
            console.error("Missing required parameters");
            if (!paymentSuccess) {
                router.replace("/");
                return;
            }
        }

        // Clear the success state
        sessionStorage.removeItem("payment_success");

        // Check order status
        const checkOrderStatus = async () => {
            try {
                const response = await axios.get(`/api/check-status/${txnId}`);
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
    }, [router, searchParams]);

    const txnId = searchParams?.get("txnId") || "N/A";
    const amount = searchParams?.get("amount") || "0";

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
                    <div className="flex justify-center">
                        <Button onClick={() => router.push("/")}>
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
