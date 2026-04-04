"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckout } from "@/providers/CheckoutProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PhonePePayment from "./PhonePePayment";

type CheckoutItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
    customization?: any;
};

export default function OrderSummary() {
    const { state } = useCheckout();
    const router = useRouter();
    const searchParams = useSearchParams();

    const mode = searchParams?.get("mode");
    const productId = searchParams?.get("productId");
    const type = searchParams?.get("type");

    const [isClient, setIsClient] = useState(false);
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    /* =========================
       LOAD CHECKOUT ITEMS
    ========================= */
    useEffect(() => {
        async function loadItems() {
            setLoadingItems(true);

            try {
                if (mode === "buynow" && productId && type) {
                    const res = await fetch(
                        `/api/buynow?type=${type}&productId=${productId}`,
                    );
                    const item = await res.json();
                    setItems([{ ...item, quantity: 1 }]);
                } else {
                    const res = await fetch("/api/cart");
                    const data = await res.json();
                    setItems(data.items || []);
                }
            } catch (err) {
                console.error("Failed to load checkout items", err);
                setItems([]);
            } finally {
                setLoadingItems(false);
            }
        }

        loadItems();
    }, [mode, productId, type]);

    useEffect(() => {
        if (loadingItems || !isClient) return;
        if (mode === "buynow") return;

        if (items.length === 0) {
            const preventCheckoutBack =
                sessionStorage.getItem("prevent_checkout_back") === "1";
            const lastOrderId = sessionStorage.getItem("last_payment_order_id");

            if (preventCheckoutBack) {
                sessionStorage.removeItem("prevent_checkout_back");
                router.replace(
                    lastOrderId
                        ? `/profile/orders/${lastOrderId}`
                        : "/profile?tab=orders",
                );
            }
        }
    }, [isClient, items.length, loadingItems, mode, router]);

    if (!isClient || loadingItems) {
        return (
            <Skeleton className="w-full h-[350px] sm:h-[450px] lg:h-[600px] rounded-xl sm:rounded-2xl" />
        );
    }

    /* =========================
       PRICE CALCULATIONS
    ========================= */
    const computedSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const subtotal =
        state.pricing?.subtotal !== undefined
            ? state.pricing.subtotal
            : computedSubtotal;

    const discountAmount = state.pricing?.discountAmount ?? 0;
    const appliedDiscountCode = state.pricing?.appliedDiscountCode;

    const shippingCost = state.selectedShipping?.price ?? 0;

    const gstRate = 0.18;
    const gstAmount = (subtotal * gstRate) / (1 + gstRate);

    const total = subtotal + shippingCost - discountAmount;

    return (
        <Card className="bg-white border border-gray-100 shadow-none rounded-xl sm:rounded-2xl lg:sticky lg:top-4">
            <CardHeader className="px-4 sm:px-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-bold">
                    Order Summary
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {/* =========================
                    ITEMS
                ========================= */}
                <div className="space-y-2.5 sm:space-y-3 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-1">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-2.5 sm:gap-3"
                        >
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 border rounded-lg overflow-hidden flex-shrink-0">
                                {item.images?.[0] ? (
                                    <Image
                                        src={item.images[0]}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100" />
                                )}
                                <span className="absolute top-0 right-0 bg-gray-900/75 text-white w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs rounded-bl-lg">
                                    {item.quantity}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm sm:text-base truncate text-gray-900">
                                    {item.name}
                                </h3>
                                {item.customization && (
                                    <span className="inline-flex mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full bg-blue-50 text-blue-700">
                                        Customized
                                    </span>
                                )}
                            </div>

                            <div className="text-right font-medium text-sm sm:text-base text-gray-900 flex-shrink-0">
                                ₹
                                {(item.price * item.quantity).toLocaleString(
                                    "en-IN",
                                    { minimumFractionDigits: 2 },
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* =========================
                    COST BREAKDOWN
                ========================= */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                            ₹
                            {subtotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    {discountAmount > 0 && appliedDiscountCode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex justify-between text-green-600"
                        >
                            <span className="truncate mr-2">
                                Discount ({appliedDiscountCode})
                            </span>
                            <span className="flex-shrink-0">
                                -₹
                                {discountAmount.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </motion.div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">
                            {state.step === 1
                                ? "Calculated at shipping"
                                : shippingCost === 0
                                  ? "Free"
                                  : `₹${shippingCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">
                            GST (18%) included
                        </span>
                        <span className="text-gray-900">
                            ₹
                            {gstAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>

                <Separator />

                {/* =========================
                    TOTAL
                ========================= */}
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-base sm:text-lg text-gray-900">
                        Total
                    </span>
                    <span className="font-bold text-lg sm:text-xl text-gray-900">
                        ₹
                        {total.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                </div>

                {/* =========================
                    PAYMENT
                ========================= */}
                <AnimatePresence>
                    {state.step < 3 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Button
                                disabled
                                className="w-full h-11 sm:h-10 bg-gray-100 text-gray-500 rounded-xl sm:rounded-lg text-sm"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Complete shipping details
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <PhonePePayment
                                amount={total}
                                name={state.shippingDetails?.fullName || ""}
                                mobile={state.shippingDetails?.phone || ""}
                                items={items}
                                mode={mode === "buynow" ? "buynow" : "cart"}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
