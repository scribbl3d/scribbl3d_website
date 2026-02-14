"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckout } from "@/providers/CheckoutProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams();

    const mode = searchParams?.get("mode"); // "buynow" | null
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
                // BUY NOW
                if (mode === "buynow" && productId && type) {
                    const res = await fetch(
                        `/api/buynow?type=${type}&productId=${productId}`,
                    );
                    const item = await res.json();
                    setItems([{ ...item, quantity: 1 }]);
                }
                // CART
                else {
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

    if (!isClient || loadingItems) {
        return <Skeleton className="w-full h-[600px] rounded-lg" />;
    }

    /* =========================
       PRICE CALCULATIONS
    ========================= */

    // Fallback subtotal (only if pricing not locked yet – eg buy now edge case)
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
        <Card className="bg-white border shadow-sm">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* =========================
                    ITEMS
                ========================= */}
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start space-x-3"
                        >
                            <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
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
                                <span className="absolute top-0 right-0 bg-gray-900/75 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg">
                                    {item.quantity}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">
                                    {item.name}
                                </h3>
                                {item.customization && (
                                    <span className="inline-flex mt-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                                        Customized
                                    </span>
                                )}
                            </div>

                            <div className="text-right font-medium">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* =========================
                    COST BREAKDOWN
                ========================= */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && appliedDiscountCode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex justify-between text-green-600"
                        >
                            <span>Discount ({appliedDiscountCode})</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                        </motion.div>
                    )}

                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                            {state.step === 1
                                ? "Calculated at shipping"
                                : `₹${shippingCost.toFixed(2)}`}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>GST (18%) included</span>
                        <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                </div>

                <Separator />

                {/* =========================
                    TOTAL
                ========================= */}
                <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
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
                                className="w-full bg-gray-100 text-gray-500"
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
