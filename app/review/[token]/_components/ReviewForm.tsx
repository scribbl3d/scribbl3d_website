"use client";

import { Check, CheckCircle2, ChevronDown, Frown, Meh, Package, Smile } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { REVIEW_CONTENT_MAX } from "@/lib/reviews/constants";
import { getOrderTags, getProductTags, ratingBand, TAG_PROMPTS } from "@/lib/reviews/tags";
import { ReviewThankYou } from "./ReviewThankYou";

export type ReviewFormItem = {
    index: number;
    itemType: string;
    name: string;
    image: string | null;
    variantLabel: string | null;
    quantity: number;
    reviewed: boolean;
};

type Draft = { rating: number; content: string; tags: string[] };

const EMPTY_DRAFT: Draft = { rating: 0, content: "", tags: [] };

const CONSENT_TEXT =
    "I agree that my review may be displayed on SCRIBBL3D and used for product improvement and marketing.";

const RATING_FEEDBACK: Record<number, { text: string; icon: typeof Smile; tone: string }> = {
    1: { text: "We're sorry to hear that", icon: Frown, tone: "text-rose-600" },
    2: { text: "Thanks for letting us know", icon: Frown, tone: "text-amber-600" },
    3: { text: "Thanks for your feedback", icon: Meh, tone: "text-amber-600" },
    4: { text: "Great to hear!", icon: Smile, tone: "text-emerald-600" },
    5: { text: "Awesome, glad you loved it!", icon: Smile, tone: "text-emerald-600" },
};

const CARD =
    "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)]";

const isIncomplete = (d: Draft) => d.rating === 0 && d.content.trim() !== "";

/** Keep only tags that still fit after the rating changes */
const withRating = (d: Draft, rating: number, allowed: string[]): Draft => ({
    ...d,
    rating,
    tags: d.tags.filter((tag) => allowed.includes(tag)),
});

/* ────────────────────── Shared pieces ────────────────────── */

