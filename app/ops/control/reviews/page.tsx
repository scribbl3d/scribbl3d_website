"use client";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    EyeOff,
    Layers,
    MessageSquareText,
    Package,
    Star,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { TablePagination } from "../orders/components/TablePagination";
import { formatDate } from "../orders/utils/formatters";

/* =========================================================
   TYPES (mirror lib/reviews/moderation.ts)
   ========================================================= */
type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN";

interface ModerationItem {
    id: string;
    kind: "order" | "product";
    orderId: string;
    orderNumber: string;
    productName: string | null;
    itemType: string | null;
    variantLabel: string | null;
    rating: number;
    content: string | null;
    tags: string[];
    reviewerName: string;
    status: ReviewStatus;
    isIncentivised: boolean;
    createdAt: string;
    moderatedAt: string | null;
}

interface StatusCounts {
    pending: number;
    approved: number;
    hidden: number;
    all: number;
    lowRatingPending: number;
}

const STATUS_TABS: {
    value: ReviewStatus | "ALL";
    label: string;
    count: keyof StatusCounts;
    icon: typeof Clock;
    badge: string;
}[] = [
    { value: "ALL", label: "All", count: "all", icon: Layers, badge: "bg-indigo-100 text-indigo-700" },
    { value: "PENDING", label: "Pending", count: "pending", icon: Clock, badge: "bg-amber-100 text-amber-800" },
    {
        value: "APPROVED",
        label: "Approved",
        count: "approved",
        icon: CheckCircle2,
        badge: "bg-emerald-100 text-emerald-700",
    },
    { value: "HIDDEN", label: "Hidden", count: "hidden", icon: EyeOff, badge: "bg-slate-200 text-slate-700" },
];

