"use client";

import { DbOrder, User } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatOrderIdRaw } from "@/lib/format-order-id";
import Link from "next/link";

interface WishlistItem {
    id: string;
    productId: string | null;
    prebuiltProductId: string | null;
    wishlistId: string;
    product: {
        id: string;
        name: string;
        price: number;
        images: string[];
    } | null;
    prebuiltProduct: {
        id: string;
        name: string;
        price: number;
        images: string[];
    } | null;
}

interface OverviewProps {
    user: User;
    orders: DbOrder[];
    wishlist: WishlistItem[];
}

export function Overview({ user, orders, wishlist }: OverviewProps) {
    const recentOrders = orders.slice(0, 3);

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                    Welcome back, {user.name}
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1">
                    Here is an overview of your account
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <Card>
                    <CardHeader className="pb-3 md:pb-4">
                        <div className="flex flex-col items-start gap-1.5 md:gap-2">
                            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">
                                Total Orders
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                {orders.length}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="mb-3 md:mb-4">
                            <div className="text-xs md:text-sm font-semibold mb-1.5 md:mb-2">
                                Recent Orders
                            </div>
                            {recentOrders.length > 0 ? (
                                <div className="space-y-1.5 md:space-y-2">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between border-b last:border-0 pb-1.5 md:pb-2"
                                        >
                                            <div>
                                                <span className="text-sm md:text-base font-medium">
                                                    Order #
                                                    {formatOrderIdRaw(order.id)}
                                                </span>
                                                <span className="ml-1.5 md:ml-2 text-[11px] md:text-xs text-gray-500">
                                                    {order.createdAt.toLocaleDateString(
                                                        "en-IN",
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-xs md:text-sm font-semibold">
                                                ₹{order.totalAmount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-xs md:text-sm italic">
                                    No orders yet
                                </div>
                            )}
                        </div>
                        <Button variant="outline" asChild className="w-full text-xs md:text-sm h-9 md:h-10">
                            <Link href="/profile?tab=orders">
                                View All Orders
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3 md:pb-4">
                        <div className="flex flex-col items-start gap-1.5 md:gap-2">
                            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">
                                Wishlist Items
                            </div>
                            <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                {wishlist.length}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="mb-3 md:mb-4">
                            <div className="text-xs md:text-sm font-semibold mb-1.5 md:mb-2">
                                Recent Wishlist
                            </div>
                            {wishlist.length > 0 ? (
                                <div className="space-y-1.5 md:space-y-2">
                                    {wishlist.slice(0, 3).map((item) => {
                                        const product =
                                            item.product ||
                                            item.prebuiltProduct;
                                        if (!product) return null;
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 md:gap-3 border-b last:border-0 pb-1.5 md:pb-2"
                                            >
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs text-gray-500 truncate">
                                                        ₹{product.price}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-xs md:text-sm italic">
                                    No wishlist items
                                </div>
                            )}
                        </div>
                        <Button variant="outline" asChild className="w-full text-xs md:text-sm h-9 md:h-10">
                            <Link href="/profile?tab=wishlist">
                                View All Wishlist
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
