"use client";

import { CheckCircle2, ChevronDown, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import type { ProductFamily, ProductReviewSummary, PublicReview } from "@/lib/reviews/productReviews";

const PAGE_SIZE = 5;
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

/** Flipkart-style chip colour: green 4–5★, amber 3★, red 1–2★ */
function chipTone(rating: number) {
    if (rating >= 4) return "bg-emerald-600";
    if (rating >= 3) return "bg-amber-500";
    return "bg-red-500";
}

/** Per-review chip colour: green 5★, indigo 4★, amber 3★, red 1–2★ */
function reviewChipTone(rating: number) {
    if (rating >= 5) return "bg-emerald-600";
    if (rating >= 4) return "bg-[#4f46e5]";
    return chipTone(rating);
}

/** Indigo stars with a partially filled star for fractional averages */
function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
    return (
        <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => {
                const fill = Math.max(0, Math.min(1, rating - (n - 1)));
                return (
                    <span key={n} className={`relative inline-block ${size}`} aria-hidden="true">
                        <Star className={`absolute inset-0 ${size} fill-slate-200 text-slate-200`} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                            <Star className={`${size} fill-[#4f46e5] text-[#4f46e5]`} />
                        </span>
                    </span>
                );
            })}
        </span>
    );
}

/** Coloured "4 ★" rating chip */
function RatingChip({ value, large = false, tone = chipTone }: { value: number; large?: boolean; tone?: (n: number) => string }) {
    const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
    return (
        <span
            role="img"
            aria-label={`${label} out of 5 stars`}
            className={`inline-flex items-center gap-1 rounded-md font-bold text-white ${tone(value)} ${
                large ? "px-3 py-1.5 text-2xl" : "px-2 py-0.5 text-xs"
            }`}
        >
            {label}
            <Star className={`fill-white text-white ${large ? "h-5 w-5" : "h-3 w-3"}`} aria-hidden="true" />
        </span>
    );
}

const formatReviewDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Compact "★ 4.6 (12 reviews)" line under the product title; only from 3 reviews (P4) */
export function RatingSummaryInline({ summary }: { summary: ProductReviewSummary }) {
    if (!summary.showAverage || summary.average === null) return null;
    return (
        <a
            href="#reviews"
            className="inline-flex items-center gap-2 rounded-md text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
        >
            <RatingChip value={summary.average} />
            <span className="underline-offset-2 hover:underline">
                {summary.count} rating{summary.count === 1 ? "" : "s"}
            </span>
        </a>
    );
}

function ReviewRow({ review }: { review: PublicReview }) {
    return (
        <li className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2.5">
                <RatingChip value={review.rating} tone={reviewChipTone} />
                <p className="text-base font-semibold text-slate-900">{RATING_WORDS[review.rating]}</p>
            </div>

            {review.content && (
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{review.content}</p>
            )}

            {(review.tags.length > 0 || review.variantLabel) && (
                <div className="mt-2 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                    {review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {review.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {review.variantLabel && (
                        <span className="text-xs text-slate-500">
                            {review.tags.length > 0 && (
                                <span className="mr-1.5 hidden text-slate-300 sm:inline" aria-hidden="true">|</span>
                            )}
                            Bought: {review.variantLabel}
                        </span>
                    )}
                </div>
            )}

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{review.reviewerName}</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-white" aria-hidden="true" />
                    Verified purchase
                </span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <time dateTime={review.createdAt} className="basis-full sm:basis-auto">
                    {formatReviewDate(review.createdAt)}
                </time>
            </p>
        </li>
    );
}

/** PDP review section: list from 2 approved reviews, average + breakdown from 3 (P4–P7) */
export function ProductReviews({
    family,
    productId,
    summary,
    initialReviews,
}: {
    family: ProductFamily;
    productId: string;
    summary: ProductReviewSummary;
    initialReviews: PublicReview[];
}) {
    const [reviews, setReviews] = useState(initialReviews);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    if (!summary.showList) return null;

    const hasMore = reviews.length < summary.count && reviews.length >= page * PAGE_SIZE;

    async function loadMore() {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams({ type: family, id: productId, page: String(page + 1) });
            const res = await fetch(`/api/product-reviews?${params}`);
            if (!res.ok) throw new Error();
            const data: { reviews: PublicReview[] } = await res.json();
            setReviews((prev) => {
                const seen = new Set(prev.map((r) => r.id));
                return [...prev, ...data.reviews.filter((r) => !seen.has(r.id))];
            });
            setPage((p) => p + 1);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section
            id="reviews"
            aria-labelledby="reviews-heading"
            className="mt-10 scroll-mt-[calc(var(--site-header-height,80px)+16px)]"
        >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="reviews-heading" className="text-lg sm:text-xl font-bold text-slate-900">
                        Customer reviews
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                        {summary.count} verified buyer{summary.count === 1 ? "" : "s"}
                        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    </p>
                </div>

                {/* Summary panel (from 3 reviews) */}
                {summary.showAverage && summary.average !== null && summary.breakdown && (
                    <div className="mt-4 flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:w-fit sm:max-w-full sm:flex-row sm:items-center sm:gap-8 sm:px-6">
                        <div className="flex items-center gap-3 sm:border-r sm:border-slate-200 sm:pr-10">
                            <p className="text-4xl sm:text-5xl font-bold leading-none text-slate-900">
                                {summary.average.toFixed(1)}
                            </p>
                            <div className="flex flex-col gap-1">
                                <Stars rating={summary.average} size="h-5 w-5 sm:h-6 sm:w-6" />
                                <p className="text-xs sm:text-sm font-medium text-slate-700">Based on {summary.count} reviews</p>
                            </div>
                        </div>
                        <dl className="w-full space-y-1.5 sm:w-80">
                            {([5, 4, 3, 2, 1] as const).map((n) => {
                                const count = summary.breakdown![n];
                                const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
                                return (
                                    <div key={n} className="flex items-center gap-3 text-xs sm:text-sm">
                                        <dt className="flex w-8 shrink-0 items-center gap-1 font-medium text-slate-700">
                                            {n}
                                            <Star className="h-3 w-3 fill-slate-800 text-slate-800" aria-hidden="true" />
                                        </dt>
                                        <dd className="flex flex-1 items-center gap-3">
                                            <span
                                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
                                                role="img"
                                                aria-label={`${count} ${n}-star review${count === 1 ? "" : "s"}`}
                                            >
                                                <span className="block h-full rounded-full bg-[#4f46e5]" style={{ width: `${pct}%` }} />
                                            </span>
                                            <span className="w-16 shrink-0 text-slate-600">
                                                {count} ({pct}%)
                                            </span>
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                )}

                {/* Reviews */}
                <div className="mt-5">
                    <ul className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <ReviewRow key={review.id} review={review} />
                        ))}
                    </ul>

                    {error && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            Could not load more reviews. Please try again.
                        </p>
                    )}
                    {hasMore && (
                        <div className="mt-5 flex justify-center">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#4f46e5]/40 py-2.5 text-sm font-semibold text-[#4338ca] transition-colors hover:bg-indigo-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:w-80"
                            >
                                {loading ? "Loading…" : "Load more reviews"}
                                {!loading && <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
