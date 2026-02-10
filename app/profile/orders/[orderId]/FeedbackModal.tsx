"use client";

import { Check, MessageSquarePlus, Package, Star, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const FEEDBACK_TAGS = [
    "Product quality",
    "Packaging quality",
    "Delivery experience",
    "Pricing & value for money",
    "Payment experience",
    "Support / communication",
] as const;

type FeedbackTag = (typeof FEEDBACK_TAGS)[number];

export interface OrderItem {
    name: string;
    image?: string;
    price?: number;
    quantity?: number;
    color?: string;
    pack?: string;
    itemType?: string;
    productId?: string;
}

interface FeedbackModalProps {
    orderId: string;
    items: OrderItem[];
    onClose: () => void;
}

function FeedbackModal({ orderId, items, onClose }: FeedbackModalProps) {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(
        () => new Set(items.map((_, i) => i)),
    );
    const [selectedTags, setSelectedTags] = useState<FeedbackTag[]>([]);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const allSelected = selectedItems.size === items.length;

    const toggleItem = (idx: number) => {
        setSelectedItems((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map((_, i) => i)));
        }
    };

    const toggleTag = (tag: FeedbackTag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0 || selectedTags.length === 0) return;
        setSubmitting(true);
        try {
            const feedbackItems = Array.from(selectedItems).map((idx) => ({
                index: idx,
                name: items[idx].name,
                productId: items[idx].productId || null,
                itemType: items[idx].itemType || null,
            }));

            const res = await fetch("/api/order/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    items: feedbackItems,
                    tags: selectedTags,
                    comment: comment.trim() || null,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => onClose(), 1500);
            }
        } catch (err) {
            console.error("Failed to submit feedback:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Thank you!
                    </h3>
                    <p className="text-sm text-gray-500">
                        Your feedback helps us improve.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Share your experience
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Your feedback helps us improve future orders.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="border-t border-gray-100 mt-4" />

                {/* Item selection */}
                <div className="p-5 pb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                        Select items to review
                    </p>

                    {items.length > 1 && (
                        <button
                            onClick={toggleAll}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border mb-2 transition-colors ${
                                allSelected
                                    ? "border-gray-900 bg-gray-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                    allSelected
                                        ? "bg-gray-900"
                                        : "border border-gray-300"
                                }`}
                            >
                                {allSelected && (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                All items ({items.length})
                            </span>
                        </button>
                    )}

                    <div className="space-y-1.5">
                        {items.map((item, idx) => {
                            const isSelected = selectedItems.has(idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => toggleItem(idx)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                                        isSelected
                                            ? "border-gray-900 bg-gray-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                            isSelected
                                                ? "bg-gray-900"
                                                : "border border-gray-300"
                                        }`}
                                    >
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        )}
                                    </div>
                                    <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={32}
                                                height={32}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <Package className="w-3.5 h-3.5 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.name}
                                        </p>
                                        {(item.color || item.quantity) && (
                                            <p className="text-xs text-gray-500">
                                                {[
                                                    item.color &&
                                                        `${item.color}`,
                                                    `Qty: ${item.quantity || 1}`,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-gray-100 mx-5" />

                {/* Tags */}
                <div className="p-5 pb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                        What went well? (Select all that apply)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {FEEDBACK_TAGS.map((tag) => {
                            const isTagSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                        isTagSelected
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Comment */}
                <div className="px-5 pb-2">
                    <div className="flex items-baseline justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Anything else you&apos;d like to share?
                        </p>
                        <span className="text-xs text-gray-400">Optional</span>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value.slice(0, 500))
                        }
                        placeholder="Tell us more about your experience..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                        {comment.length}/500 chars
                    </p>
                </div>

                {/* Actions */}
                <div className="p-5 pt-2 flex items-center gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={
                            selectedItems.size === 0 ||
                            selectedTags.length === 0 ||
                            submitting
                        }
                        className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2.5"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Exported Button Wrapper ── */

export function GiveFeedbackButton({
    orderId,
    items,
}: {
    orderId: string;
    items: OrderItem[];
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
                <MessageSquarePlus className="w-4 h-4" />
                Give Feedback
            </button>

            {showModal && (
                <FeedbackModal
                    orderId={orderId}
                    items={items}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
