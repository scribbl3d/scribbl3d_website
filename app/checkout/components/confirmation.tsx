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
    Building2,
    ChevronLeft,
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

    if (!checkout) {
        return (
            <Card className="rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center text-red-600 gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <p className="text-sm sm:text-base">
                        Checkout session not initialized.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { state, prevStep } = checkout;
    const { shippingDetails, selectedShipping } = state;

    if (!shippingDetails) {
        return (
            <Card className="rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <p className="text-sm sm:text-base text-gray-700">
                        Shipping details are missing. Please enter your address.
                    </p>
                    <Button
                        onClick={prevStep}
                        className="h-11 sm:h-10 rounded-xl sm:rounded-lg"
                    >
                        Go Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!selectedShipping) {
        return (
            <Card className="rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <p className="text-sm sm:text-base text-gray-700">
                        Please select a shipping method to continue.
                    </p>
                    <Button
                        onClick={prevStep}
                        className="h-11 sm:h-10 rounded-xl sm:rounded-lg"
                    >
                        Select Shipping
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const isFreeShipping = selectedShipping.price === 0;

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
                        <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                            <span className="font-medium text-green-700 text-sm sm:text-base">
                                Free Shipping Applied
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <p className="font-medium text-sm sm:text-base">
                                {selectedShipping.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {selectedShipping.description}
                            </p>
                            <p className="font-semibold text-sm sm:text-base">
                                {formatPrice(selectedShipping.price)}
                            </p>
                        </div>
                    ),
                },
            ],
        },
    ];

    if (shippingDetails.wantsGstInvoice && shippingDetails.gstin) {
        sections.push({
            title: "GST Billing Details",
            icon: Building2,
            content: [
                {
                    text: (
                        <div className="flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    GSTIN
                                </span>
                                <span className="font-mono font-semibold text-blue-900 text-sm sm:text-base break-all">
                                    {shippingDetails.gstin}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Company
                                </span>
                                <p className="text-sm font-medium text-gray-800">
                                    {shippingDetails.gstCompanyName}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Registered Address
                                </span>
                                <p className="text-xs sm:text-sm text-gray-700">
                                    {shippingDetails.gstAddress}
                                </p>
                            </div>
                        </div>
                    ),
                },
            ],
        });
    }

    return (
        <Card className="rounded-xl sm:rounded-2xl border border-gray-100 shadow-none">
            <CardHeader className="px-4 sm:px-6 pb-2 sm:pb-4">
                {/* Mobile: back link above the title */}
                <button
                    type="button"
                    onClick={prevStep}
                    className="sm:hidden flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-1 mb-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Shipping
                </button>
                <CardTitle className="text-base sm:text-lg font-bold">
                    Review Your Order
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                        >
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <h3 className="text-sm sm:text-lg font-medium text-gray-900">
                                        {section.title}
                                    </h3>
                                </div>

                                <div className="ml-8 sm:ml-9 pl-2 border-l-2 border-gray-100 space-y-1.5 sm:space-y-2">
                                    {section.content.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-2 items-start"
                                        >
                                            {item.icon && (
                                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 sm:mt-1 text-gray-500 flex-shrink-0" />
                                            )}
                                            <div className="text-sm sm:text-base text-gray-700 min-w-0 break-words">
                                                {item.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {index < sections.length - 1 && (
                                <Separator className="my-3 sm:my-4" />
                            )}
                        </motion.div>
                    );
                })}

                {/* ── Desktop: back button at bottom (unchanged) ── */}
                <div className="hidden sm:block pt-6">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-10 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shipping
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
