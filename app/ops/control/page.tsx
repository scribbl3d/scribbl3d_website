"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useEffect, useState } from "react";

export default function AdminPage() {
    const router = useRouter();
    const [notificationCounts, setNotificationCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchNotificationCounts();
        const interval = setInterval(fetchNotificationCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotificationCounts = async () => {
        try {
            const res = await fetch("/api/admin/notification-counts");
            if (res.ok) {
                const data = await res.json();
                setNotificationCounts(data);
            }
        } catch (error) {
            console.error("Failed to fetch notification counts:", error);
        }
    };

    const handleLogout = async () => {
        const response = await fetch("/api/admin/logout", { method: "POST" });
        if (response.ok) {
            router.push("/ops/control/login");
        } else {
            console.error("Logout failed");
        }
    };

    return (
        <div className="px-4 md:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h2>
                <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
                    Logout
                </Button>
            </div>
            <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Link href="/ops/control/orders" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        Orders
                        <NotificationBadge count={notificationCounts.orders || 0} />
                    </Button>
                </Link>{" "}
                <Link href="/ops/control/landing" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Landing Page
                    </Button>
                </Link>
                <Link href="/ops/control/filaments-new" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Filaments
                    </Button>
                </Link>
                <Link href="/ops/control/prebuilt-products" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Prebuilt Products
                    </Button>
                </Link>
                <Link href="/ops/control/printers" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Printers
                    </Button>
                </Link>
                <Link href="/ops/control/resins" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Resins
                    </Button>
                </Link>
                <Link href="/ops/control/blogs" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Blogs
                    </Button>
                </Link>
                <Link href="/ops/control/about" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        About us
                    </Button>
                </Link>
                <Link
                    href="/ops/control/small-batch-manufacturing"
                    className="block"
                >
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        Small Batch Manufacturing
                        <NotificationBadge count={notificationCounts['small-batch-manufacturing'] || 0} />
                    </Button>
                </Link>
                <Link href="/ops/control/prototyping-request" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        Prototyping Requests
                        <NotificationBadge count={notificationCounts['prototyping-requests'] || 0} />
                    </Button>
                </Link>
                <Link
                    href="/ops/control/personalise-responses"
                    className="block"
                >
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        Personalise Form Responses
                        <NotificationBadge count={notificationCounts['personalise-responses'] || 0} />
                    </Button>
                </Link>
                <Link href="/ops/control/form3d-responses" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        3D Printing Requests
                        <NotificationBadge count={notificationCounts['form3d-responses'] || 0} />
                    </Button>
                </Link>
                <Link href="/ops/control/announcements" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Manage Announcements
                    </Button>
                </Link>
                <Link href="/ops/control/discounts" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Discounts
                    </Button>
                </Link>
                <Link href="/ops/control/stock-notifications" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg relative">
                        Out of Stock Notifications
                        <NotificationBadge count={notificationCounts['stock-notifications'] || 0} />
                    </Button>
                </Link>
            </nav>
        </div>
    );
}
