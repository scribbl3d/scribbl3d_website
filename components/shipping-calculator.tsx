"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function ShippingCalculator() {
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<{
    shippingDays: number;
    estimatedDeliveryDate: string;
    destinationCity?: string;
    destinationState?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic pincode validation
      if (!/^\d{6}$/.test(pincode)) {
        throw new Error("Please enter a valid 6-digit pincode");
      }

      const response = await fetch(`/api/shipping?pincode=${pincode}`);
      if (!response.ok) {
        throw new Error("Failed to calculate shipping time");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setShippingInfo(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate shipping time"
      );
      setShippingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold">Check Delivery Time</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="w-32"
          maxLength={6}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {shippingInfo && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Estimated delivery to {shippingInfo.destinationCity}
            {shippingInfo.destinationState &&
              `, ${shippingInfo.destinationState}`}
          </p>
          <p className="text-sm font-medium">
            {shippingInfo.shippingDays === 1
              ? "Tomorrow"
              : `${shippingInfo.estimatedDeliveryDate}`}
          </p>
        </div>
      )}
    </div>
  );
}
