"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckout } from "@/providers/CheckoutProvider";
import type { ShippingOption } from "@/types/checkout";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

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
        price: 200,
        estimatedDays: "1–2 days",
        icon: Zap,
    },
];

export function ShippingOptions() {
    const { setShippingOption, nextStep, prevStep } = useCheckout();

    const [selectedOption, setSelectedOption] = useState<string>("free");
    const [isHovered, setIsHovered] = useState<string | null>(null);

    /* ===================== IMPORTANT FIX ===================== */
    /* Sync default selection into checkout state */
    useEffect(() => {
        const defaultOption = shippingOptions.find(
            (opt) => opt.id === selectedOption
        );
        if (defaultOption) {
            setShippingOption(defaultOption);
        }
    }, []); // run once on mount

    /* ===================== HANDLERS ===================== */
    const handleOptionChange = (value: string) => {
        setSelectedOption(value);

        const option = shippingOptions.find((opt) => opt.id === value);
        if (option) {
            setShippingOption(option); // 🔥 SOURCE OF TRUTH
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
                  `}
                                >
                                    <div className="p-4">
                                        <RadioGroupItem
                                            value={option.id}
                                            id={option.id}
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
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-semibold">
                                                    {option.price === 0 ? (
                                                        <span className="text-green-600">
                                                            Free
                                                        </span>
                                                    ) : (
                                                        <>₹{option.price}</>
                                                    )}
                                                </p>
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

                    <Button onClick={handleContinue}>
                        Continue to Review
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
