import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Breadcrumbs } from "./components/breadcrumbs";
import ClientCheckoutSteps from "./components/ClientCheckoutSteps";
import OrderSummary from "./components/order-summary";

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-[90px]">
            <div className="container mx-auto px-4 py-4 ">
                <Breadcrumbs />
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <ClientCheckoutSteps />
                    </div>
                    <div className="lg:col-span-1">
                        <Suspense
                            fallback={
                                <Skeleton className="w-full h-[600px] rounded-lg" />
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
