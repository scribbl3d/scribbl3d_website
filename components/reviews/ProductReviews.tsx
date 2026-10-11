"use client";

import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
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

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
    return (
        <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    aria-hidden="true"
                    className={`${size} ${
                        n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                    }`}
                />
            ))}
        </span>
    );
}

/** Coloured "4 ★" rating chip */
function RatingChip({ value, large = false }: { value: number; large?: boolean }) {
    const label = Number.isInteger(value) ? String(value) : value.toFixed(1);
    return (
        <span
            role="img"
            aria-label={`${label} out of 5 stars`}
            className={`inline-flex items-center gap-1 rounded-md font-bold text-white ${chipTone(value)} ${
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

/** Compact "★ 4.6 (12 reviews)" line under the product title; only from 5 reviews (P4) */
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
        <li className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2.5">
                <RatingChip value={review.rating} />
                <p className="text-sm font-semibold text-slate-900">{RATING_WORDS[review.rating]}</p>
            </div>

            {review.content && (
                <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{review.content}</p>
            )}

            {(review.tags.length > 0 || review.variantLabel) && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {review.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {tag}
                        </span>
                    ))}
                    {review.variantLabel && (
                        <span className="text-xs text-slate-500">
                            {review.tags.length > 0 && <span className="mx-1 text-slate-300">|</span>}
                            Bought: {review.variantLabel}
                        </span>
                    )}
                </div>
            )}

            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{review.reviewerName}</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-white" aria-hidden="true" />
                    Verified purchase
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
            </p>
        </li>
    );
}

/** PDP review section: list from 2 approved reviews, average + breakdown from 5 (P4–P7) */
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
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
                    <h2 id="reviews-heading" className="text-lg sm:text-xl font-bold text-slate-900">
                        Customer reviews
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        {summary.showAverage && summary.average !== null && <RatingChip value={summary.average} />}
                        <span>
                            {summary.count} verified buyer{summary.count === 1 ? "" : "s"}
                        </span>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    </div>
                </div>

                {/* Summary bar (from 5 reviews) */}
                {summary.showAverage && summary.average !== null && summary.breakdown && (
                    <div className="grid gap-6 border-b border-slate-100 bg-slate-50/60 px-5 py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:px-7">
                        <div className="flex flex-col items-start gap-2 sm:items-center sm:border-r sm:border-slate-200 sm:pr-6 sm:text-center">
                            <RatingChip value={summary.average} large />
                            <Stars rating={summary.average} size="h-4 w-4" />
                            <p className="text-sm text-slate-500">
                                {summary.count} ratings · Based on {summary.count} reviews
                            </p>
                        </div>
                        <dl className="space-y-2 self-center">
                            {([5, 4, 3, 2, 1] as const).map((n) => {
                                const count = summary.breakdown![n];
                                const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
                                return (
                                    <div key={n} className="flex items-center gap-3 text-sm">
                                        <dt className="flex w-8 shrink-0 items-center gap-0.5 font-medium text-slate-600">
                                            {n}
                                            <Star className="h-3 w-3 fill-slate-400 text-slate-400" aria-hidden="true" />
                                        </dt>
                                        <dd className="flex flex-1 items-center gap-3">
                                            <span
                                                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                                                role="img"
                                                aria-label={`${count} ${n}-star review${count === 1 ? "" : "s"}`}
                                            >
                                                <span className={`block h-full rounded-full ${chipTone(n)}`} style={{ width: `${pct}%` }} />
                                            </span>
                                            <span className="w-6 text-right text-xs text-slate-500">{count}</span>
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                )}

                {/* Reviews */}
                <div className="px-5 py-6 sm:px-7">
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
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loading}
                            className="mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-[#4338ca] transition-colors hover:bg-indigo-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
                        >
                            {loading ? "Loading…" : "Load more reviews"}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
