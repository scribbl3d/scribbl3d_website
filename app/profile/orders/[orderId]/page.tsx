// app/profile/orders/[orderId]/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import {
    AlertCircle,
    ChevronLeft,
    CreditCard,
    Landmark,
    Package,
    Smartphone,
    Truck,
    Wallet,
} from "lucide-react";
import { getServerSession } from "next-auth/next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CancelOrderButton } from "./CancelOrderButton";
import { ContactSupportButton } from "./ContactSupportModal";
import { CopyButton } from "./CopyButton";

// Force dynamic rendering to prevent caching of authenticated pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { DownloadInvoiceButton } from "./DownloadInvoiceButton";
import { GiveFeedbackButton } from "./FeedbackModal";
import { StatusBanner } from "./StatusBanner";

/* ────────────────────── Types ────────────────────── */

type LocalOrderStatus =
    | "payment_pending"
    | "payment_failed"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";

type LocalShipmentStatus =
    | "manifested"
    | "pickup"
    | "in_transit"
    | "dispatched"
    | "delivered";

type DisplayStatus =
    | "payment_pending"
    | "payment_failed"
    | "not_completed"
    | "order_confirmed"
    | "order_processing"
    | "order_shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

/* ────────────────────── Status Logic ────────────────────── */

function getOrderDisplayStatus(
    orderStatus: LocalOrderStatus,
    shipmentStatus?: LocalShipmentStatus | null,
): DisplayStatus {
    if (orderStatus === "payment_pending") return "payment_pending";
    if (orderStatus === "payment_failed") return "payment_failed";
    if (orderStatus === "cancelled") return "cancelled";
    if (orderStatus === "delivered" && shipmentStatus === "delivered")
        return "delivered";

    if (shipmentStatus) {
        if (shipmentStatus === "manifested") return "order_processing";
        if (shipmentStatus === "dispatched") return "out_for_delivery";
        if (shipmentStatus === "delivered") return "delivered";
        // pickup | in_transit
        return "order_shipped";
    }

    if (orderStatus === "confirmed") return "order_confirmed";
    if (orderStatus === "shipped") return "order_processing";

    // Fallback for any unknown/unhandled status
    return "not_completed";
}

/* ────────────────────── Helpers ────────────────────── */

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

