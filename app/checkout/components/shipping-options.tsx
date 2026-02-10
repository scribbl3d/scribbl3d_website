"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckout } from "@/providers/CheckoutProvider";
import type { ShippingOption } from "@/types/checkout";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function ShippingOptions() {
    const { setShippingOption, nextStep, prevStep, expressShipping, state } =
        useCheckout();

    const [selectedOption, setSelectedOption] = useState<"free" | "premium">(
        "free",
    );
    const [isHovered, setIsHovered] = useState<string | null>(null);

    /* ===================== SHIPPING OPTIONS ===================== */
    const shippingOptions: ShippingOption[] = [
        {
            id: "free",
            name: "Free Shipping",
            description: "5–7 business days",
            price: 0,
            estimatedDays: "5–7 days",
            icon: Truck,
        },
        {
            id: "premium",
            name: "Premium Shipping",
            description: "1–2 business days",
            price: expressShipping.price,
            estimatedDays: "1–2 days",
            icon: Zap,
        },
    ];

    /* ===================== SYNC DEFAULT ===================== */
    useEffect(() => {
        const defaultOption =
            shippingOptions.find((opt) => opt.id === selectedOption) ??
            shippingOptions[0];

        setShippingOption(defaultOption);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ===================== UPDATE SHIPPING OPTION WHEN PRICE CHANGES ===================== */
    useEffect(() => {
        if (selectedOption === "premium" && !expressShipping.loading) {
            const premiumOption = shippingOptions.find(
                (opt) => opt.id === "premium",
            );
            if (premiumOption) {
                setShippingOption(premiumOption);
            }
        }
    }, [expressShipping.price, expressShipping.loading]);

    /* ===================== AUTO-FALLBACK IF EXPRESS DISABLED ===================== */
    useEffect(() => {
        if (!expressShipping.allowed && selectedOption === "premium") {
            setSelectedOption("free");
            setShippingOption(shippingOptions[0]);
        }
    }, [expressShipping.allowed]);

    /* ===================== HANDLERS ===================== */
    const handleOptionChange = (value: "free" | "premium") => {
        setSelectedOption(value);

        const option = shippingOptions.find((opt) => opt.id === value);
        if (option) {
            setShippingOption(option);
        }
    };

    const handleContinue = () => {
        nextStep();
    };

    /* ===================== UI ===================== */
    return (
        <Card>
            <CardHeader>
                <CardTitle>Choose Your Shipping Method</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <RadioGroup
                    value={selectedOption}
                    onValueChange={handleOptionChange}
                    className="space-y-3"
                >
                    {shippingOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedOption === option.id;
                        const isPremiumDisabled =
                            option.id === "premium" && !expressShipping.allowed;
                        const isPremiumLoading =
                            option.id === "premium" && expressShipping.loading;

                        return (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                onHoverStart={() => setIsHovered(option.id)}
                                onHoverEnd={() => setIsHovered(null)}
                            >
                                <div
                                    className={`
                    relative rounded-lg border-2 transition-all
                    ${
                        isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200"
                    }
                    ${isHovered === option.id ? "border-primary/50" : ""}
                    ${isPremiumDisabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                                >
                                    <div className="p-4">
                                        <RadioGroupItem
                                            value={option.id}
                                            id={option.id}
                                            disabled={isPremiumDisabled}
                                            className="peer sr-only"
                                        />

                                        <Label
                                            htmlFor={option.id}
                                            className="flex justify-between items-center cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`
                            p-3 rounded-full transition-colors
                            ${
                                isSelected
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-500"
                            }
                          `}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </div>

                                                <div>
                                                    <p className="font-medium text-lg">
                                                        {option.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {option.description}
                                                    </p>
                                                    {isPremiumDisabled && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {
                                                                expressShipping.reason
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {option.price === 0 ? (
                                                    <p className="text-lg font-semibold text-green-600">
                                                        Free
                                                    </p>
                                                ) : isPremiumLoading ? (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-sm">
                                                            Calculating...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-lg font-semibold">
                                                        ₹{option.price}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Shipping in{" "}
                                                    {option.estimatedDays}
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </RadioGroup>

                {/* ===================== ACTIONS ===================== */}
                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Details
                    </Button>

                    <Button
                        onClick={handleContinue}
                        disabled={
                            (selectedOption === "premium" &&
                                !expressShipping.allowed) ||
                            (selectedOption === "premium" &&
                                expressShipping.loading)
                        }
                    >
                        Continue to Review
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
