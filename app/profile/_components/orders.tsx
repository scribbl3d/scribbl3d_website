"use client";

import { DbOrder } from "@/app/types";
import {
    ArrowLeft,
    CheckCircle,
    ChevronDown,
    Clock,
    Package,
    ShieldCheck,
    Truck,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

/* -------------------- Types & Status Logic (UNCHANGED) -------------------- */

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
    | "dispatched"
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

function getOrderDisplayStatus(
    orderStatus: OrderStatus,
    shipment?: Shipment | null,
): DisplayStatus {
    if (orderStatus === "payment_pending") return "payment_pending";
    if (orderStatus === "cancelled") return "cancelled";
    if (orderStatus === "delivered" && shipment?.status === "delivered")
        return "delivered";
    if (shipment) {
        if (shipment.status === "manifested") return "order_processing";
        if (shipment.status === "dispatched") return "out_for_delivery";
        if (shipment.status === "delivered") return "delivered";
        return "order_shipped";
    }
    if (orderStatus === "confirmed") return "order_confirmed";
    if (orderStatus === "shipped") return "order_processing";
    return "order_confirmed";
}

const ORDER_STATUS_UI: Record<
    DisplayStatus,
    { label: string; className: string; Icon: any }
> = {
    payment_pending: {
        label: "Payment Pending",
        Icon: Clock,
        className: "border-yellow-300 text-yellow-700 bg-yellow-50",
    },
    order_confirmed: {
        label: "Order Placed",
        Icon: CheckCircle,
        className: "border-[#93C5FD] text-[#1E40AF] bg-[#EFF6FF]",
    },
    order_processing: {
        label: "Order Confirmed",
        Icon: ShieldCheck,
        className: "border-[#A3B3FF] text-[#372AAC] bg-[#EEF1FF]",
    },
    order_shipped: {
        label: "Order Shipped",
        Icon: Package,
        className: "border-purple-300 text-purple-700 bg-purple-50",
    },
    out_for_delivery: {
        label: "Out For Delivery",
        Icon: Truck,
        className: "border-sky-300 text-sky-700 bg-sky-50",
    },
    delivered: {
        label: "Delivered",
        Icon: CheckCircle,
        className: "border-green-300 text-green-700 bg-green-50",
    },
    cancelled: {
        label: "Cancelled",
        Icon: XCircle,
        className: "border-red-300 text-red-700 bg-red-50",
    },
};

const ITEMS_PER_PAGE = 5;

/* -------------------- Component -------------------- */

export function Orders({ orders }: OrdersProps) {
    const [filter, setFilter] = useState<"all" | DisplayStatus>("all");
    const [page, setPage] = useState(1);

    const filteredOrders = useMemo(() => {
        if (filter === "all") return orders;
        return orders.filter(
            (o) => getOrderDisplayStatus(o.status, o.shipment) === filter,
        );
    }, [orders, filter]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 md:p-6">
            {/* Header */}
            <div className="mb-5 md:mb-6">
                <button
                    onClick={() => (window.location.href = "/profile")}
                    className="flex items-center gap-1 text-sm text-gray-500 mb-3 hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            View and track all your orders
                        </p>
                    </div>

                    {/* Filter */}
                    <div className="relative self-start md:self-auto">
                        <select
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value as any);
                                setPage(1);
                            }}
                            className="appearance-none border border-gray-300 rounded-full px-4 py-2 pr-9 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                            <option value="all">All Orders</option>
                            {Object.keys(ORDER_STATUS_UI).map((key) => (
                                <option key={key} value={key}>
                                    {
                                        ORDER_STATUS_UI[key as DisplayStatus]
                                            .label
                                    }
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-5 md:mb-6" />

            {/* Empty State */}
            {filteredOrders.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        {filter !== "all" ? (
                            (() => {
                                const StatusIcon = ORDER_STATUS_UI[filter].Icon;
                                return (
                                    <StatusIcon className="w-8 h-8 text-gray-400" />
                                );
                            })()
                        ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No orders found
                    </h3>
                    <p className="text-sm text-gray-500">
                        {filter === "all"
                            ? "You haven't placed any orders yet."
                            : `You don't have any orders with "${ORDER_STATUS_UI[filter].label}" status.`}
                    </p>
                    {filter !== "all" && (
                        <button
                            onClick={() => {
                                setFilter("all");
                                setPage(1);
                            }}
                            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            View all orders
                        </button>
                    )}
                </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
                {paginatedOrders.map((order) => {
                    const displayStatus = getOrderDisplayStatus(
                        order.status,
                        order.shipment,
                    );
                    const statusUI = ORDER_STATUS_UI[displayStatus];
                    const items = Array.isArray(order.items) ? order.items : [];

                    return (
                        <div
                            key={order.id}
                            className={`bg-white border border-gray-200 rounded-2xl overflow-hidden`}
                        >
                            {/* Desktop Layout */}
                            <div className="hidden md:flex md:justify-between md:gap-6 p-6">
                                {/* Left Side: Order Info & Items */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Order #
                                            {order.id.slice(0, 8).toUpperCase()}
                                        </h2>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusUI.className}`}
                                        >
                                            <statusUI.Icon className="w-3 h-3" />
                                            {statusUI.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Placed on{" "}
                                        {new Date(
                                            order.createdAt,
                                        ).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {items.length} item
                                        {items.length !== 1 ? "s" : ""}
                                    </p>

                                    {/* Items list */}
                                    <div className="space-y-1.5">
                                        {items.slice(0, 2).map((item, i) => (
                                            <p
                                                key={i}
                                                className="text-sm text-gray-600"
                                            >
                                                <span className="text-gray-400 mr-2">
                                                    •
                                                </span>
                                                {item.name}
                                                <span className="text-gray-400 ml-1">
                                                    × {item.quantity || 1}
                                                </span>
                                            </p>
                                        ))}
                                        {items.length > 2 && (
                                            <p className="text-xs font-semibold uppercase text-gray-400 ml-4">
                                                + {items.length - 2} more item
                                                {items.length - 2 !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Pricing & Action */}
                                <div className="flex flex-col items-end justify-between min-w-[140px]">
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                                            Order Total
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹
                                            {Number(
                                                order.totalAmount,
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <button
                                        className="h-10 px-6 bg-[#1A1A1A] hover:bg-black text-white rounded-lg text-sm font-semibold transition-all active:scale-[0.98]"
                                        onClick={() =>
                                            (window.location.href = `/profile/orders/${order.id}`)
                                        }
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="md:hidden p-4 pb-5">
                                {/* Order header row */}
                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                                        Order #
                                        {order.id.slice(0, 8).toUpperCase()}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${statusUI.className}`}
                                    >
                                        <statusUI.Icon className="w-3 h-3" />
                                        {statusUI.label}
                                    </span>
                                </div>

                                {/* Date & item count */}
                                <p className="text-[13px] text-gray-500 leading-relaxed">
                                    Placed on{" "}
                                    {new Date(
                                        order.createdAt,
                                    ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                                <p className="text-[13px] text-gray-500 mb-3">
                                    {items.length} item
                                    {items.length !== 1 ? "s" : ""}
                                </p>

                                {/* Items list */}
                                <div className="space-y-1 mb-3">
                                    {items.slice(0, 2).map((item, i) => (
                                        <p
                                            key={i}
                                            className="text-[13px] text-gray-700 leading-snug"
                                        >
                                            <span className="text-gray-400 mr-1.5">
                                                •
                                            </span>
                                            {item.name}
                                            <span className="text-gray-400 ml-1">
                                                × {item.quantity || 1}
                                            </span>
                                        </p>
                                    ))}
                                    {items.length > 2 && (
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 pl-3">
                                            + {items.length - 2} more item
                                            {items.length - 2 !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>

                                {/* Bottom row: Price and Button */}
                                <div className="flex items-end justify-between pt-1">
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-400 tracking-tight mb-0.5">
                                            Order Total
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 leading-none">
                                            ₹
                                            {Number(
                                                order.totalAmount,
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <button
                                        className="h-9 px-5 bg-[#1A1A1A] hover:bg-black text-white rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98]"
                                        onClick={() =>
                                            (window.location.href = `/profile/orders/${order.id}`)
                                        }
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                        ).map((pageNum) => {
                            const showPage =
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                Math.abs(pageNum - page) <= 1;

                            const showEllipsisBefore =
                                pageNum === page - 2 && page > 3;
                            const showEllipsisAfter =
                                pageNum === page + 2 && page < totalPages - 2;

                            if (showEllipsisBefore || showEllipsisAfter) {
                                return (
                                    <span
                                        key={pageNum}
                                        className="px-2 py-2 text-sm text-gray-400"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            if (!showPage) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`min-w-[36px] h-9 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        page === pageNum
                                            ? "bg-[#1A1A1A] text-white"
                                            : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