function RatingFeedback({ rating }: { rating: number }) {
    const feedback = RATING_FEEDBACK[rating];
    if (!feedback) return null;
    return (
        <p aria-live="polite" className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${feedback.tone}`}>
            <feedback.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {feedback.text}
        </p>
    );
}

function TagChips({
    tags,
    selected,
    onToggle,
    label,
}: {
    tags: string[];
    selected: string[];
    onToggle: (tag: string) => void;
    label: string;
}) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                const isSelected = selected.includes(tag);
                return (
                    <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onToggle(tag)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-1 ${
                            isSelected
                                ? "border-[#4f46e5] bg-indigo-50 text-[#4338ca] shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        {tag}
                    </button>
                );
            })}
        </div>
    );
}

/** Tag prompt and chips for the chosen rating (positives, could-be-better, or problems) */
function RatingTags({
    rating,
    tags,
    selected,
    onToggle,
    subject,
}: {
    rating: number;
    tags: string[];
    selected: string[];
    onToggle: (tag: string) => void;
    subject: string;
}) {
    const band = ratingBand(rating);
    if (!band) return null; // shown only once a star rating is chosen
    return (
        <div>
            <p className="mb-2.5 text-[15px] sm:text-base font-semibold text-slate-900">{TAG_PROMPTS[band]}</p>
            <TagChips label={`${TAG_PROMPTS[band]} (${subject})`} tags={tags} selected={selected} onToggle={onToggle} />
        </div>
    );
}

function ReviewText({
    id,
    label,
    value,
    placeholder,
    rows = 4,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    rows?: number;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-2.5 block text-[15px] sm:text-base font-semibold text-slate-900">
                {label}
            </label>
            <textarea
                id={id}
                value={value}
                maxLength={REVIEW_CONTENT_MAX}
                onChange={(e) => onChange(e.target.value.slice(0, REVIEW_CONTENT_MAX))}
                placeholder={placeholder}
                rows={rows}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#4f46e5]/50 focus:outline-none focus:ring-4 focus:ring-[#4f46e5]/10"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
                {value.length}/{REVIEW_CONTENT_MAX}
            </p>
        </div>
    );
}

function VerifiedBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 fill-emerald-500 text-white" aria-hidden="true" />
            Verified Purchase
        </span>
    );
}

function NeedsRating() {
    return <p className="text-sm font-medium text-amber-700">Add a star rating to include this review.</p>;
}

const ILLUSTRATION_STARS = [
    "M75.0 47.5L77.5 54.1L84.5 54.4L79.0 58.8L80.9 65.6L75.0 61.7L69.1 65.6L71.0 58.8L65.5 54.4L72.5 54.1Z",
    "M101.0 47.5L103.5 54.1L110.5 54.4L105.0 58.8L106.9 65.6L101.0 61.7L95.1 65.6L97.0 58.8L91.5 54.4L98.5 54.1Z",
    "M127.0 47.5L129.5 54.1L136.5 54.4L131.0 58.8L132.9 65.6L127.0 61.7L121.1 65.6L123.0 58.8L117.5 54.4L124.5 54.1Z",
    "M153.0 47.5L155.5 54.1L162.5 54.4L157.0 58.8L158.9 65.6L153.0 61.7L147.1 65.6L149.0 58.8L143.5 54.4L150.5 54.1Z",
    "M179.0 47.5L181.5 54.1L188.5 54.4L183.0 58.8L184.9 65.6L179.0 61.7L173.1 65.6L175.0 58.8L169.5 54.4L176.5 54.1Z",
];

/** Decorative speech bubble with stars and sparkles (header illustration) */
function HeaderIllustration() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 240 120"
            className="hidden h-[120px] w-[240px] shrink-0 sm:block"
            fill="none"
        >
            <defs>
                <filter id="review-bubble-shadow" x="-20%" y="-30%" width="140%" height="170%">
                    <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#4f46e5" floodOpacity="0.16" />
                </filter>
            </defs>
            {/* soft backdrop */}
            <circle cx="186" cy="58" r="50" fill="#e0e7ff" opacity="0.65" />
            <circle cx="222" cy="104" r="5" fill="#c7d2fe" />
            {/* sparkle lines radiating from the bubble corner */}
            <g stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round">
                <path d="M38 21L31 9" />
                <path d="M33 33L19 29" />
                <path d="M35 45L22 51" />
            </g>
            {/* accent sparkle */}
            <path d="M224 8Q225.6 15.4 232 17Q225.6 18.6 224 26Q222.4 18.6 216 17Q222.4 15.4 224 8Z" fill="#818cf8" />
            {/* speech bubble with tail */}
            <path
                d="M66 30H188A20 20 0 0 1 208 50V64A20 20 0 0 1 188 84H92L76 99L79 84H66A20 20 0 0 1 46 64V50A20 20 0 0 1 66 30Z"
                fill="#ffffff"
                stroke="#e0e7ff"
                strokeWidth="1.5"
                filter="url(#review-bubble-shadow)"
            />
            <g fill="#fbbf24">
                {ILLUSTRATION_STARS.map((d) => (
                    <path key={d} d={d} strokeLinejoin="round" stroke="#fbbf24" strokeWidth="1.5" />
                ))}
            </g>
        </svg>
    );
}

function ProductImage({ src, large }: { src: string | null; large: boolean }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition-all ${
                large ? "h-24 w-24 sm:h-36 sm:w-36" : "h-20 w-20 sm:h-24 sm:w-28"
            }`}
        >
            {src ? (
                <Image src={src} alt="" width={144} height={144} className="h-full w-full object-contain p-1.5" />
            ) : (
                <Package className="h-7 w-7 text-slate-300" aria-hidden="true" />
            )}
        </div>
    );
}

/* ────────────────────── Form ────────────────────── */

