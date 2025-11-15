"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCheckout } from "@/providers/CheckoutProvider";
import type { ShippingDetails } from "@/types/checkout";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

const states = [
  // States
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

const formSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
      {
        message: "Enter a valid email address",
      }
    ),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number starting with 6-9"
    ),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be at most 50 characters")
    .regex(/^[a-zA-Z ]+$/, "Name should only contain letters and spaces"),
  newsletter: z.boolean().default(false),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters")
    .regex(
      /^[a-zA-Z0-9 ,#\-\/]+$/,
      "Address should not contain special characters"
    ),
  landmark: z
    .string()
    .max(50, "Landmark must be at most 50 characters")
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters")
    .regex(/^[a-zA-Z ]+$/, "City should only contain letters and spaces"),
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
      "PIN code must be a valid 6-digit Indian PIN code (not starting with 0)"
    ),
  saveInfo: z.boolean().default(false),
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
    },
  });

  useEffect(() => {
    if (session?.user) {
      setValue("email", session.user.email || "");
      setValue("fullName", session.user.name || "");
      // Fetch saved address
      fetch("/api/user/shipping-details", { method: "GET" }).then(
        async (res) => {
          if (res.status === 204) return; // No address saved yet
          if (res.ok) {
            const address = await res.json();
            if (address) {
              setValue("fullName", address.fullName || "");
              setValue("email", address.email || "");
              setValue("phone", address.phone || "");
              setValue("address", address.street || "");
              setValue("landmark", address.landmark || "");
              setValue("city", address.city || "");
              setValue("state", address.state || "");
              setValue("pincode", address.pincode || address.zipCode || "");
            }
          }
        }
      );
    }
  }, [session, setValue]);

  const onSubmit = async (data: ShippingDetails) => {
    try {
      setIsLoading(true);

      if (data.saveInfo) {
        // Save shipping details to user profile
        const response = await fetch("/api/user/shipping-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to save shipping details");
        }

        toast({
          title: "Information Saved",
          description: "Your shipping details have been saved for future use.",
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
      <Card>
        <CardContent className="space-y-6 pt-4">
          {/* Contact Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  maxLength={50}
                  {...register("fullName")}
                  onInput={(e) => {
                    // Only allow letters and spaces
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^a-zA-Z ]/g, "");
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
                    // Only allow numbers and max 10 digits
                    const input = e.target as HTMLInputElement;
                    input.value = input.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10);
                  }}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
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
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Address</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="House number, street name, area"
                maxLength={100}
                {...register("address")}
                onInput={(e) => {
                  // Only allow alphanumeric, space, comma, dash, slash, hash
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^a-zA-Z0-9 ,#\-\/]/g, "");
                }}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Nearby landmark, building, etc."
                maxLength={50}
                {...register("landmark")}
                onInput={(e) => {
                  // Only allow alphanumeric, space, comma, dash, slash, hash
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^a-zA-Z0-9 ,#\-\/]/g, "");
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  pattern="[1-9]{1}[0-9]{5}"
                  inputMode="numeric"
                  {...register("pincode")}
                  onInput={(e) => {
                    // Only allow numbers and max 6 digits
                    const input = e.target as HTMLInputElement;
                    input.value = input.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 6);
                  }}
                />
                {errors.pincode && (
                  <p className="text-sm text-red-500">
                    {errors.pincode.message}
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
                    // Only allow letters and spaces
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^a-zA-Z ]/g, "");
                  }}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
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
                      className={errors.state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
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
                Save this information for faster checkout next time
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue to Shipping"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
