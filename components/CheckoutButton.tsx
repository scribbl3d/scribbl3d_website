"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { useCart } from "@/providers/CartProvider";
// import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  amount: number;
  orderId: string;
}

export default function CheckoutButton({
  amount,
  orderId,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  // const { clearCart } = useCart();
  // const router = useRouter();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(
        `Failed to initiate payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay with PhonePe"
      )}
    </Button>
  );
}
