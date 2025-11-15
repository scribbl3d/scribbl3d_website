import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutProvider } from "@/providers/CheckoutProvider";
import { Breadcrumbs } from "./components/breadcrumbs";
import OrderSummary from "./components/order-summary";
import ClientCheckoutSteps from "./components/ClientCheckoutSteps";

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <div className="min-h-screen bg-gray-50 pt-[90px]">
        <div className="container mx-auto px-4 py-4 ">
          <Breadcrumbs />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ClientCheckoutSteps />
            </div>
            <div className="lg:col-span-1">
              <Suspense
                fallback={<Skeleton className="w-full h-[600px] rounded-lg" />}
              >
                <OrderSummary />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
}
