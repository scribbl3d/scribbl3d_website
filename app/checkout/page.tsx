import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Breadcrumbs } from "./components/breadcrumbs";
import ClientCheckoutSteps from "./components/ClientCheckoutSteps";
import OrderSummary from "./components/order-summary";

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-[72px] sm:pt-[80px] md:pt-[90px]">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <Breadcrumbs />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 min-w-0">
                        <ClientCheckoutSteps />
                    </div>
                    <div className="lg:col-span-1 min-w-0">
                        <Suspense
                            fallback={
                                <Skeleton className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg" />
                            }
                        >
                            <OrderSummary />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
