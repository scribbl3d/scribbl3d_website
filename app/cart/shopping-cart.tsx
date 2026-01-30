"use client";

import type { Discount } from "@/app/admin/discounts/types";
import { calculateDiscount } from "@/app/cart/utils/calculateDiscount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import type { CartItem } from "@/providers/CartProvider";
import { useCart } from "@/providers/CartProvider";
import { useCheckout } from "@/providers/CheckoutProvider";
import { ChevronLeft, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ShoppingCart() {
    const router = useRouter();
    const {
        cart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        updateCustomization,
    } = useCart();
    const { setPricing } = useCheckout();

    const [localCart, setLocalCart] = useState<CartItem[]>([]);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(
        null,
    );

    const [customizationItem, setCustomizationItem] = useState<CartItem | null>(
        null,
    );
    const [customizationText, setCustomizationText] = useState("");

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        setLocalCart(cart ?? []);
    }, [cart]);

    /* =========================
       PRICE CALCULATIONS
    ========================= */

    const subtotal = localCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const discountItems = localCart.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        itemType: item.itemType,
    }));

    const discountAmount = calculateDiscount(discountItems, appliedDiscount);

    const total = subtotal - discountAmount;

    /* =========================
       ACTIONS
    ========================= */

    const handleApplyDiscount = async () => {
        try {
            const res = await fetch(`/api/discounts/${discountCode}`);
            if (!res.ok) throw new Error();

            const discount: Discount = await res.json();
            setAppliedDiscount(discount);

            toast({
                title: "Discount Applied",
                description: `Code "${discount.code}" applied`,
            });
        } catch {
            setAppliedDiscount(null);
            toast({
                title: "Invalid Code",
                description: "Discount code is not valid",
                variant: "destructive",
            });
        }
    };

    const handleCheckout = () => {
        console.log("🟢 HANDLE CHECKOUT CLICKED");
        console.log("🟢 CART SUBTOTAL:", subtotal);
        console.log("🟢 DISCOUNT AMOUNT:", discountAmount);
        console.log("🟢 DISCOUNT CODE:", appliedDiscount?.code);

        setPricing({
            subtotal,
            discountAmount,
            appliedDiscountCode: appliedDiscount?.code,
        });

        console.log("🟢 setPricing CALLED");

        router.push("/checkout");
    };

    const handleUpdateQuantity = useCallback(
        async (id: string, quantity: number) => {
            if (quantity < 1) return;
            setLocalCart((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
            );
            await updateQuantity(id, quantity);
        },
        [updateQuantity],
    );

    const handleRemoveFromCart = async (id: string) => {
        setLocalCart((prev) => prev.filter((i) => i.id !== id));
        await removeFromCart(id);
    };

    const handleSaveCustomization = async () => {
        if (!customizationItem) return;
        await updateCustomization(customizationItem.id, customizationText);
        setCustomizationItem(null);
        toast({ title: "Customization saved" });
    };

    /* =========================
       EMPTY STATE
    ========================= */

    if (localCart.length === 0) {
        return (
            <div className="flex justify-center min-h-[60vh]">
                <Card className="p-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                        Your cart is empty
                    </p>
                    <Link href="/">
                        <Button>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    /* =========================
       UI
    ========================= */

    return (
        <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-4">
                {localCart.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="flex gap-4 p-4">
                            <div className="relative w-20 h-20">
                                <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover rounded"
                                    unoptimized
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>

                                <div className="flex items-center gap-2 mt-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            handleUpdateQuantity(
                                                item.id,
                                                item.quantity - 1,
                                            )
                                        }
                                    >
                                        <Minus />
                                    </Button>
                                    <span>{item.quantity}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            handleUpdateQuantity(
                                                item.id,
                                                item.quantity + 1,
                                            )
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>

                            <div className="text-right">
                                ₹{(item.price * item.quantity).toFixed(2)}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-500 ml-2"
                                    onClick={() =>
                                        handleRemoveFromCart(item.id)
                                    }
                                >
                                    <X />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="lg:col-span-4">
                <Card className="sticky top-4">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>

                        {appliedDiscount && discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount ({appliedDiscount.code})</span>
                                <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <Separator />

                        <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Discount code"
                                value={discountCode}
                                onChange={(e) =>
                                    setDiscountCode(e.target.value)
                                }
                            />
                            <Button onClick={handleApplyDiscount}>Apply</Button>
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
