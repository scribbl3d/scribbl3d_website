"use client";

import { ChevronRight, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

/* ────────────────────── Issue Categories ────────────────────── */

const ISSUE_CATEGORIES = [
    {
        id: "payment",
        label: "Payment Issue",
        description: "Payment failed, double charged, refund not received",
        icon: "💳",
    },
    {
        id: "order",
        label: "Order Issue",
        description: "Wrong item, missing item, damaged product",
        icon: "📦",
    },
    {
        id: "shipping",
        label: "Shipping & Delivery",
        description: "Delayed delivery, tracking not updating, lost package",
        icon: "🚚",
    },
    {
        id: "cancel",
        label: "Cancellation & Refund",
        description: "Cancel request, refund status, refund not processed",
        icon: "↩️",
    },
    {
        id: "product",
        label: "Product Query",
        description: "Product info, compatibility, usage help",
        icon: "🔍",
    },
    {
        id: "other",
        label: "Other",
        description: "Anything else we can help with",
        icon: "💬",
    },
] as const;

type CategoryId = (typeof ISSUE_CATEGORIES)[number]["id"];

/* ────────────────────── Props ────────────────────── */

interface ContactSupportButtonProps {
    orderId: string;
    orderStatus: string;
    userEmail: string;
    customerName: string;
    transactionId?: string | null;
}

/* ────────────────────── Modal ────────────────────── */

function ContactSupportModal({
    orderId,
    orderStatus,
    userEmail,
    customerName,
    transactionId,
    onClose,
}: ContactSupportButtonProps & { onClose: () => void }) {
    const SUPPORT_PHONE = "919599523434";

    const [step, setStep] = useState<"category" | "details">("category");
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
        null,
    );
    const [issueDetails, setIssueDetails] = useState("");

    const selectedCategoryData = ISSUE_CATEGORIES.find(
        (c) => c.id === selectedCategory,
    );

    const handleCategorySelect = (id: CategoryId) => {
        setSelectedCategory(id);
        setStep("details");
    };

    const handleSend = () => {
        const categoryLabel = selectedCategoryData?.label || "General";

        let message = `Hi Support Team,\nI need assistance with an order.\n\n`;
        message += `*Order Details*\n`;
        message += `Name: ${customerName}\n`;
        message += `Order ID: ${orderId}\n`;
        message += `Order Status: ${orderStatus}\n`;
        message += `Registered Email: ${userEmail}\n`;
        if (transactionId) {
            message += `Transaction ID: ${transactionId}\n`;
        }
        message += `\n*Issue Category:* ${categoryLabel}\n`;
        if (issueDetails.trim()) {
            message += `\n*Issue Details:*\n${issueDetails.trim()}\n`;
        }

        const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {step === "details" && (
                            <button
                                onClick={() => setStep("category")}
                                className="p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Contact Support
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {step === "category"
                                    ? "What do you need help with?"
                                    : "Tell us more about your issue"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {/* ── Step 1: Category Selection ── */}
                {step === "category" && (
                    <div className="p-5 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            {ISSUE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                                >
                                    <span className="text-xl w-8 text-center flex-shrink-0">
                                        {cat.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {cat.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {cat.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Issue Details ── */}
                {step === "details" && (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="p-5 flex-1 overflow-y-auto">
                            {/* Selected category pill */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-base">
                                    {selectedCategoryData?.icon}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {selectedCategoryData?.label}
                                </span>
                            </div>

                            {/* Order info preview */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                    <span>Order ID</span>
                                    <span className="font-medium text-gray-900 font-mono text-[11px]">
                                        {orderId.length > 20
                                            ? `${orderId.slice(0, 20)}...`
                                            : orderId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <span className="font-medium text-gray-900">
                                        {orderStatus}
                                    </span>
                                </div>
                                {transactionId && (
                                    <div className="flex justify-between">
                                        <span>Transaction ID</span>
                                        <span className="font-medium text-gray-900 font-mono text-[11px]">
                                            {transactionId.length > 16
                                                ? `${transactionId.slice(0, 16)}...`
                                                : transactionId}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Issue description */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2 block">
                                    Describe your issue
                                </label>
                                <textarea
                                    value={issueDetails}
                                    onChange={(e) =>
                                        setIssueDetails(
                                            e.target.value.slice(0, 500),
                                        )
                                    }
                                    placeholder="Please describe what happened and how we can help..."
                                    rows={4}
                                    autoFocus
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none"
                                />
                                <p className="text-[11px] text-gray-400 text-right mt-1">
                                    {issueDetails.length}/500
                                </p>
                            </div>
                        </div>

                        {/* Send button */}
                        <div className="p-5 pt-3 border-t border-gray-100 flex-shrink-0">
                            <button
                                onClick={handleSend}
                                className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send via WhatsApp
                            </button>
                            <p className="text-[11px] text-gray-400 text-center mt-2">
                                Opens WhatsApp with your message pre-filled
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Exported Button ── */

export function ContactSupportButton({
    orderId,
    orderStatus,
    userEmail,
    customerName,
    transactionId,
}: ContactSupportButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <MessageCircle className="w-4 h-4" />
                Contact Support
            </button>

            {showModal && (
                <ContactSupportModal
                    orderId={orderId}
                    orderStatus={orderStatus}
                    userEmail={userEmail}
                    customerName={customerName}
                    transactionId={transactionId}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
