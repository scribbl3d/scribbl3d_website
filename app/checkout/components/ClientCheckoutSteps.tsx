"use client";

import { useCheckout } from "@/providers/CheckoutProvider";
import CheckoutForm from "./checkout-form";
import { ShippingOptions } from "./shipping-options";
import { Confirmation } from "./confirmation";

export default function ClientCheckoutSteps() {
  const { state } = useCheckout();

  return (
    <div className="space-y-4">
      {state.step === 1 && <CheckoutForm />}
      {state.step === 2 && <ShippingOptions />}
      {state.step === 3 && <Confirmation />}
    </div>
  );
}