export function ReviewForm({
    token,
    orderNumber,
    orderReviewed,
    initialRating = 0,
    items,
}: {
    token: string;
    orderNumber: string;
    orderReviewed: boolean;
    initialRating?: number;
    items: ReviewFormItem[];
}) {
    const [order, setOrder] = useState<Draft>({ ...EMPTY_DRAFT, rating: initialRating });
    const [drafts, setDrafts] = useState<Record<number, Draft>>({});
    const [expanded, setExpanded] = useState<Set<number>>(() => {
        const first = items.find((item) => !item.reviewed);
        return new Set(first ? [first.index] : []);
    });
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const id = useId();

    const draftFor = (index: number) => drafts[index] ?? EMPTY_DRAFT;
    const updateItem = (index: number, change: Partial<Draft>) =>
        setDrafts((prev) => ({ ...prev, [index]: { ...(prev[index] ?? EMPTY_DRAFT), ...change } }));
    const toggle = (list: string[], tag: string) =>
        list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
    const setOpen = (index: number, open: boolean) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            if (open) next.add(index);
            else next.delete(index);
            return next;
        });

    const ratedItems = Object.entries(drafts).filter(([, d]) => d.rating > 0);
    const reviewedCount = items.filter((item) => item.reviewed || draftFor(item.index).rating > 0).length;
    const hasOrderRating = !orderReviewed && order.rating > 0;
    const hasRating = hasOrderRating || ratedItems.length > 0;
    const incomplete = (!orderReviewed && isIncomplete(order)) || Object.values(drafts).some(isIncomplete);

    const handleSubmit = async () => {
        if (!hasRating || !consent) return;
        if (incomplete) {
            setError("Some reviews have text or tags but no star rating. Add a rating or clear them.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/api/review-links/${encodeURIComponent(token)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    consent: true,
                    ...(hasOrderRating && {
                        order: { rating: order.rating, content: order.content.trim() || null, tags: order.tags },
                    }),
                    ...(ratedItems.length > 0 && {
                        reviews: ratedItems.map(([index, d]) => ({
                            index: Number(index),
                            rating: d.rating,
                            content: d.content.trim() || null,
                            tags: d.tags,
                        })),
                    }),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok || data?.state) {
                // Saved, or the link is no longer open: both end on the thank-you view
                setSubmitted(true);
                return;
            }
            setError(data?.error || "Could not save your review. Please try again.");
        } catch {
            setError("Could not save your review. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) return <ReviewThankYou />;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* ── Header ── */}
            <header className="flex items-center justify-between gap-6 px-1 sm:px-2">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4f46e5]">
                        Order #{orderNumber}
                    </p>
                    <h1 className="mt-2 text-[32px] leading-tight sm:text-5xl font-extrabold tracking-tight text-slate-900">
                        Share your experience
                    </h1>
                    <p className="mt-3 text-[15px] sm:text-base text-slate-600">
                        Your feedback helps us improve and helps other customers make better decisions.
                    </p>
                </div>
                <HeaderIllustration />
            </header>

            {/* ── Overall experience ── */}
            <section aria-labelledby={`${id}-order`} className={`${CARD} p-5 sm:p-8`}>
                <h2 id={`${id}-order`} className="text-lg sm:text-xl font-bold text-slate-900">
                    How would you rate your overall experience?
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                    This includes your ordering experience, delivery, packaging and customer support.
                </p>

                {orderReviewed ? (
                    <p className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Overall experience already reviewed
                    </p>
                ) : (
                    <>
                        <div className="mt-5">
                            <div role="group" aria-label="Overall experience rating" className="-ml-1">
                                <StarRating
                                    rating={order.rating}
                                    size="xl"
                                    className="gap-2"
                                    onChange={(rating) => setOrder((o) => withRating(o, rating, getOrderTags(rating)))}
                                />
                            </div>
                            <RatingFeedback rating={order.rating} />
                        </div>

                        <div className="my-6 border-t border-slate-100" />

                        <div className="space-y-6">
                            <RatingTags
                                rating={order.rating}
                                tags={getOrderTags(order.rating)}
                                selected={order.tags}
                                subject="your order"
                                onToggle={(tag) => setOrder((o) => ({ ...o, tags: toggle(o.tags, tag) }))}
                            />
                            <ReviewText
                                id={`${id}-order-text`}
                                label="What did you like about your experience?"
                                value={order.content}
                                placeholder="Tell us a little more... (optional)"
                                onChange={(content) => setOrder((o) => ({ ...o, content }))}
                            />
                            {isIncomplete(order) && <NeedsRating />}
                        </div>
                    </>
                )}
            </section>

            {/* ── Products ── */}
            {items.length > 0 && (
                <section aria-labelledby={`${id}-items`} className="space-y-4 border-t border-slate-200/80 pt-8">
                    <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between sm:px-2">
                        <div>
                            <h2
                                id={`${id}-items`}
                                className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900"
                            >
                                Review your products{" "}
                                <span className="text-base font-normal tracking-normal text-slate-500">(optional)</span>
                            </h2>
                            <p className="mt-1.5 text-sm sm:text-[15px] text-slate-500">
                                Tell us about the products you purchased. You can review any of them below.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 sm:min-w-[260px]">
                            <span className="whitespace-nowrap text-xs sm:text-sm font-medium text-slate-700">
                                {reviewedCount} of {items.length} products reviewed
                            </span>
                            <div
                                role="progressbar"
                                aria-label="Products reviewed"
                                aria-valuemin={0}
                                aria-valuemax={items.length}
                                aria-valuenow={reviewedCount}
                                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                            >
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${(reviewedCount / items.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        {items.map((item) => {
                            const draft = draftFor(item.index);
                            const isOpen = !item.reviewed && expanded.has(item.index);
                            const nameId = `${id}-item-${item.index}`;
                            const panelId = `${id}-panel-${item.index}`;
                            const stars = (size: "md" | "lg") => (
                                <div role="group" aria-label={`Rating for ${item.name}`} className="-ml-0.5">
                                    <StarRating
                                        rating={draft.rating}
                                        size={size}
                                        className={size === "lg" ? "gap-1.5" : "gap-0.5"}
                                        onChange={(rating) => {
                                            setDrafts((prev) => ({
                                                ...prev,
                                                [item.index]: withRating(
                                                    prev[item.index] ?? EMPTY_DRAFT,
                                                    rating,
                                                    getProductTags(item.itemType, rating),
                                                ),
                                            }));
                                            setOpen(item.index, true);
                                        }}
                                    />
                                </div>
                            );

                            return (
                                <li
                                    key={item.index}
                                    aria-labelledby={nameId}
                                    className={`${CARD} relative p-4 sm:p-6 transition-colors ${draft.rating > 0 ? "ring-1 ring-[#4f46e5]/20" : ""}`}
                                >
                                    {!item.reviewed && (
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            aria-label={`${isOpen ? "Collapse" : "Expand"} review for ${item.name}`}
                                            onClick={() => setOpen(item.index, !isOpen)}
                                            className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:right-5 sm:top-5"
                                        >
                                            <ChevronDown
                                                className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-6">
                                        <div className="row-span-1 sm:row-span-2">
                                            <ProductImage src={item.image} large={isOpen} />
                                        </div>

                                        {/* Title row (right padding leaves room for the corner arrow) */}
                                        <div className="flex min-w-0 flex-col gap-3 pr-9 sm:flex-row sm:items-start sm:justify-between sm:pr-10">
                                            <div className="min-w-0">
                                                <p
                                                    id={nameId}
                                                    className="text-[15px] sm:text-base font-bold text-slate-900 line-clamp-2"
                                                >
                                                    {item.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {[item.variantLabel, `Qty ${item.quantity}`]
                                                        .filter(Boolean)
                                                        .join("  •  ")}
                                                </p>
                                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                                    <VerifiedBadge />
                                                    {item.reviewed ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Reviewed
                                                        </span>
                                                    ) : (
                                                        draft.rating > 0 && (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-[#4338ca]">
                                                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Rated
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {!item.reviewed && !isOpen && (
                                                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                                                    {stars("md")}
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpen(item.index, true)}
                                                        className="rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4338ca] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
                                                    >
                                                        Review this product
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded panel: beside the image on desktop, full width on mobile */}
                                        {isOpen && (
                                            <div
                                                id={panelId}
                                                className="col-span-2 mt-5 border-t border-slate-100 pt-5 sm:col-span-1 sm:col-start-2"
                                            >
                                                <>
                                                    <div className="grid gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                                        <div className="sm:border-r sm:border-slate-100 sm:pr-6">
                                                            <p className="mb-3 text-[15px] sm:text-base font-semibold text-slate-900">
                                                                How would you rate this product?
                                                            </p>
                                                            {stars("lg")}
                                                            <RatingFeedback rating={draft.rating} />
                                                        </div>
                                                        <ReviewText
                                                            id={`${id}-text-${item.index}`}
                                                            label="What did you like about this product?"
                                                            value={draft.content}
                                                            placeholder="Tell us about the product... (optional)"
                                                            rows={3}
                                                            onChange={(content) => updateItem(item.index, { content })}
                                                        />
                                                    </div>
                                                    <div className="mt-4 empty:hidden">
                                                        <RatingTags
                                                            rating={draft.rating}
                                                            tags={getProductTags(item.itemType, draft.rating)}
                                                            selected={draft.tags}
                                                            subject={item.name}
                                                            onToggle={(tag) =>
                                                                updateItem(item.index, {
                                                                    tags: toggle(draft.tags, tag),
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    {isIncomplete(draft) && (
                                                        <div className="mt-3">
                                                            <NeedsRating />
                                                        </div>
                                                    )}
                                                </>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {/* ── Consent + submit ── */}
            <div className={`${CARD} px-5 py-6 sm:px-8 sm:py-7`}>
                <div className="flex items-start justify-center gap-3">
                    <input
                        id={`${id}-consent`}
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-slate-300 accent-[#4f46e5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
                    />
                    <label htmlFor={`${id}-consent`} className="cursor-pointer text-xs sm:text-sm text-slate-600">
                        {CONSENT_TEXT}{" "}
                        <Link
                            href="/terms-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-900 underline underline-offset-2 hover:text-[#4f46e5]"
                        >
                            Learn more
                        </Link>
                    </label>
                </div>

                {error && (
                    <p role="alert" className="mt-4 text-center text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasRating || !consent || submitting}
                        className="w-full sm:w-80 rounded-xl bg-[#4f46e5] py-3.5 text-[15px] sm:text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] transition-all hover:bg-[#4338ca] hover:shadow-[0_10px_24px_-8px_rgba(79,70,229,0.7)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </button>
                </div>
                {!hasRating && (
                    <p className="mt-3 text-center text-xs text-slate-500">
                        Rate your overall experience or a product to submit.
                    </p>
                )}
            </div>
        </div>
    );
}
