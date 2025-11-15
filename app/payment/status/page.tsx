"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCheckout } from "@/providers/CheckoutProvider";
import { useCart } from "@/providers/CartProvider";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const { resetCheckout } = useCheckout();
  const { clearCart } = useCart();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      console.log("Payment status page loaded");

      // Get transaction ID from URL params first, then session storage
      const transactionId =
        searchParams.get("transactionId") ||
        sessionStorage.getItem("phonepe_transaction_id");
      const amount = sessionStorage.getItem("phonepe_amount");

      console.log("Transaction details:", { transactionId, amount });

      if (!transactionId) {
        console.error("Missing transaction ID");
        toast({
          title: "Error",
          description: "Could not verify payment - missing transaction ID",
          variant: "destructive",
        });
        router.push("/checkout");
        return;
      }

      try {
        const response = await axios.get(`/api/check-status/${transactionId}`);
        console.log("Payment status response:", response.data);

        if (response.data.success && response.data.code === "PAYMENT_SUCCESS") {
          console.log(
            "Payment successful, clearing cart and resetting checkout"
          );
          await clearCart();
          resetCheckout();

          // Store success state in session to prevent loops
          if (!hasRedirected) {
            setHasRedirected(true);
            sessionStorage.setItem("payment_success", "true");
            console.log("Redirecting to success page with params:", {
              transactionId,
              amount,
            });

            // Clear storage after storing success state
            sessionStorage.removeItem("phonepe_transaction_id");
            sessionStorage.removeItem("phonepe_amount");

            // Use replace instead of push to prevent back navigation
            router.replace(
              `/payment/success?txnId=${transactionId}&amount=${amount}`
            );
          }
        } else if (response.data.code === "PAYMENT_PENDING") {
          console.log("Payment pending, retrying in 5 seconds");
          toast({
            title: "Payment Pending",
            description: "Your payment is still being processed. Please wait.",
          });
          setTimeout(() => checkPaymentStatus(), 5000);
        } else {
          console.log("Payment failed");
          toast({
            title: "Payment Failed",
            description: response.data.message || "Payment verification failed",
            variant: "destructive",
          });
          router.replace(`/payment/failure?txnId=${transactionId}`);
        }
      } catch (error: any) {
        console.error("Error checking payment status:", error);
        toast({
          title: "Error",
          description: "Failed to verify payment status",
          variant: "destructive",
        });
        router.replace("/payment/failure");
      }
    };

    // Only check payment status if we haven't already succeeded
    if (!sessionStorage.getItem("payment_success")) {
      checkPaymentStatus();
    }
  }, [router, searchParams, clearCart, resetCheckout, hasRedirected]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
        <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
        <p className="text-gray-500">
          Please wait while we confirm your payment status...
        </p>
      </div>
    </div>
  );
}
