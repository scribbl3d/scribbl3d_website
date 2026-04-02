"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useCheckout } from "@/providers/CheckoutProvider";
import type { ShippingDetails } from "@/types/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    // Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
];

const formSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email address")
            .refine(
                (val) =>
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                        val,
                    ),
                {
                    message: "Enter a valid email address",
                },
            ),
        phone: z
            .string()
            .regex(
                /^[6-9]\d{9}$/,
                "Enter a valid 10-digit Indian mobile number starting with 6-9",
            ),
        fullName: z
            .string()
            .min(2, "Full name must be at least 2 characters")
            .max(50, "Full name must be at most 50 characters")
            .regex(
                /^[a-zA-Z ]+$/,
                "Name should only contain letters and spaces",
            ),
        newsletter: z.boolean().default(false),
        address: z
            .string()
            .min(5, "Address must be at least 5 characters")
            .max(100, "Address must be at most 100 characters")
            .regex(
                /^[a-zA-Z0-9 ,#\-\/]+$/,
                "Address should not contain special characters",
            ),
        landmark: z
            .string()
            .max(50, "Landmark must be at most 50 characters")
            .optional(),
        city: z
            .string()
            .min(2, "City must be at least 2 characters")
            .max(50, "City must be at most 50 characters")
            .regex(
                /^[a-zA-Z ]+$/,
                "City should only contain letters and spaces",
            ),
        state: z
            .string()
            .min(2, "Please select a state")
            .refine((val) => states.includes(val), {
                message: "Please select a valid state",
            }),
        pincode: z
            .string()
            .regex(
                /^[1-9][0-9]{5}$/,
                "PIN code must be a valid 6-digit Indian PIN code (not starting with 0)",
            ),
        saveInfo: z.boolean().default(false),

        // GSTIN fields
        wantsGstInvoice: z.boolean().default(false),
        gstin: z.string().optional(),
        gstCompanyName: z.string().optional(),
        gstAddress: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.wantsGstInvoice) {
            if (
                !data.gstin ||
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                    data.gstin,
                )
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter a valid 15-character GSTIN",
                    path: ["gstin"],
                });
            }

            if (!data.gstCompanyName || data.gstCompanyName.trim().length < 2) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Registered company name must be at least 2 characters",
                    path: ["gstCompanyName"],
                });
            }

            if (!data.gstAddress || data.gstAddress.trim().length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Registered address must be at least 5 characters",
                    path: ["gstAddress"],
                });
            }
        }
    });

