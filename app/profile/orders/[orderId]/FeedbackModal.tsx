"use client";

import { MessageSquarePlus, Package, Star, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/* ────────────────────── Tag Config ────────────────────── */

const GLOBAL_TAGS = [
    "Fast delivery",
    "Secure packaging",
    "Great value",
    "Responsive support",
] as const;

const ITEM_TYPE_TAGS: Record<string, readonly string[]> = {
    filament: [
        "Smooth extrusion",
        "Strong adhesion",
        "Vibrant color",
        "Stringing issues",
    ],

    resin: ["High detail", "Fast curing", "Low odor", "Brittle prints"],

    printer: [
        "Excellent print quality",
        "Reliable performance",
        "Easy setup",
        "Noisy operation",
    ],

    product: [
        "Excellent detailing",
        "Accurate sizing",
        "Premium finish",
        "Minor imperfections",
    ],

    prebuilt: [
        "Excellent detailing",
        "Accurate sizing",
        "Premium finish",
        "Minor imperfections",
    ],
};

function getTagsForItems(items: OrderItem[]): string[] {
    const itemTypeTagsSet = new Set<string>();
    for (const item of items) {
        const type = item.itemType?.toLowerCase() || "product";
        const tags = ITEM_TYPE_TAGS[type] || ITEM_TYPE_TAGS.product;
        tags.forEach((tag) => itemTypeTagsSet.add(tag));
    }
    return [...GLOBAL_TAGS, ...Array.from(itemTypeTagsSet)];
}

/* ────────────────────── Types ────────────────────── */

export interface OrderItem {
    name: string;
    image?: string;
    price?: number;
    quantity?: number;
    color?: string;
    pack?: string;
    size?: string;
    itemType?: string;
    productId?: string;
}

interface ItemReview {
    rating: number;
    review: string;
}

/* ────────────────────── Star Rating ────────────────────── */

function StarRating({
    rating,
    onChange,
}: {
    rating: number;
    onChange: (r: number) => void;
}) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                >
                    <Star
                        className={`w-6 h-6 transition-colors ${
                            star <= (hovered || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-none text-gray-300"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

/* ────────────────────── Modal ────────────────────── */

interface FeedbackModalProps {
    orderId: string;
    items: OrderItem[];
    onClose: () => void;
}

function FeedbackModal({ orderId, items, onClose }: FeedbackModalProps) {
    const allTags = getTagsForItems(items);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [itemReviews, setItemReviews] = useState<Record<number, ItemReview>>(
        () => {
            const init: Record<number, ItemReview> = {};
            items.forEach((_, idx) => {
                init[idx] = { rating: 0, review: "" };
            });
            return init;
        },
    );
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    const updateItemRating = (idx: number, rating: number) => {
        setItemReviews((prev) => ({
            ...prev,
            [idx]: { ...prev[idx], rating },
        }));
    };

    const updateItemReview = (idx: number, review: string) => {
        setItemReviews((prev) => ({
            ...prev,
            [idx]: { ...prev[idx], review: review.slice(0, 300) },
        }));
    };

    const hasAnyRating = Object.values(itemReviews).some((r) => r.rating > 0);

    const handleSubmit = async () => {
        if (!hasAnyRating) return;
        setSubmitting(true);
        try {
            const itemFeedbacks = Object.entries(itemReviews)
                .filter(([, r]) => r.rating > 0)
                .map(([idx, r]) => ({
                    index: Number(idx),
                    name: items[Number(idx)].name,
                    productId: items[Number(idx)].productId || null,
                    itemType: items[Number(idx)].itemType || null,
                    rating: r.rating,
                    review: r.review.trim() || null,
                }));

            const res = await fetch("/api/order/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    tags: selectedTags,
                    items: itemFeedbacks,
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

    /* ── Success ── */
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
                        <Star className="w-7 h-7 text-green-600 fill-green-600" />
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

    /* ── Main Modal ── */
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
                <div className="flex items-start justify-between p-5 pb-0 sticky top-0 bg-white z-10">
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

                {/* ── Section 1: What went well ── */}
                <div className="p-5 pb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                        What went well? (Select all that apply)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                        isSelected
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

                <div className="border-t border-gray-100 mx-5" />

                {/* ── Section 2: Item-wise review ── */}
                <div className="p-5 pb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                        Rate your items
                    </p>
                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border border-gray-200 p-3"
                            >
                                {/* Item header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <Package className="w-4 h-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {[
                                                item.color,
                                                item.size,
                                                `Qty: ${item.quantity || 1}`,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </div>
                                </div>

                                {/* Star rating */}
                                <div className="mb-2">
                                    <StarRating
                                        rating={itemReviews[idx]?.rating || 0}
                                        onChange={(r) =>
                                            updateItemRating(idx, r)
                                        }
                                    />
                                </div>

                                {/* Review text (show after rating) */}
                                {itemReviews[idx]?.rating > 0 && (
                                    <div>
                                        <textarea
                                            value={
                                                itemReviews[idx]?.review || ""
                                            }
                                            onChange={(e) =>
                                                updateItemReview(
                                                    idx,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Write a short review (optional)..."
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none"
                                        />
                                        <p className="text-[11px] text-gray-400 text-right mt-0.5">
                                            {itemReviews[idx]?.review?.length ||
                                                0}
                                            /300
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 mx-5" />

                {/* ── Section 3: General comment ── */}
                <div className="px-5 pt-4 pb-2">
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
                <div className="p-5 pt-2 flex items-center gap-3 sticky bottom-0 bg-white">
                    <button
                        onClick={handleSubmit}
                        disabled={!hasAnyRating || submitting}
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

/* ── Exported Button ── */

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
