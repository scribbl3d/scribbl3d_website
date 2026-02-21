"use client";

import {
    CheckCircle,
    Clock,
    Info,
    Package,
    ShieldCheck,
    Truck,
} from "lucide-react";
import { useState } from "react";

type DisplayStatus =
    | "payment_pending"
    | "order_confirmed"
    | "order_processing"
    | "order_shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

const STATUS_CONFIG: Record<
    DisplayStatus,
    {
        label: string;
        Icon: typeof Clock;
        className: string;
        infoMessage?: string;
        infoClassName?: string;
    }
> = {
    payment_pending: {
        label: "Payment Pending",
        Icon: Info,
        className: "border-yellow-300 text-yellow-700 bg-yellow-50",
        infoMessage:
            "Your payment is being verified by the gateway. If any amount was deducted, it will be confirmed or refunded automatically within the gateway's processing time.",
        infoClassName: "border-yellow-200 bg-yellow-50/50 text-yellow-800",
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
        Icon: Info,
        className: "border-red-300 text-red-700 bg-red-50",
        infoMessage:
            "Refunds for user-cancelled orders are initiated immediately and typically reflect in the original payment method within 5–7 business days, subject to bank processing.",
        infoClassName: "border-red-200 bg-red-50/50 text-red-800",
    },
};

interface StatusBannerProps {
    displayStatus: DisplayStatus;
    dateLabel: string;
    isPaid: boolean;
    refundStatus?: string | null;
}

const REFUND_BADGE: Record<string, { label: string; className: string }> = {
    initiated: {
        label: "Refund Initiated",
        className: "border-orange-300 text-orange-700 bg-orange-50",
    },
    success: {
        label: "Refund Completed",
        className: "border-green-300 text-green-700 bg-green-50",
    },
    failed: {
        label: "Refund Failed",
        className: "border-red-300 text-red-700 bg-red-50",
    },
};

export function StatusBanner({
    displayStatus,
    dateLabel,
    isPaid,
    refundStatus,
}: StatusBannerProps) {
    const [showInfo, setShowInfo] = useState(false);
    const config = STATUS_CONFIG[displayStatus];
    const hasInfo = !!config.infoMessage;

    // For cancelled orders, show refund status badge instead of Paid/Unpaid
    const isCancelled = displayStatus === "cancelled";
    const refundBadge =
        isCancelled && refundStatus
            ? REFUND_BADGE[refundStatus] || {
                  label: refundStatus,
                  className: "border-gray-300 text-gray-700 bg-gray-50",
              }
            : null;

    const isPending = displayStatus === "payment_pending";
    const badgeLabel = isCancelled
        ? refundBadge?.label || "Cancelled"
        : isPending
          ? "In Progress"
          : isPaid
            ? "Paid"
            : "Unpaid";

    const badgeClassName = isCancelled
        ? refundBadge?.className || config.className
        : config.className;

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={
                                hasInfo
                                    ? () => setShowInfo((p) => !p)
                                    : undefined
                            }
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.className} ${hasInfo ? "cursor-pointer" : "cursor-default"}`}
                        >
                            <config.Icon className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                {config.label}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {dateLabel}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${badgeClassName}`}
                    >
                        {badgeLabel}
                    </span>
                </div>
            </div>

            {showInfo && config.infoMessage && (
                <div
                    className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${config.infoClassName}`}
                >
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                    <p className="flex-1 leading-relaxed">
                        {config.infoMessage}
                    </p>
                </div>
            )}
        </>
    );
}
