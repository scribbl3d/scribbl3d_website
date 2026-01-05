"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCheckout } from "@/providers/CheckoutProvider";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Mail,
    MapPin,
    Phone,
    Truck,
    User,
    type LucideIcon,
} from "lucide-react";

/* ===================== TYPES ===================== */
interface ContentItem {
    icon?: LucideIcon;
    text: string | React.ReactNode;
}

interface Section {
    title: string;
    icon: LucideIcon;
    content: ContentItem[];
}

/* ===================== COMPONENT ===================== */
export function Confirmation() {
    const checkout = useCheckout();

    /* ---------- Safety: Context ---------- */
    if (!checkout) {
        return (
            <Card>
                <CardContent className="p-6 flex flex-col items-center text-center text-red-600 gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <p>Checkout session not initialized.</p>
                </CardContent>
            </Card>
        );
    }

    const { state, prevStep } = checkout;
    const { shippingDetails, selectedShipping } = state;

    /* ---------- Missing Shipping Details ---------- */
    if (!shippingDetails) {
        return (
            <Card>
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <p className="text-gray-700">
                        Shipping details are missing. Please enter your address.
                    </p>
                    <Button onClick={prevStep}>Go Back</Button>
                </CardContent>
            </Card>
        );
    }

    /* ---------- Missing Shipping Method ---------- */
    if (!selectedShipping) {
        return (
            <Card>
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <p className="text-gray-700">
                        Please select a shipping method to continue.
                    </p>
                    <Button onClick={prevStep}>Select Shipping</Button>
                </CardContent>
            </Card>
        );
    }

    /* ===================== SHIPPING LOGIC ===================== */
    const isFreeShipping = selectedShipping.price === 0;

    /* ===================== SECTIONS ===================== */
    const sections: Section[] = [
        {
            title: "Contact Information",
            icon: User,
            content: [
                { icon: Mail, text: shippingDetails.email },
                { icon: Phone, text: shippingDetails.phone },
            ],
        },
        {
            title: "Shipping Address",
            icon: MapPin,
            content: [
                { text: shippingDetails.fullName },
                { text: shippingDetails.address },
                shippingDetails.landmark
                    ? { text: shippingDetails.landmark }
                    : null,
                {
                    text: `${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.pincode}`,
                },
            ].filter(Boolean) as ContentItem[],
        },
        {
            title: "Shipping Method",
            icon: Truck,
            content: [
                {
                    text: isFreeShipping ? (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                            <span className="font-medium text-green-700">
                                Free Shipping Applied
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <p className="font-medium">
                                {selectedShipping.name}
                            </p>

                            <p className="text-sm text-gray-500">
                                {selectedShipping.description}
                            </p>

                            <p className="font-semibold">
                                {formatPrice(selectedShipping.price)}
                            </p>
                        </div>
                    ),
                },
            ],
        },
    ];

    const totalAmount = selectedShipping.price;

    /* ===================== UI ===================== */
    return (
        <Card>
            <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-medium">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="ml-9 pl-2 border-l-2 border-gray-100 space-y-2">
                                    {section.content.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-2 items-start"
                                        >
                                            {item.icon && (
                                                <item.icon className="w-4 h-4 mt-1 text-gray-500" />
                                            )}
                                            <div className="text-gray-700">
                                                {item.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {index < sections.length - 1 && (
                                <Separator className="my-4" />
                            )}
                        </motion.div>
                    );
                })}

                {/* ===================== TOTAL ===================== */}
                <div className="pt-6 space-y-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Amount</span>
                        <span>{formatPrice(totalAmount)}</span>
                    </div>

                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shipping
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
