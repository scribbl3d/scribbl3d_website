"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Orders } from "./_components/orders";
import { PersonalInfo } from "./_components/personal-info";

interface ProfileTabsProps {
    defaultTab: string;
    user: any; // Replace with your specific user type
    initialAddresses: any[]; // Replace with your specific address type
    orders: any[]; // Add this line for orders
}

export default function ProfileTabs({
    defaultTab,
    user,
    orders, // Add this line
}: ProfileTabsProps) {
    const [isClient, setIsClient] = useState(false);
    const isMobile = useMediaQuery("(max-width: 640px)");
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <Skeleton className="w-full h-[500px] rounded-lg" />;
    }

    // Force mobile UI for demonstration (remove this after confirming fix)
    // const isMobile = true;

    if (isMobile) {
        return (
            <div className="relative min-h-[calc(100vh-170px)] bg-white pb-24 flex flex-col w-full max-w-full">
                <main className="flex-1 px-0 pt-2 w-full max-w-full">
                    {/* Remove sidebar, make content full width */}
                    {activeTab === "personal-info" && (
                        <PersonalInfo user={user} />
                    )}

                    {activeTab === "orders" && <Orders orders={orders} />}
                </main>
                <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around items-center h-16 shadow-lg">
                    <button
                        className={`flex flex-col items-center justify-center flex-1 py-2 ${
                            activeTab === "personal-info"
                                ? "text-blue-600 font-semibold"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("personal-info")}
                        aria-label="Personal Info"
                    >
                        <User className="w-6 h-6 mb-1" />
                        <span className="text-xs">Info</span>
                    </button>

                    <button
                        className={`flex flex-col items-center justify-center flex-1 py-2 ${
                            activeTab === "orders"
                                ? "text-blue-600 font-semibold"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("orders")}
                        aria-label="Orders"
                    >
                        <ShoppingBag className="w-6 h-6 mb-1" />
                        <span className="text-xs">Orders</span>
                    </button>
                </nav>
            </div>
        );
    }

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-fit">
                <TabsTrigger value="personal-info">Personal Info</TabsTrigger>

                <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <div className="mt-6">
                <TabsContent value="personal-info">
                    <PersonalInfo user={user} />
                </TabsContent>

                <TabsContent value="orders">
                    <Orders orders={orders} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