const STATUS_PILL: Record<ReviewStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-amber-50 text-amber-800 ring-amber-200" },
    APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    HIDDEN: { label: "Hidden", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

const SELECT =
    "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

/* =========================================================
   PAGE
   ========================================================= */
export default function AdminReviewsPage() {
    const [status, setStatus] = useState<ReviewStatus | "ALL">("ALL");
    const [kind, setKind] = useState<"all" | "order" | "product">("all");
    const [rating, setRating] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<{
        reviews: ModerationItem[];
        total: number;
        pageSize: number;
        counts?: StatusCounts;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status, kind, rating, page: String(page) });
            const res = await fetch(`/api/admin/reviews?${params}`);
            if (!res.ok) throw new Error();
            setData(await res.json());
        } catch {
            toast({ variant: "destructive", title: "Could not load reviews" });
        } finally {
            setLoading(false);
        }
    }, [status, kind, rating, page]);

    useEffect(() => {
        load();
    }, [load]);

    // Changing a filter starts again from page 1
    const withPageReset =
        <T,>(set: (value: T) => void) =>
        (value: T) => {
            set(value);
            setPage(1);
        };
    const changeStatus = withPageReset(setStatus);
    const changeKind = withPageReset(setKind);
    const changeRating = withPageReset(setRating);

    async function moderate(review: ModerationItem, action: "approve" | "hide") {
        setBusyId(review.id);
        try {
            const res = await fetch("/api/admin/reviews/moderate", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kind: review.kind, id: review.id, action }),
            });
            if (!res.ok) throw new Error();
            toast({ title: action === "approve" ? "Review approved" : "Review hidden" });
            await load();
        } catch {
            toast({ variant: "destructive", title: "Could not update the review" });
        } finally {
            setBusyId(null);
        }
    }

    const counts = data?.counts;

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12 pt-20">
            {/* ── Header ── */}
            <div>
                <Link
                    href="/ops/control"
                    className="inline-flex items-center gap-2 rounded text-sm text-slate-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to dashboard
                </Link>
                <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">Reviews</h1>
                <p className="mt-1 text-sm text-slate-600">
                    New reviews stay pending until approved. Hidden reviews are never shown on the site. Customer text
                    cannot be edited or deleted.
                </p>
            </div>

            {/* ── Low ratings waiting (only when there are any) ── */}
            {counts && counts.lowRatingPending > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        setStatus("PENDING");
                        setRating("low");
                        setPage(1);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    {counts.lowRatingPending} low rating{counts.lowRatingPending === 1 ? "" : "s"} to review
                </button>
            )}

            {/* ── Status tabs + filters ── */}
            <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 px-2 pt-2 md:flex-row md:items-end md:justify-between md:px-4">
                    <div role="tablist" aria-label="Review status" className="-mb-px flex overflow-x-auto">
                        {STATUS_TABS.map((tab) => {
                            const active = status === tab.value;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.value}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    onClick={() => changeStatus(tab.value)}
                                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                                        active
                                            ? "border-slate-900 text-slate-900"
                                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {tab.label}
                                    {counts && (
                                        <span
                                            className={`min-w-[1.5rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
                                                active ? tab.badge : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {counts[tab.count]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 pb-2 md:pb-3">
                        <label className="sr-only" htmlFor="review-kind">
                            Review type
                        </label>
                        <select
                            id="review-kind"
                            className={SELECT}
                            value={kind}
                            onChange={(e) => changeKind(e.target.value as typeof kind)}
                        >
                            <option value="all">All types</option>
                            <option value="order">Overall experience</option>
                            <option value="product">Products</option>
                        </select>
                        <label className="sr-only" htmlFor="review-rating">
                            Rating
                        </label>
                        <select
                            id="review-rating"
                            className={SELECT}
                            value={rating}
                            onChange={(e) => changeRating(e.target.value)}
                        >
                            <option value="all">All ratings</option>
                            <option value="low">1–2★ (low)</option>
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                    {n}★
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="border-t border-slate-200" />
            </div>

            {/* ── List ── */}
            {loading && !data ? (
                <p className="text-sm text-slate-500">Loading reviews…</p>
            ) : data && data.reviews.length > 0 ? (
                <ul className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                    {data.reviews.map((review) => (
                        <ReviewCard
                            key={`${review.kind}-${review.id}`}
                            review={review}
                            busy={busyId === review.id}
                            onApprove={() => moderate(review, "approve")}
                            onHide={() => moderate(review, "hide")}
                        />
                    ))}
                </ul>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center">
                    <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-slate-700">No reviews match these filters.</p>
                    <p className="mt-1 text-xs text-slate-500">Try another status, type or rating.</p>
                </div>
            )}

            {data && data.total > data.pageSize && (
                <TablePagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
            )}
        </div>
    );
}

/* =========================================================
   CARD
   ========================================================= */
function ReviewCard({
    review,
    busy,
    onApprove,
    onHide,
}: {
    review: ModerationItem;
    busy: boolean;
    onApprove: () => void;
    onHide: () => void;
}) {
    const low = review.rating <= 2;
    const pill = STATUS_PILL[review.status];
    const initial = review.reviewerName.trim().charAt(0).toUpperCase() || "?";

    return (
        <li
            className={`overflow-hidden rounded-xl border bg-white ${low ? "border-red-200 border-l-4 border-l-red-400" : "border-slate-200"}`}
        >
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                {/* Reviewer */}
                <div
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700"
                >
                    {initial}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{review.reviewerName}</p>
                            <p className="text-xs text-slate-500">
                                Order #{review.orderNumber} · {formatDate(review.createdAt)}
                                {review.moderatedAt && ` · Moderated ${formatDate(review.moderatedAt)}`}
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            {review.status !== "APPROVED" && (
                                <Button
                                    size="sm"
                                    disabled={busy}
                                    onClick={onApprove}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    {review.status === "HIDDEN" ? "Show again" : "Approve"}
                                </Button>
                            )}
                            {review.status !== "HIDDEN" && (
                                <Button size="sm" variant="outline" disabled={busy} onClick={onHide}>
                                    Hide
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Rating + labels */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex" role="img" aria-label={`${review.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                    key={n}
                                    aria-hidden="true"
                                    className={`h-4 w-4 ${n <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
                                />
                            ))}
                        </span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill.className}`}
                        >
                            {pill.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                            {review.kind === "order" ? (
                                <MessageSquareText className="h-3 w-3" aria-hidden="true" />
                            ) : (
                                <Package className="h-3 w-3" aria-hidden="true" />
                            )}
                            {review.kind === "order" ? "Overall experience" : "Product"}
                        </span>
                        {low && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                Low rating
                            </span>
                        )}
                    </div>

                    {/* Subject */}
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                        {review.kind === "order" ? "Order experience" : review.productName}
                        {review.variantLabel && (
                            <span className="font-normal text-slate-500"> · {review.variantLabel}</span>
                        )}
                    </p>

                    {review.tags.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tags">
                            {review.tags.map((tag) => (
                                <li
                                    key={tag}
                                    className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}

                    {review.content ? (
                        <blockquote className="mt-3 whitespace-pre-line border-l-2 border-slate-200 pl-3 text-sm leading-relaxed text-slate-700">
                            {review.content}
                        </blockquote>
                    ) : (
                        <p className="mt-3 text-sm italic text-slate-400">No written review.</p>
                    )}
                </div>
            </div>
        </li>
    );
}
