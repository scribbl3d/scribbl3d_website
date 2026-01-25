"use client";

import { DbOrder } from "@/app/types";
import { Calendar, IndianRupee } from "lucide-react";

/* -------------------- Types -------------------- */

type OrderStatus =
    | "payment_pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";

type ShipmentStatus =
    | "manifested"
    | "pickup"
    | "in_transit"
    | "out_for_delivery"
    | "delivered";

type DisplayStatus =
    | "payment_pending"
    | "order_confirmed"
    | "order_processing"
    | "order_shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

interface Shipment {
    status: ShipmentStatus;
}

interface OrdersProps {
    orders: (DbOrder & {
        status: OrderStatus;
        shipment?: Shipment | null;
    })[];
}

/* -------------------- Status Helpers -------------------- */

function getOrderDisplayStatus(
    orderStatus: OrderStatus,
    shipment?: Shipment | null,
): DisplayStatus {
    // Payment pending
    if (orderStatus === "payment_pending") {
        return "payment_pending";
    }

    // Cancelled overrides everything
    if (orderStatus === "cancelled") {
        return "cancelled";
    }

    // Delivered (hard stop)
    if (orderStatus === "delivered" && shipment?.status === "delivered") {
        return "delivered";
    }

    // 🔑 Shipment-driven states (VERY IMPORTANT)
    if (shipment) {
        if (shipment.status === "manifested") {
            return "order_processing";
        }

        if (shipment.status === "out_for_delivery") {
            return "out_for_delivery";
        }

        if (shipment.status === "delivered") {
            return "delivered";
        }

        // pickup | in_transit
        return "order_shipped";
    }

    // No shipment yet → order-based states
    if (orderStatus === "confirmed") {
        return "order_confirmed";
    }

    if (orderStatus === "shipped") {
        return "order_processing";
    }

    return "order_confirmed";
}

/* -------------------- UI Config -------------------- */

const ORDER_STATUS_UI: Record<
    DisplayStatus,
    { label: string; className: string; emoji: string }
> = {
    payment_pending: {
        label: "Payment Pending",
        className: "bg-yellow-200 text-yellow-900",
        emoji: "⏳",
    },
    order_confirmed: {
        label: "Order Confirmed",
        className: "bg-blue-200 text-blue-900",
        emoji: "✅",
    },
    order_processing: {
        label: "Order Processing",
        className: "bg-purple-200 text-purple-900",
        emoji: "⚙️",
    },
    order_shipped: {
        label: "Order Shipped",
        className: "bg-indigo-200 text-indigo-900",
        emoji: "🚚",
    },
    out_for_delivery: {
        label: "Out for Delivery",
        className: "bg-orange-200 text-orange-900",
        emoji: "🚚💨",
    },
    delivered: {
        label: "Delivered",
        className: "bg-green-200 text-green-900",
        emoji: "📦",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-red-200 text-red-900",
        emoji: "❌",
    },
};

/* -------------------- Component -------------------- */

export function Orders({ orders }: OrdersProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Your Orders
                </h1>
                <p className="text-gray-500 mt-1">
                    View and manage your orders
                </p>
            </div>

            <div className="space-y-4">
                {orders.length > 0 ? (
                    orders.map((order) => {
                        const displayStatus = getOrderDisplayStatus(
                            order.status,
                            order.shipment,
                        );
                        const statusUI = ORDER_STATUS_UI[displayStatus];

                        const items: any[] = Array.isArray(order.items)
                            ? order.items
                            : typeof order.items === "string"
                              ? (() => {
                                    try {
                                        const parsed = JSON.parse(order.items);
                                        return Array.isArray(parsed)
                                            ? parsed
                                            : Object.values(parsed || {});
                                    } catch {
                                        return [];
                                    }
                                })()
                              : order.items && typeof order.items === "object"
                                ? Object.values(order.items)
                                : [];

                        return (
                            <div
                                key={order.id}
                                className="bg-[#f6fbff] flex flex-col md:flex-row rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                                onClick={() =>
                                    (window.location.href = `/profile/orders/${order.id}`)
                                }
                            >
                                {/* Left */}
                                <div className="px-4 py-6 md:w-1/5 border-b md:border-b-0 md:border-r border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(
                                            order.createdAt,
                                        ).toLocaleDateString()}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="font-semibold">
                                            Order ID:
                                        </span>{" "}
                                        <span className="select-all">
                                            {order.id.slice(0, 8)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 mt-3 text-xl font-bold">
                                        <IndianRupee className="w-5 h-5" />
                                        {order.totalAmount}
                                    </div>
                                </div>

                                {/* Middle */}
                                <div className="px-4 py-6 md:w-3/5">
                                    <div className="bg-white/70 rounded-lg p-2 space-y-2">
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <div
                                                    key={item.id || idx}
                                                    className="flex items-center gap-3 border-b last:border-b-0 py-2"
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-10 h-10 rounded object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                                            🛍️
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold truncate">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {item.description ||
                                                                ""}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                            x
                                                            {item.quantity || 1}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-sm font-semibold">
                                                            <IndianRupee className="w-4 h-4" />
                                                            {item.price || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-400 italic">
                                                No items found
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="px-4 py-6 md:w-1/4 flex flex-col items-end justify-between">
                                    <span
                                        className={`flex items-center gap-1 text-sm font-bold px-4 py-1 rounded-full ${statusUI.className}`}
                                    >
                                        <span className="text-lg">
                                            {statusUI.emoji}
                                        </span>
                                        {statusUI.label}
                                    </span>

                                    <button
                                        className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:scale-105 transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `/profile/orders/${order.id}`;
                                        }}
                                    >
                                        🔍 View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No orders found</p>
                )}
            </div>
        </div>
    );
}
