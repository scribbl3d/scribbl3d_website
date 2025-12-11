// app/profile/orders/[orderId]/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { IndianRupee } from "lucide-react";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
    params: Promise<{ orderId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function OrderDetailsPage({
    params,
    searchParams,
}: PageProps) {
    const [{ orderId }] = await Promise.all([params, searchParams]);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const order = await db.order.findUnique({
        where: { id: orderId },
    });

    if (!order || order.userId !== session.user.id) {
        notFound();
    }

    // Parse items and addresses if stored as JSON strings
    let items: any[] = [];
    try {
        items =
            typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items || [];
    } catch {
        items = [];
    }

    let shippingAddress: any = order.shippingAddress;
    try {
        shippingAddress =
            typeof order.shippingAddress === "string"
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress;
    } catch {
        shippingAddress = order.shippingAddress;
    }

    // --- Fetch correct images for each item ---
    const productIds = items
        .filter((item: any) => item.productId)
        .map((item: any) => item.productId);
    const prebuiltProductIds = items
        .filter((item: any) => item.prebuiltProductId)
        .map((item: any) => item.prebuiltProductId);

    const [products, prebuiltProducts] = await Promise.all([
        productIds.length > 0
            ? db.product.findMany({ where: { id: { in: productIds } } })
            : Promise.resolve([]),
        prebuiltProductIds.length > 0
            ? db.prebuiltProduct.findMany({
                  where: { id: { in: prebuiltProductIds } },
              })
            : Promise.resolve([]),
    ]);

    const productImageMap = Object.fromEntries(
        products.map((p: any) => [
            p.id,
            Array.isArray(p.images)
                ? p.images[0]
                : typeof p.images === "string"
                  ? p.images
                  : null,
        ])
    );
    const prebuiltProductImageMap = Object.fromEntries(
        prebuiltProducts.map((p: any) => [
            p.id,
            Array.isArray(p.images)
                ? p.images[0]
                : typeof p.images === "string"
                  ? p.images
                  : null,
        ])
    );

    function getItemImage(item: any) {
        if (item.productId && productImageMap[item.productId])
            return productImageMap[item.productId];
        if (
            item.prebuiltProductId &&
            prebuiltProductImageMap[item.prebuiltProductId]
        )
            return prebuiltProductImageMap[item.prebuiltProductId];
        return null;
    }

    // Safe parse trackingInfo (may be stringified or object)
    const trackingInfoRaw = order.trackingInfo ?? null;
    const trackingInfo = safeParseJson(trackingInfoRaw) || {};

    const waybill =
        trackingInfo.waybill ||
        trackingInfo.trackingNumber ||
        trackingInfo.tracking_number ||
        trackingInfo.awb ||
        null;

    const explicitTrackingUrl =
        trackingInfo.trackingUrl ||
        trackingInfo.tracking_link ||
        trackingInfo.tracking_link_url ||
        null;

    const baseWaybillUrl =
        process.env.NEXT_PUBLIC_DELHIVERY_WAYBILL_URL ||
        "https://delhivery.com/track/package";

    const fallbackWaybillUrl = waybill
        ? `${baseWaybillUrl}${baseWaybillUrl.endsWith("/") ? "" : "/"}${waybill}`
        : null;

    const finalTrackingUrl = explicitTrackingUrl || fallbackWaybillUrl || null;

    const formatPrice = (amount: number) =>
        `₹${amount?.toLocaleString?.("en-IN") ?? amount}`;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 bg-white/80 rounded-lg shadow-sm mt-10">
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href="/profile?tab=orders"
                    className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                    <span className="text-lg">←</span>
                    Back to Orders
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/profile" className="text-gray-500 hover:underline">
                    Profile
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link
                    href="/profile?tab=orders"
                    className="text-gray-500 hover:underline"
                >
                    Orders
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700 font-semibold">
                    Order Details
                </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">Order Details</h1>

            <div className="mb-4">
                <div className="text-gray-600 text-sm">
                    Order ID: <span className="select-all">{order.id}</span>
                </div>
                <div className="text-gray-600 text-sm">
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                    Status:{" "}
                    <span className="font-semibold">{order.status}</span>
                </div>

                {/* WAYBILL text directly below status */}
                {waybill ? (
                    <div className="text-gray-700 text-sm mb-3">
                        Waybill: <span className="font-medium">{waybill}</span>
                    </div>
                ) : null}

                {/* Track Order button appears after the waybill (or directly after status if no waybill) */}
                {order.status === "shipped" && finalTrackingUrl ? (
                    <div>
                        <a
                            href={finalTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Track Order
                        </a>
                    </div>
                ) : order.status === "shipped" ? (
                    <div className="text-sm text-gray-600 italic">
                        Shipment created — tracking pending.
                    </div>
                ) : null}
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Items</h2>
                {Array.isArray(items) && items.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {items.map((item: any, idx: number) => {
                            const image = getItemImage(item);
                            return (
                                <li
                                    key={idx}
                                    className="py-3 flex items-center gap-4"
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded object-cover border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 border">
                                            <span className="text-2xl">🛍️</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-base text-gray-900 truncate">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {item.description || ""}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm">
                                            Qty: {item.quantity || 1}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                                            <IndianRupee className="w-4 h-4" />
                                            {item.price || 0}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-gray-400 text-sm italic">
                        No items found
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
                {shippingAddress &&
                typeof shippingAddress === "object" &&
                !Array.isArray(shippingAddress) ? (
                    <div className="text-gray-700 text-sm">
                        <div>
                            {typeof shippingAddress.name === "string"
                                ? shippingAddress.name
                                : typeof shippingAddress.fullName === "string"
                                  ? shippingAddress.fullName
                                  : ""}
                        </div>
                        <div>
                            {typeof shippingAddress.street === "string"
                                ? shippingAddress.street
                                : ""}
                        </div>
                        <div>
                            {typeof shippingAddress.city === "string"
                                ? shippingAddress.city
                                : ""}
                            ,{" "}
                            {typeof shippingAddress.state === "string"
                                ? shippingAddress.state
                                : ""}{" "}
                            {typeof shippingAddress.zipCode === "string"
                                ? shippingAddress.zipCode
                                : ""}
                        </div>
                        <div>
                            {typeof shippingAddress.country === "string"
                                ? shippingAddress.country
                                : ""}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm italic">
                        No shipping address
                    </div>
                )}
            </div>
        </div>
    );
}