export default function CheckoutForm() {
    const { data: session } = useSession();
    const { setShippingDetails, nextStep } = useCheckout();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ShippingDetails>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newsletter: false,
            saveInfo: false,
            wantsGstInvoice: false,
            gstin: "",
            gstCompanyName: "",
            gstAddress: "",
        },
    });

    const wantsGstInvoice = useWatch({ control, name: "wantsGstInvoice" });

    const hasHydratedRef = useRef(false);
    useEffect(() => {
        if (!session?.user) return;
        if (hasHydratedRef.current) return;

        setValue("email", session.user.email || "");
        setValue("fullName", session.user.name || "");

        fetch("/api/user/shipping-details")
            .then(async (res) => {
                if (res.status === 204) return;
                if (!res.ok) return;

                const address = await res.json();
                if (!address) return;

                setValue("fullName", address.fullName || "");
                setValue("email", address.email || "");
                setValue("phone", address.phone || "");
                setValue("address", address.street || "");
                setValue("landmark", address.landmark || "");
                setValue("city", address.city || "");
                setValue("state", address.state || "");
                setValue("pincode", address.pincode || address.zipCode || "");

                if (address.gstin) {
                    setValue("wantsGstInvoice", true);
                    setValue("gstin", address.gstin || "");
                    setValue("gstCompanyName", address.gstCompanyName || "");
                    setValue("gstAddress", address.gstAddress || "");
                }
            })
            .finally(() => {
                hasHydratedRef.current = true;
            });
    }, [session, setValue]);

    const onSubmit = async (data: ShippingDetails) => {
        try {
            setIsLoading(true);

            if (data.saveInfo) {
                const response = await fetch("/api/user/shipping-details", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error("Failed to save shipping details");
                }

                toast({
                    title: "Information Saved",
                    description:
                        "Your shipping details have been saved for future use.",
                });
            }

            setShippingDetails(data);
            nextStep();
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to save shipping details. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="rounded-xl sm:rounded-2xl border border-gray-100 shadow-none">
                <CardContent className="space-y-5 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6">
                    {/* Contact Details */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Contact Information
                        </h3>
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label
                                    htmlFor="fullName"
                                    className="text-sm font-medium"
                                >
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    maxLength={50}
                                    className="h-11 sm:h-10 text-base sm:text-sm"
                                    {...register("fullName")}
                                    onInput={(e) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        input.value = input.value.replace(
                                            /[^a-zA-Z ]/g,
                                            "",
                                        );
                                    }}
                                />
                                {errors.fullName && (
                                    <p className="text-xs sm:text-sm text-red-500">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-sm font-medium"
                                >
                                    Mobile Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    pattern="[6-9]{1}[0-9]{9}"
                                    inputMode="numeric"
                                    className="h-11 sm:h-10 text-base sm:text-sm"
                                    {...register("phone")}
                                    onInput={(e) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        input.value = input.value
                                            .replace(/[^0-9]/g, "")
                                            .slice(0, 10);
                                    }}
                                />
                                {errors.phone && (
                                    <p className="text-xs sm:text-sm text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="h-11 sm:h-10 text-base sm:text-sm"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs sm:text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Delivery Address
                        </h3>
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="address"
                                className="text-sm font-medium"
                            >
                                Street Address
                            </Label>
                            <Input
                                id="address"
                                placeholder="House number, street name, area"
                                maxLength={100}
                                className="h-11 sm:h-10 text-base sm:text-sm"
                                {...register("address")}
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(
                                        /[^a-zA-Z0-9 ,#\-\/]/g,
                                        "",
                                    );
                                }}
                            />
                            {errors.address && (
                                <p className="text-xs sm:text-sm text-red-500">
                                    {errors.address.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="landmark"
                                className="text-sm font-medium"
                            >
                                Landmark (Optional)
                            </Label>
                            <Input
                                id="landmark"
                                placeholder="Nearby landmark, building, etc."
                                maxLength={50}
                                className="h-11 sm:h-10 text-base sm:text-sm"
                                {...register("landmark")}
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    input.value = input.value.replace(
                                        /[^a-zA-Z0-9 ,#\-\/]/g,
                                        "",
                                    );
                                }}
                            />
                        </div>

                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label
                                    htmlFor="pincode"
                                    className="text-sm font-medium"
                                >
                                    PIN Code
                                </Label>
                                <Input
                                    id="pincode"
                                    placeholder="6-digit PIN code"
                                    maxLength={6}
                                    pattern="[1-9]{1}[0-9]{5}"
                                    inputMode="numeric"
                                    className="h-11 sm:h-10 text-base sm:text-sm"
                                    {...register("pincode")}
                                    onInput={(e) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        input.value = input.value
                                            .replace(/[^0-9]/g, "")
                                            .slice(0, 6);
                                    }}
                                />
                                {errors.pincode && (
                                    <p className="text-xs sm:text-sm text-red-500">
                                        {errors.pincode.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label
                                    htmlFor="city"
                                    className="text-sm font-medium"
                                >
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    placeholder="Enter your city"
                                    maxLength={50}
                                    className="h-11 sm:h-10 text-base sm:text-sm"
                                    {...register("city")}
                                    onInput={(e) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        input.value = input.value.replace(
                                            /[^a-zA-Z ]/g,
                                            "",
                                        );
                                    }}
                                />
                                {errors.city && (
                                    <p className="text-xs sm:text-sm text-red-500">
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor="state"
                                className="text-sm font-medium"
                            >
                                State
                            </Label>
                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger
                                            id="state"
                                            className={`h-11 sm:h-10 text-base sm:text-sm ${errors.state ? "border-red-500" : ""}`}
                                        >
                                            <SelectValue placeholder="Select your state" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[40vh]">
                                            {states.map((state) => (
                                                <SelectItem
                                                    key={state}
                                                    value={state}
                                                    className="text-sm"
                                                >
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.state && (
                                <p className="text-xs sm:text-sm text-red-500">
                                    {errors.state.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* GSTIN Invoice Section */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start sm:items-center space-x-2">
                            <Controller
                                name="wantsGstInvoice"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="wantsGstInvoice"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-0.5 sm:mt-0"
                                    />
                                )}
                            />
                            <Label
                                htmlFor="wantsGstInvoice"
                                className="text-sm font-medium leading-snug"
                            >
                                I need a GST invoice for this order
                            </Label>
                        </div>

                        {wantsGstInvoice && (
                            <div className="space-y-3 sm:space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:p-4">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    GST Billing Details
                                </h4>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label
                                        htmlFor="gstin"
                                        className="text-sm font-medium"
                                    >
                                        GSTIN
                                    </Label>
                                    <Input
                                        id="gstin"
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                        maxLength={15}
                                        className="h-11 sm:h-10 text-base sm:text-sm font-mono"
                                        {...register("gstin")}
                                        onInput={(e) => {
                                            const input =
                                                e.target as HTMLInputElement;
                                            input.value = input.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9]/g, "")
                                                .slice(0, 15);
                                        }}
                                    />
                                    {errors.gstin && (
                                        <p className="text-xs sm:text-sm text-red-500">
                                            {errors.gstin.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label
                                        htmlFor="gstCompanyName"
                                        className="text-sm font-medium"
                                    >
                                        Registered Company Name
                                    </Label>
                                    <Input
                                        id="gstCompanyName"
                                        placeholder="Company name as per GST registration"
                                        maxLength={100}
                                        className="h-11 sm:h-10 text-base sm:text-sm"
                                        {...register("gstCompanyName")}
                                    />
                                    {errors.gstCompanyName && (
                                        <p className="text-xs sm:text-sm text-red-500">
                                            {errors.gstCompanyName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <Label
                                        htmlFor="gstAddress"
                                        className="text-sm font-medium"
                                    >
                                        Registered Address
                                    </Label>
                                    <Input
                                        id="gstAddress"
                                        placeholder="Registered business address as per GST"
                                        maxLength={200}
                                        className="h-11 sm:h-10 text-base sm:text-sm"
                                        {...register("gstAddress")}
                                    />
                                    {errors.gstAddress && (
                                        <p className="text-xs sm:text-sm text-red-500">
                                            {errors.gstAddress.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save info */}
                    <div className="space-y-4 pt-2 sm:pt-4">
                        <div className="flex items-start sm:items-center space-x-2">
                            <Controller
                                name="saveInfo"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="saveInfo"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-0.5 sm:mt-0"
                                    />
                                )}
                            />
                            <Label
                                htmlFor="saveInfo"
                                className="text-sm text-muted-foreground leading-snug"
                            >
                                Save this information for faster checkout next
                                time
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 sm:h-11 text-base sm:text-sm font-semibold rounded-xl sm:rounded-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Continue to Shipping"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
