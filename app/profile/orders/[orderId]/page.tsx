// app/profile/orders/[orderId]/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { Calendar, IndianRupee } from "lucide-react";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

/* -------------------- Types -------------------- */

const SHIPMENT_STATUSES = [
    "manifested",
    "pickup",
    "in_transit",
    "out_for_delivery",
    "delivered",
] as const;

type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

type DisplayStatus =
    | "payment_pending"
    | "order_confirmed"
    | "order_processing"
    | "order_shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

/* -------------------- Guards & Helpers -------------------- */

function isShipmentStatus(value: any): value is ShipmentStatus {
    return SHIPMENT_STATUSES.includes(value);
}

function getOrderDisplayStatus(
    orderStatus: string,
    shipmentStatus?: ShipmentStatus | null,
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
    if (orderStatus === "delivered" && shipmentStatus === "delivered") {
        return "delivered";
    }

    // 🔑 Shipment-driven states (VERY IMPORTANT)
    if (shipmentStatus) {
        if (shipmentStatus === "manifested") {
            return "order_processing";
        }

        if (shipmentStatus === "out_for_delivery") {
            return "out_for_delivery";
        }

        if (shipmentStatus === "delivered") {
            return "delivered";
        }

        // pickup | in_transit
        return "order_shipped";
    }

    // No shipment yet → order-based
    if (orderStatus === "confirmed") {
        return "order_confirmed";
    }

    if (orderStatus === "shipped") {
        return "order_processing";
    }

    return "order_confirmed";
}

const STATUS_UI: Record<
    DisplayStatus,
    { label: string; className: string; emoji: string }
> = {
    payment_pending: {
        label: "Payment Pending",
        className: "bg-yellow-100 text-yellow-900",
        emoji: "⏳",
    },
    order_confirmed: {
        label: "Order Confirmed",
        className: "bg-blue-100 text-blue-900",
        emoji: "✅",
    },
    order_processing: {
        label: "Order Processing",
        className: "bg-purple-100 text-purple-900",
        emoji: "⚙️",
    },
    order_shipped: {
        label: "Order Shipped",
        className: "bg-indigo-100 text-indigo-900",
        emoji: "🚚",
    },
    out_for_delivery: {
        label: "Out for Delivery",
        className: "bg-orange-100 text-orange-900",
        emoji: "🚚💨",
    },
    delivered: {
        label: "Delivered",
        className: "bg-green-100 text-green-900",
        emoji: "📦",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-900",
        emoji: "❌",
    },
};

function safeParseJson(x: any) {
    if (x == null) return null;
    if (typeof x === "object") return x;
    if (typeof x === "string") {
        try {
            return JSON.parse(x);
        } catch {
            return null;
        }
    }
    return null;
}

/* -------------------- Page -------------------- */

type PageProps = {
    params: Promise<{ orderId: string }>;
};

export default async function OrderDetailsPage({ params }: PageProps) {
    const { orderId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { shipment: true },
    });

    if (!order || order.userId !== session.user.id) notFound();

    const items =
        typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items || [];

    const shippingAddress =
        typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;

    const trackingInfo = safeParseJson(order.trackingInfo) || {};
    const waybill = trackingInfo.waybill || trackingInfo.trackingNumber || null;

    const trackingUrl =
        trackingInfo.trackingUrl ||
        (waybill ? `https://delhivery.com/track/package/${waybill}` : null);

    const shipmentStatus = isShipmentStatus(order.shipment?.status)
        ? order.shipment?.status
        : undefined;

    const displayStatus = getOrderDisplayStatus(order.status, shipmentStatus);

    const statusUI = STATUS_UI[displayStatus];

    /* -------------------- UI -------------------- */

    return (
        <div className="max-w-5xl mx-auto pt-24 pb-12 px-6">
            {/* Breadcrumb / Back Nav */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <Link
                    href="/profile?tab=orders"
                    className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                    <span className="text-lg">←</span> Back to Orders
                </Link>
                <span className="mx-1">/</span>
                <Link href="/profile" className="hover:underline">
                    Profile
                </Link>
                <span className="mx-1">/</span>
                <Link href="/profile?tab=orders" className="hover:underline">
                    Orders
                </Link>
                <span className="mx-1">/</span>
                <span className="text-gray-800 font-semibold">
                    Order Details
                </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order Details
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Order ID:{" "}
                            <span className="select-all font-medium">
                                {order.id}
                            </span>
                        </p>
                    </div>

                    <span
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-sm ${statusUI.className}`}
                    >
                        <span className="text-lg">{statusUI.emoji}</span>
                        {statusUI.label}
                    </span>
                </div>

                {/* Tracking */}
                {trackingUrl &&
                    (displayStatus === "order_shipped" ||
                        displayStatus === "out_for_delivery") && (
                        <div className="mb-6">
                            <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:scale-105 transition"
                            >
                                🚚 Track Order
                            </a>
                        </div>
                    )}

                {/* Items */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Items</h2>
                    <div className="space-y-3">
                        {items.map((item: any, idx: number) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border"
                            >
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.description || ""}
                                    </div>
                                </div>

                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                                    x{item.quantity || 1}
                                </span>

                                <span className="flex items-center gap-1 font-bold text-gray-800">
                                    <IndianRupee className="w-4 h-4" />
                                    {item.price || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">
                        Shipping Address
                    </h2>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 border">
                        <div>{shippingAddress.name}</div>
                        <div>{shippingAddress.street}</div>
                        <div>
                            {shippingAddress.city}, {shippingAddress.state}{" "}
                            {shippingAddress.zipCode}
                        </div>
                        <div>{shippingAddress.country}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
