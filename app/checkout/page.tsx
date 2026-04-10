import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Breadcrumbs } from "./components/breadcrumbs";
import ClientCheckoutSteps from "./components/ClientCheckoutSteps";
import OrderSummary from "./components/order-summary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string }>;
}) {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login?callbackUrl=/checkout");
    }
    const resolvedSearchParams = await searchParams;
    const mode = resolvedSearchParams?.mode;

    if (mode !== "buynow") {
        const cookieStore = await cookies();
        const successMarker = cookieStore.get("post_payment_success")?.value;
        const orderId = cookieStore.get("post_payment_order_id")?.value;

        if (successMarker === "1") {
            redirect(orderId ? `/profile/orders/${orderId}` : "/profile?tab=orders");
        }
    }

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
