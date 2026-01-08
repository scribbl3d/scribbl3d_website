"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export function Overview({ user, orders }) {
    const recentOrders = orders.slice(0, 3);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome back, {user.name}
                </h1>
                <p className="text-gray-500 mt-1">
                    Here is an overview of your account
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start gap-2">
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                Total Orders
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                {orders.length}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="text-sm font-semibold mb-2">
                                Recent Orders
                            </div>
                            {recentOrders.length > 0 ? (
                                <div className="space-y-2">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between border-b last:border-0 pb-2"
                                        >
                                            <div>
                                                <span className="font-medium">
                                                    Order #
                                                    {order.id.slice(0, 8)}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {order.createdAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                ₹{order.totalAmount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-sm italic">
                                    No orders yet
                                </div>
                            )}
                        </div>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/profile?tab=orders">
                                View All Orders
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent></CardContent>
                </Card>
            </div>
        </div>
    );
}