function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-IN").format(amount);
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatSize(size: string | number | null | undefined): string | null {
    if (size == null || size === "") return null;
    const str = String(size).trim();

    if (/[a-zA-Z]/.test(str)) {
        const gramsMatch = str.match(/^(\d+(?:\.\d+)?)\s*g$/i);
        if (gramsMatch) {
            const grams = parseFloat(gramsMatch[1]);
            if (grams >= 1000) {
                return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
            }
            return `${grams}g`;
        }
        return str;
    }

    const num = parseFloat(str);
    if (isNaN(num)) return str;
    if (num >= 1000) {
        return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)} kg`;
    }
    return `${num}g`;
}

/* ────────────────────── Page ────────────────────── */

type PageProps = {
    params: Promise<{ orderId: string }>;
};

export default async function OrderDetailsPage({ params }: PageProps) {
    const { orderId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { shipments: true },
    });

    if (!order || order.userId !== session.user.id) notFound();

    /* ── Parse data ── */
    const shipment =
        order.shipments?.find((s) => s.isMaster) ||
        order.shipments?.[0] ||
        null;

    const items =
        typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items || [];

    const shippingAddress =
        typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;

    const trackingInfo = safeParseJson(order.trackingInfo) || {};

    const waybill =
        shipment?.waybill ||
        trackingInfo.waybill ||
        trackingInfo.trackingNumber ||
        null;

    const trackingUrl =
        trackingInfo.trackingUrl ||
        (waybill ? `https://delhivery.com/track/package/${waybill}` : null);

    const displayStatus = getOrderDisplayStatus(
        order.status as unknown as LocalOrderStatus,
        shipment?.status as unknown as LocalShipmentStatus | undefined,
    );

    const isPaid =
        displayStatus !== "payment_pending" &&
        displayStatus !== "payment_failed" &&
        displayStatus !== "not_completed";
    const isDelivered = displayStatus === "delivered";
    const isCancelled = displayStatus === "cancelled";
    const isPaymentFailed = displayStatus === "payment_failed";
    const showTracking =
        displayStatus === "order_shipped" ||
        displayStatus === "out_for_delivery";
    const showCancel =
        displayStatus === "order_confirmed" ||
        displayStatus === "order_processing";

    // Payment — direct DB fields from Order model
    const rawPaymentMethod = order.paymentMethod;
    const maskedPaymentId = order.maskedPaymentId;
    const paymentUtr = order.utrNumber;
    const paymentBnr = order.brnNumber;
    const paymentCardNetwork = order.cardNetwork;
    const transactionId = order.transactionId;

    // Normalize payment method for display
    const isUpi = rawPaymentMethod?.toUpperCase() === "UPI";
    const isCard =
        rawPaymentMethod?.toUpperCase() === "CREDIT_CARD" ||
        rawPaymentMethod?.toUpperCase() === "DEBIT_CARD";
    const isNetBanking = rawPaymentMethod?.toUpperCase() === "NET_BANKING";
    const isWallet = rawPaymentMethod?.toUpperCase() === "WALLET";
    const hasPaymentMethod = !!rawPaymentMethod;

    const paymentMethodLabel = isUpi
        ? "UPI"
        : isCard
          ? rawPaymentMethod?.toUpperCase() === "CREDIT_CARD"
              ? "Credit Card"
              : "Debit Card"
          : isNetBanking
            ? "Net Banking"
            : isWallet
              ? "Wallet"
              : rawPaymentMethod || null;

    // Pricing — direct DB fields from Order model
    const subtotal = order.subtotal || 0;
    const discount = order.discountAmount || 0;
    const couponCode = order.discountCode;
    const tax = order.tax || 0;
    const shippingCost = order.shippingPrice || 0;
    const grandTotal = order.totalAmount || 0;

    // Always show order placed date
    const statusDateLabel = `Order placed on ${formatDate(order.createdAt)}`;

    // Support context
    const statusLabelMap: Record<string, string> = {
        payment_pending: "Payment Pending",
        payment_failed: "Failed",
        not_completed: "Not Completed",
        order_confirmed: "Order Placed",
        order_processing: "Order Confirmed",
        order_shipped: "Order Shipped",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
    };
    const statusLabel = statusLabelMap[displayStatus] || displayStatus;
    const userEmail = session.user.email || "N/A";
    const customerName = session.user.name || "N/A";

    /* ── Render ── */
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                {/* ── Header ── */}
                <div className="mb-6">
                    <Link
                        href="/profile?tab=orders"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-[30px] leading-[36px] tracking-[0.4px] font-normal text-[#101828]">
                        Order Details
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Order ID: #{order.id}
                    </p>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                    {/* ════════ LEFT COLUMN ════════ */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* ── Status Banner ── */}
                        <StatusBanner
                            displayStatus={displayStatus}
                            dateLabel={statusDateLabel}
                            isPaid={isPaid}
                            refundStatus={order.refundStatus}
                        />

                        {/* ── Items ── */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:max-h-[500px] lg:flex lg:flex-col">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex-shrink-0">
                                Items in this order
                            </h3>
                            <div className="divide-y divide-gray-200 overflow-y-auto lg:pr-1">
                                {items.map((item: any, idx: number) => {
                                    const lineTotal =
                                        (item.price || 0) *
                                        (item.quantity || 1);
                                    const sizeFormatted = formatSize(item.size);
                                    const variantParts = [
                                        item.color && `Color: ${item.color}`,
                                        item.pack && `Pack: ${item.pack}`,
                                        sizeFormatted &&
                                            `Size: ${sizeFormatted}`,
                                    ].filter(Boolean);
                                    const qtyLabel = `Qty: ${item.quantity || 1}`;
                                    const isSingle = items.length === 1;

                                    return (
                                        <div
                                            key={idx}
                                            className={
                                                isSingle
                                                    ? "py-3 first:pt-0 last:pb-0 lg:py-5"
                                                    : "py-3 first:pt-0 last:pb-0"
                                            }
                                        >
                                            <div
                                                className={
                                                    isSingle
                                                        ? "flex gap-4 lg:gap-6"
                                                        : "flex gap-4"
                                                }
                                            >
                                                {/* Thumbnail */}
                                                <div
                                                    className={
                                                        isSingle
                                                            ? "w-14 h-14 sm:w-16 sm:h-16 lg:w-24 lg:h-24 rounded-[10px] bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center"
                                                            : "w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center"
                                                    }
                                                >
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            width={
                                                                isSingle
                                                                    ? 96
                                                                    : 64
                                                            }
                                                            height={
                                                                isSingle
                                                                    ? 96
                                                                    : 64
                                                            }
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <Package
                                                            className={
                                                                isSingle
                                                                    ? "w-8 h-8 text-gray-300"
                                                                    : "w-5 h-5 text-gray-300"
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4
                                                            className={
                                                                isSingle
                                                                    ? "font-medium text-gray-900 text-sm lg:text-base"
                                                                    : "font-medium text-gray-900 text-sm"
                                                            }
                                                        >
                                                            {item.name}
                                                        </h4>
                                                        <div className="text-right flex-shrink-0">
                                                            <p
                                                                className={
                                                                    isSingle
                                                                        ? "font-semibold text-gray-900 text-sm lg:text-base"
                                                                        : "font-semibold text-gray-900 text-sm"
                                                                }
                                                            >
                                                                ₹
                                                                {formatPrice(
                                                                    item.price ||
                                                                        0,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                per item
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p
                                                        className={
                                                            isSingle
                                                                ? "text-xs text-gray-500 mt-0.5 lg:mt-1.5 lg:text-sm"
                                                                : "text-xs text-gray-500 mt-0.5"
                                                        }
                                                    >
                                                        {variantParts.length > 0
                                                            ? `${variantParts.join(" • ")} • ${qtyLabel}`
                                                            : qtyLabel}
                                                    </p>

                                                    <div
                                                        className={
                                                            isSingle
                                                                ? "flex items-center justify-between mt-2 pt-2 lg:mt-4 lg:pt-3 border-t border-gray-200"
                                                                : "flex items-center justify-between mt-2 pt-2 border-t border-gray-200"
                                                        }
                                                    >
                                                        <span className="text-xs text-gray-500">
                                                            Line Total
                                                        </span>
                                                        <span
                                                            className={
                                                                isSingle
                                                                    ? "text-sm lg:text-base font-semibold text-gray-900"
                                                                    : "text-sm font-semibold text-gray-900"
                                                            }
                                                        >
                                                            ₹
                                                            {formatPrice(
                                                                lineTotal,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Delivery Address ── */}
                        {shippingAddress && (
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">
                                    Delivery Address
                                </h3>
                                <div className="text-sm text-gray-700 space-y-0.5">
                                    {(shippingAddress.fullName ||
                                        shippingAddress.name) && (
                                        <p className="font-medium text-gray-900">
                                            {shippingAddress.fullName ||
                                                shippingAddress.name}
                                        </p>
                                    )}
                                    {shippingAddress.phone && (
                                        <p>
                                            {Array.isArray(
                                                shippingAddress.phone,
                                            )
                                                ? shippingAddress.phone.join(
                                                      ", ",
                                                  )
                                                : shippingAddress.phone}
                                        </p>
                                    )}
                                    {(shippingAddress.address ||
                                        shippingAddress.street) && (
                                        <p>
                                            {shippingAddress.address ||
                                                shippingAddress.street}
                                        </p>
                                    )}
                                    {shippingAddress.street2 && (
                                        <p>{shippingAddress.street2}</p>
                                    )}
                                    {(shippingAddress.city ||
                                        shippingAddress.state) && (
                                        <p>
                                            {[
                                                shippingAddress.city,
                                                shippingAddress.state,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                            {(shippingAddress.pincode ||
                                                shippingAddress.zipCode) &&
                                                ` - ${shippingAddress.pincode || shippingAddress.zipCode}`}
                                        </p>
                                    )}
                                    {shippingAddress.country && (
                                        <p>{shippingAddress.country}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ════════ RIGHT COLUMN ════════ */}
                    <div className="space-y-4">
                        {/* ── Pricing Summary ── */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">
                                Pricing Summary
                            </h3>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="text-gray-900">
                                        ₹{formatPrice(subtotal)}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Coupon Discount
                                            {couponCode && ` (${couponCode})`}
                                        </span>
                                        <span className="text-green-600 font-medium">
                                            -₹{formatPrice(discount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Tax (GST)
                                    </span>
                                    <span className="text-gray-900">
                                        ₹{formatPrice(tax)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Shipping
                                    </span>
                                    <span className="text-gray-900">
                                        {shippingCost > 0
                                            ? `₹${formatPrice(shippingCost)}`
                                            : "Free"}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                                    <span className="font-semibold text-gray-900">
                                        Grand Total
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        ₹{formatPrice(grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Payment Details ── */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Payment Details
                                </h3>
                                <span
                                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                                        isPaid
                                            ? "text-green-700 bg-green-50"
                                            : isPaymentFailed
                                              ? "text-red-700 bg-red-50"
                                              : "text-gray-600 bg-gray-100"
                                    }`}
                                >
                                    {isPaid
                                        ? "Successful"
                                        : isPaymentFailed
                                          ? "Failed"
                                          : "Pending"}
                                </span>
                            </div>

                            {/* ── Paid: show method details (if available) ── */}
                            {isPaid && hasPaymentMethod && (
                                <div className="mb-4">
                                    {/* Payment method row */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                            {isUpi ? (
                                                <Smartphone className="w-5 h-5" />
                                            ) : isCard ? (
                                                <CreditCard className="w-5 h-5" />
                                            ) : isNetBanking ? (
                                                <Landmark className="w-5 h-5" />
                                            ) : (
                                                <Wallet className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {paymentMethodLabel}
                                                {maskedPaymentId && (
                                                    <span className="text-gray-400 font-normal">
                                                        {" "}
                                                        · {maskedPaymentId}
                                                    </span>
                                                )}
                                            </p>
                                            {paymentCardNetwork && isCard && (
                                                <p className="text-xs text-gray-500">
                                                    {paymentCardNetwork}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* UPI → show UTR */}
                                    {isUpi && paymentUtr && (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                                                UPI Reference (UTR)
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900 font-mono">
                                                    {paymentUtr}
                                                </p>
                                                <CopyButton text={paymentUtr} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Card → show BRN */}
                                    {isCard && paymentBnr && (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                                                Bank Reference (BRN)
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-900 font-mono">
                                                    {paymentBnr}
                                                </p>
                                                <CopyButton text={paymentBnr} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Transaction ID — only when no UTR/BRN */}
                                    {!paymentUtr &&
                                        !paymentBnr &&
                                        transactionId && (
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mt-3">
                                                <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                                                    Transaction ID
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900 font-mono break-all">
                                                        {transactionId}
                                                    </p>
                                                    <CopyButton
                                                        text={transactionId}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* ── Pending / Failed: show transaction ID ── */}
                            {!isPaid && transactionId && (
                                <div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                                        <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                                            Transaction ID
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-900 font-mono">
                                                {transactionId}
                                            </p>
                                            <CopyButton text={transactionId} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 flex items-start gap-1.5">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        This transaction ID is generated before
                                        payment confirmation. If the payment
                                        fails, this reference helps us verify
                                        whether any amount was received.
                                    </p>
                                </div>
                            )}

                            {/* Download Invoice — hide for payment_pending, payment_failed, not_completed and cancelled */}
                            {!isCancelled &&
                                displayStatus !== "payment_pending" &&
                                displayStatus !== "payment_failed" &&
                                displayStatus !== "not_completed" && (
                                    <DownloadInvoiceButton orderId={order.id} />
                                )}
                        </div>

                        {/* ── Order Actions ── */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">
                                Order Actions
                            </h3>
                            <div className="space-y-2.5">
                                {/* Payment Pending → Contact Support only */}
                                {displayStatus === "payment_pending" && (
                                    <ContactSupportButton
                                        orderId={order.id}
                                        orderStatus={statusLabel}
                                        userEmail={userEmail}
                                        customerName={customerName}
                                        transactionId={transactionId}
                                    />
                                )}

                                {/* Payment Failed → Contact Support only */}
                                {isPaymentFailed && (
                                    <ContactSupportButton
                                        orderId={order.id}
                                        orderStatus={statusLabel}
                                        userEmail={userEmail}
                                        customerName={customerName}
                                        transactionId={transactionId}
                                    />
                                )}

                                {/* Not Completed (unknown fallback) → Contact Support only */}
                                {displayStatus === "not_completed" && (
                                    <ContactSupportButton
                                        orderId={order.id}
                                        orderStatus={statusLabel}
                                        userEmail={userEmail}
                                        customerName={customerName}
                                        transactionId={transactionId}
                                    />
                                )}

                                {/* Order Placed / Confirmed → Cancel + Contact Support */}
                                {showCancel && (
                                    <>
                                        <CancelOrderButton
                                            orderId={order.id}
                                            hasShipment={!!shipment}
                                        />
                                        <ContactSupportButton
                                            orderId={order.id}
                                            orderStatus={statusLabel}
                                            userEmail={userEmail}
                                            customerName={customerName}
                                            transactionId={transactionId}
                                        />
                                    </>
                                )}

                                {/* Shipped / Out for Delivery → Tracking + Track button + Contact Support + info */}
                                {showTracking && (
                                    <>
                                        {waybill && (
                                            <div className="mb-2">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Tracking ID
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 font-mono">
                                                    {waybill}
                                                </p>
                                            </div>
                                        )}
                                        {trackingUrl && (
                                            <a
                                                href={trackingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                            >
                                                <Truck className="w-4 h-4" />
                                                Track Order
                                            </a>
                                        )}
                                        <ContactSupportButton
                                            orderId={order.id}
                                            orderStatus={statusLabel}
                                            userEmail={userEmail}
                                            customerName={customerName}
                                            transactionId={transactionId}
                                        />
                                        <p className="text-xs text-gray-400 flex items-start gap-1.5 pt-1">
                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                            Orders cannot be cancelled once
                                            shipped. For any issues, please
                                            contact support.
                                        </p>
                                    </>
                                )}

                                {/* Delivered → Give Feedback + Contact Support */}
                                {isDelivered && (
                                    <>
                                        <GiveFeedbackButton
                                            orderId={order.id}
                                            items={items}
                                        />
                                        <ContactSupportButton
                                            orderId={order.id}
                                            orderStatus={statusLabel}
                                            userEmail={userEmail}
                                            customerName={customerName}
                                            transactionId={transactionId}
                                        />
                                    </>
                                )}

                                {/* Cancelled → Contact Support only */}
                                {isCancelled && (
                                    <ContactSupportButton
                                        orderId={order.id}
                                        orderStatus={statusLabel}
                                        userEmail={userEmail}
                                        customerName={customerName}
                                        transactionId={transactionId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}