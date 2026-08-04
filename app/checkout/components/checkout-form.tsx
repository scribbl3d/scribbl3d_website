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
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod";

/* =========================
   STATES
========================= */
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
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
];

/* =========================
   PINCODE → STATE MAPPING
========================= */
const stateNormalizeMap: Record<string, string> = {
    "andhra pradesh": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    assam: "Assam",
    bihar: "Bihar",
    chhattisgarh: "Chhattisgarh",
    goa: "Goa",
    gujarat: "Gujarat",
    haryana: "Haryana",
    "himachal pradesh": "Himachal Pradesh",
    jharkhand: "Jharkhand",
    karnataka: "Karnataka",
    kerala: "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    maharashtra: "Maharashtra",
    manipur: "Manipur",
    meghalaya: "Meghalaya",
    mizoram: "Mizoram",
    nagaland: "Nagaland",
    odisha: "Odisha",
    orissa: "Odisha",
    punjab: "Punjab",
    rajasthan: "Rajasthan",
    sikkim: "Sikkim",
    "tamil nadu": "Tamil Nadu",
    telangana: "Telangana",
    tripura: "Tripura",
    "uttar pradesh": "Uttar Pradesh",
    uttarakhand: "Uttarakhand",
    "west bengal": "West Bengal",
    "andaman and nicobar islands": "Andaman and Nicobar Islands",
    "andaman and nicobar": "Andaman and Nicobar Islands",
    chandigarh: "Chandigarh",
    "dadra and nagar haveli and daman and diu":
        "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    delhi: "Delhi",
    "new delhi": "Delhi",
    "jammu and kashmir": "Jammu and Kashmir",
    ladakh: "Ladakh",
    lakshadweep: "Lakshadweep",
    puducherry: "Puducherry",
    pondicherry: "Puducherry",
};

function normalizeState(apiState: string): string {
    const key = apiState.trim().toLowerCase();
    return stateNormalizeMap[key] || apiState.trim();
}

/** Extract best city name from pincode API response */
function extractCity(po: { Block: string; District: string }): string {
    const block = (po.Block || "").trim();
    const district = (po.District || "").trim();
    // Block is usually the actual city/town; District is the broader region
    if (block && block.toLowerCase() !== "na" && block !== district) {
        return block;
    }
    return district;
}

