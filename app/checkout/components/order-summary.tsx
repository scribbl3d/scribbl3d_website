"use client";

import { useCheckout } from "@/providers/CheckoutProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import type { CartItem } from "@/types/cart";
import PhonePePayment from "./PhonePePayment";

export default function OrderSummary() {
  const { cart } = useCart();
  const { state } = useCheckout();
  const [isClient, setIsClient] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Skeleton className="w-full h-[600px] rounded-lg" />;
  }

  const subtotal = (cart as CartItem[]).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = state.selectedShipping?.price ?? 0;

  // GST is included in subtotal. Calculate the GST component.
  const gstRate = 0.18;
  const gstAmount = (subtotal * gstRate) / (1 + gstRate);
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal + shippingCost - discountAmount;

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "GET10OFF") {
      setAppliedDiscount(0.1);
      toast({
        title: "Discount Applied",
        description: "10% discount has been applied to your order.",
      });
    } else {
      toast({
        title: "Invalid Discount Code",
        description: "The discount code you entered is not valid.",
        variant: "destructive",
      });
    }
    setDiscountCode("");
  };

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {(cart as CartItem[]).map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border">
                {item.images?.[0] ? (
                  <Image
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized={true} // Key prop
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                <span className="absolute top-0 right-0 bg-gray-900/75 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.color && `Color: ${item.color}`}
                  {item.size && `, Size: ${item.size}`}
                </p>
                {item.customization && (
                  <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    Customized
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Discount Code */}
        <div className="flex space-x-2">
          <Input
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <Button variant="secondary" onClick={handleApplyDiscount}>
            Apply
          </Button>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {appliedDiscount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-green-600"
            >
              <span>Discount</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </motion.div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {state.step === 1 ? (
                <span className="text-muted-foreground">
                  Calculated at shipping
                </span>
              ) : (
                `₹${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <span>GST (18%) included</span>
            </div>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center font-medium text-lg">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        {/* Payment Button */}
        <AnimatePresence>
          {state.step < 3 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Button
                className="w-full bg-gray-100 hover:bg-gray-100 cursor-not-allowed text-gray-500"
                disabled
              >
                <Lock className="w-4 h-4 mr-2" />
                Complete shipping details
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PhonePePayment
                amount={total}
                name={state.shippingDetails?.fullName || ""}
                mobile={state.shippingDetails?.phone || ""}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
