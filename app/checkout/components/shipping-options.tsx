"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckout } from "@/providers/CheckoutProvider";
import type { ShippingOption } from "@/types/checkout";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    Loader2,
    Truck,
    Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export function ShippingOptions() {
    const { setShippingOption, nextStep, prevStep, expressShipping, state } =
        useCheckout();

    const [selectedOption, setSelectedOption] = useState<"free" | "premium">(
        "free",
    );
    const [isHovered, setIsHovered] = useState<string | null>(null);

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

    useEffect(() => {
        const defaultOption =
            shippingOptions.find((opt) => opt.id === selectedOption) ??
            shippingOptions[0];
        setShippingOption(defaultOption);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedOption === "premium" && !expressShipping.loading) {
            const premiumOption = shippingOptions.find(
                (opt) => opt.id === "premium",
            );
            if (premiumOption) {
                setShippingOption(premiumOption);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expressShipping.price, expressShipping.loading]);

    useEffect(() => {
        if (!expressShipping.allowed && selectedOption === "premium") {
            setSelectedOption("free");
            setShippingOption(shippingOptions[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expressShipping.allowed]);

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

    const isContinueDisabled =
        (selectedOption === "premium" && !expressShipping.allowed) ||
        (selectedOption === "premium" && expressShipping.loading);

    return (
        <>
            <Card className="rounded-xl sm:rounded-2xl border border-gray-100 shadow-none">
                <CardHeader className="px-4 sm:px-6 pb-2 sm:pb-4">
                    {/* Mobile: back link above the title */}
                    <button
                        type="button"
                        onClick={prevStep}
                        className="sm:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-1 mb-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Details
                    </button>
                    <CardTitle className="text-base sm:text-lg font-bold">
                        Choose Your Shipping Method
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-4 sm:px-6">
                    <RadioGroup
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        className="space-y-3"
                    >
                        {shippingOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedOption === option.id;
                            const isPremiumDisabled =
                                option.id === "premium" &&
                                !expressShipping.allowed;
                            const isPremiumLoading =
                                option.id === "premium" &&
                                expressShipping.loading;

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
                                            relative rounded-xl border-2 transition-all
                                            ${isSelected ? "border-primary bg-primary/5" : "border-gray-200"}
                                            ${isHovered === option.id && !isSelected ? "border-primary/50" : ""}
                                            ${isPremiumDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                        `}
                                    >
                                        <div className="p-3 sm:p-4">
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                disabled={isPremiumDisabled}
                                                className="peer sr-only"
                                            />

                                            <Label
                                                htmlFor={option.id}
                                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer gap-3 sm:gap-4"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div
                                                        className={`
                                                            p-2.5 sm:p-3 rounded-full transition-colors flex-shrink-0
                                                            ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}
                                                        `}
                                                    >
                                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-base sm:text-lg text-gray-900">
                                                            {option.name}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-muted-foreground">
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

                                                {!isPremiumDisabled && (
                                                    <div className="text-left sm:text-right pl-[52px] sm:pl-0 flex-shrink-0">
                                                        {isPremiumLoading ? (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm">
                                                                    Calculating...
                                                                </span>
                                                            </div>
                                                        ) : option.id ===
                                                          "free" ? (
                                                            <p className="text-base sm:text-lg font-semibold text-green-600">
                                                                Free
                                                            </p>
                                                        ) : option.price > 0 ? (
                                                            <p className="text-base sm:text-lg font-semibold">
                                                                ₹
                                                                {option.price.toLocaleString(
                                                                    "en-IN",
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <p className="text-base sm:text-lg font-semibold text-green-600">
                                                                Free
                                                            </p>
                                                        )}
                                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                                            Shipping in{" "}
                                                            {
                                                                option.estimatedDays
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </Label>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </RadioGroup>

                    {/* ── Desktop actions (unchanged) ── */}
                    <div className="hidden sm:flex justify-between gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="h-10 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Details
                        </Button>

                        <Button
                            onClick={handleContinue}
                            disabled={isContinueDisabled}
                            className="h-10 rounded-lg"
                        >
                            Continue to Review
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Mobile sticky bottom CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 px-4 py-3">
                <Button
                    onClick={handleContinue}
                    disabled={isContinueDisabled}
                    className="w-full h-12 rounded-xl text-base font-semibold"
                >
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </>
    );
}