/* =========================
   FORM SCHEMA
========================= */
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
                { message: "Enter a valid email address" },
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
                /^[a-zA-Z .\-']+$/,
                "City should only contain letters, spaces, dots, and hyphens",
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

/* =========================
   COMPONENT
========================= */
export default function CheckoutForm() {
    const { data: session } = useSession();
    const { setShippingDetails, nextStep } = useCheckout();
    const [isLoading, setIsLoading] = useState(false);

    // Pincode auto-fill state
    const [pincodeStatus, setPincodeStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        clearErrors,
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
            state: "",
        },
    });

    const wantsGstInvoice = useWatch({ control, name: "wantsGstInvoice" });

    // Hydrate from session / saved address
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

    /* =========================
       PINCODE AUTO-FILL
    ========================= */
    const lookupPincode = useCallback(
        async (pincode: string) => {
            if (abortRef.current) abortRef.current.abort();
            if (!/^[1-9][0-9]{5}$/.test(pincode)) {
                setPincodeStatus("idle");
                return;
            }

            const controller = new AbortController();
            abortRef.current = controller;
            setPincodeStatus("loading");

            try {
                const res = await fetch(
                    `https://api.postalpincode.in/pincode/${pincode}`,
                    { signal: controller.signal },
                );
                if (!res.ok) {
                    setPincodeStatus("error");
                    return;
                }

                const data = await res.json();
                const result = data?.[0];

                if (
                    !result ||
                    result.Status !== "Success" ||
                    !result.PostOffice?.length
                ) {
                    setPincodeStatus("error");
                    return;
                }

                const first = result.PostOffice[0];
                const city = extractCity(first);
                const state = normalizeState(first.State);

                setValue("city", city, { shouldValidate: true });
                setValue("state", state, { shouldValidate: true });
                clearErrors(["city", "state"]);
                setPincodeStatus("success");
            } catch (err: any) {
                if (err?.name === "AbortError") return;
                setPincodeStatus("error");
            }
        },
        [setValue, clearErrors],
    );

    const handlePincodeChange = useCallback(
        (raw: string) => {
            const cleaned = raw.replace(/[^0-9]/g, "").slice(0, 6);
            if (cleaned.length < 6) {
                setPincodeStatus("idle");
            }
            if (cleaned.length === 6) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(
                    () => lookupPincode(cleaned),
                    300,
                );
            }
            return cleaned;
        },
        [lookupPincode],
    );

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /* =========================
       SUBMIT
    ========================= */
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

    /* =========================
       PINCODE FIELD ICON
    ========================= */
    const pincodeIcon =
        pincodeStatus === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : pincodeStatus === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
        );

    /* =========================
       RENDER
    ========================= */
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardContent className="space-y-6 pt-4">
                    {/* Contact Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Contact Information
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter your full name"
                                    maxLength={50}
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
                                    <p className="text-sm text-red-500">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    pattern="[6-9]{1}[0-9]{9}"
                                    inputMode="numeric"
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
                                    <p className="text-sm text-red-500">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Delivery Address
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                                id="address"
                                placeholder="House number, street name, area"
                                maxLength={100}
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
                                <p className="text-sm text-red-500">
                                    {errors.address.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="landmark">
                                Landmark (Optional)
                            </Label>
                            <Input
                                id="landmark"
                                placeholder="Nearby landmark, building, etc."
                                maxLength={50}
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* PIN Code with auto-lookup */}
                            <div className="space-y-2">
                                <Label htmlFor="pincode">PIN Code</Label>
                                <div className="relative">
                                    <Controller
                                        name="pincode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="pincode"
                                                placeholder="6-digit PIN code"
                                                maxLength={6}
                                                inputMode="numeric"
                                                className="pr-10"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const cleaned =
                                                        handlePincodeChange(
                                                            e.target.value,
                                                        );
                                                    field.onChange(cleaned);
                                                }}
                                                onBlur={field.onBlur}
                                            />
                                        )}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {pincodeIcon}
                                    </div>
                                </div>
                                {errors.pincode && (
                                    <p className="text-sm text-red-500">
                                        {errors.pincode.message}
                                    </p>
                                )}
                                {pincodeStatus === "success" && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        City and state auto-filled
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    placeholder="Enter your city"
                                    maxLength={50}
                                    {...register("city")}
                                    onInput={(e) => {
                                        const input =
                                            e.target as HTMLInputElement;
                                        input.value = input.value.replace(
                                            /[^a-zA-Z .\-']/g,
                                            "",
                                        );
                                    }}
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-500">
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
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
                                            className={
                                                errors.state
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Select your state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {states.map((state) => (
                                                <SelectItem
                                                    key={state}
                                                    value={state}
                                                >
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.state && (
                                <p className="text-sm text-red-500">
                                    {errors.state.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* GSTIN Invoice Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="wantsGstInvoice"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="wantsGstInvoice"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label
                                htmlFor="wantsGstInvoice"
                                className="text-sm font-medium"
                            >
                                I need a GST invoice for this order
                            </Label>
                        </div>

                        {wantsGstInvoice && (
                            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    GST Billing Details
                                </h4>

                                <div className="space-y-2">
                                    <Label htmlFor="gstin">GSTIN</Label>
                                    <Input
                                        id="gstin"
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                        maxLength={15}
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
                                        <p className="text-sm text-red-500">
                                            {errors.gstin.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gstCompanyName">
                                        Registered Company Name
                                    </Label>
                                    <Input
                                        id="gstCompanyName"
                                        placeholder="Company name as per GST registration"
                                        maxLength={100}
                                        {...register("gstCompanyName")}
                                    />
                                    {errors.gstCompanyName && (
                                        <p className="text-sm text-red-500">
                                            {errors.gstCompanyName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gstAddress">
                                        Registered Address
                                    </Label>
                                    <Input
                                        id="gstAddress"
                                        placeholder="Registered business address as per GST"
                                        maxLength={200}
                                        {...register("gstAddress")}
                                    />
                                    {errors.gstAddress && (
                                        <p className="text-sm text-red-500">
                                            {errors.gstAddress.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="saveInfo"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="saveInfo"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label
                                htmlFor="saveInfo"
                                className="text-sm text-muted-foreground"
                            >
                                Save this information for faster checkout next
                                time
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Continue to Shipping"}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
