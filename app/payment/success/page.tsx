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

    // Initialize synchronously from URL or sessionStorage so first render has values
    const initialTxn = (() => {
        const urlTxn =
            searchParams?.get("txn") ||
            searchParams?.get("txnId") ||
            searchParams?.get("transactionId") ||
            null;
        try {
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_transaction_id")
                    : null;
            return urlTxn || stored || null;
        } catch {
            return urlTxn || null;
        }
    })();

    const initialOrderId = (() => {
        const urlOrder =
            searchParams?.get("orderId") ||
            searchParams?.get("merchantOrderId") ||
            null;
        try {
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_order_id")
                    : null;
            return urlOrder || stored || null;
        } catch {
            return urlOrder || null;
        }
    })();

    const initialAmount = (() => {
        const urlAmount = searchParams?.get("amount") || null;
        try {
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_amount")
                    : null;
            return urlAmount || stored || null;
        } catch {
            return urlAmount || null;
        }
    })();

    const [txn, setTxn] = useState<string | null>(initialTxn);
    const [orderId, setOrderId] = useState<string | null>(initialOrderId);
    const [amount, setAmount] = useState<string | null>(initialAmount);
    const [orderStatus, setOrderStatus] = useState<"Processing" | "Confirmed">(
        "Processing"
    );
    const [loading, setLoading] = useState(true); // prevents flicker showing 0 then correct value

    useEffect(() => {
        // If we don't have txn/orderId from init, try to read again from URL/session
        if (!txn) {
            const urlTxn =
                searchParams?.get("txn") ||
                searchParams?.get("txnId") ||
                searchParams?.get("transactionId") ||
                null;
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_transaction_id")
                    : null;
            const finalTxn = urlTxn || stored || null;
            if (finalTxn) {
                setTxn(finalTxn);
                sessionStorage.setItem("phonepe_transaction_id", finalTxn);
            }
        }

        if (!orderId) {
            const urlOrder =
                searchParams?.get("orderId") ||
                searchParams?.get("merchantOrderId") ||
                null;
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_order_id")
                    : null;
            const finalOrder = urlOrder || stored || null;
            if (finalOrder) {
                setOrderId(finalOrder);
                sessionStorage.setItem("phonepe_order_id", finalOrder);
            }
        }

        if (!amount) {
            const urlAmount = searchParams?.get("amount") || null;
            const stored =
                typeof window !== "undefined"
                    ? sessionStorage.getItem("phonepe_amount")
                    : null;
            const finalAmount = urlAmount || stored || null;
            if (finalAmount) {
                setAmount(finalAmount);
                sessionStorage.setItem("phonepe_amount", finalAmount);
            }
        }

        // canonicalize URL: ensure it uses txn/orderId/amount keys (non-blocking)
        try {
            const canonicalParams = new URLSearchParams();
            if (txn || initialTxn)
                canonicalParams.set("txn", txn || initialTxn!);
            if (orderId || initialOrderId)
                canonicalParams.set("orderId", orderId || initialOrderId!);
            if (amount || initialAmount)
                canonicalParams.set("amount", amount || initialAmount!);
            const newSearch = canonicalParams.toString();
            if (
                typeof window !== "undefined" &&
                window.location.search !== `?${newSearch}`
            ) {
                window.history.replaceState(
                    {},
                    "",
                    `${window.location.pathname}?${newSearch}`
                );
            }
        } catch (e) {
            // ignore
        }

        // Check status and update UI
        const checkOrderStatus = async () => {
            const checkTxn = txn || initialTxn;
            if (!checkTxn) {
                console.warn("[SuccessPage] no txn available for status check");
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`/api/check-status/${checkTxn}`);
                if (
                    res?.data?.success &&
                    (res.data.code === "PAYMENT_SUCCESS" ||
                        res.data.state === "COMPLETED")
                ) {
                    setOrderStatus("Confirmed");
                } else {
                    setOrderStatus("Processing");
                }
            } catch (err) {
                console.error("[SuccessPage] check-status error", err);
            } finally {
                setLoading(false);
            }
        };

        checkOrderStatus();
        // optionally re-check once after short delay
        const t = setTimeout(() => {
            if (orderStatus === "Processing") checkOrderStatus();
        }, 2200);

        return () => clearTimeout(t);
    }, [
        searchParams,
        txn,
        orderId,
        amount,
        initialTxn,
        initialOrderId,
        initialAmount,
        orderStatus,
    ]);

    const shownTxn = txn || initialTxn || "N/A";
    const shownAmount = amount ? Number(amount) : 0;

    // Render a small loading placeholder for amount to avoid 0 flicker
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
                        {loading ? (
                            <>Checking payment details...</>
                        ) : (
                            <>
                                Your payment of {formatPrice(shownAmount)} has
                                been successfully processed.
                            </>
                        )}
                    </p>
                    <p className="text-center text-sm text-gray-500">
                        Transaction ID: {shownTxn}
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
