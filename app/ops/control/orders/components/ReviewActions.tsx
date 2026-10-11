"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { formatOrderIdRaw } from "@/lib/format-order-id";
import { ActionButton } from "./ActionButton";
import { formatDate } from "../utils/formatters";

/* =========================================================
   TYPES (mirror lib/reviews/requests.ts)
   ========================================================= */
export type AdminReviewStatus = "not_eligible" | "expired" | "not_shared" | "shared" | "partial" | "reviewed";

export interface AdminReviewInfo {
    status: AdminReviewStatus;
    canShare: boolean;
    emailSentAt: string | null;
    firstSharedAt: string | null;
    lastSharedAt: string | null;
    shareCount: number;
}

interface ReviewEntry {
    rating: number;
    content: string | null;
    tags: string[];
    status: "PENDING" | "APPROVED" | "HIDDEN";
    isIncentivised: boolean;
    createdAt: string;
}

interface ReviewDetails {
    info: AdminReviewInfo;
    orderReview: ReviewEntry | null;
    productReviews: (ReviewEntry & { productName: string; variantLabel: string | null })[];
}

const STATUS_BADGE: Record<AdminReviewStatus, { label: string; className: string }> = {
    not_shared: { label: "Not shared", className: "bg-slate-200 text-slate-700 hover:bg-slate-200" },
    shared: { label: "Link shared", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    partial: { label: "Partially reviewed", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
    reviewed: { label: "Reviewed", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    expired: { label: "Link expired", className: "bg-slate-100 text-slate-500 hover:bg-slate-100" },
    not_eligible: { label: "Not eligible", className: "bg-slate-100 text-slate-500 hover:bg-slate-100" },
};

/* =========================================================
   STATUS BADGE (table column)
   ========================================================= */
export function ReviewStatusBadge({ info }: { info?: AdminReviewInfo }) {
    if (!info) return <span className="text-xs text-muted-foreground">Loading…</span>;
    const badge = STATUS_BADGE[info.status];
    return <Badge className={badge.className}>{badge.label}</Badge>;
}

/* =========================================================
   ACTIONS (share / share again / reviewed + details)
   ========================================================= */
export function ReviewActions({
    orderId,
    info,
    onChanged,
}: {
    orderId: string;
    info?: AdminReviewInfo;
    onChanged: (info: AdminReviewInfo) => void;
}) {
    const [sharing, setSharing] = useState(false);
    const [share, setShare] = useState<{ url: string; message: string } | null>(null);
    const [details, setDetails] = useState<ReviewDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    if (!info) return null;

    const hasHistory = info.shareCount > 0 || !!info.emailSentAt;
    const hasReviews = info.status === "partial" || info.status === "reviewed";

    async function handleShare() {
        setSharing(true);
        try {
            const res = await fetch("/api/admin/reviews/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast({ variant: "destructive", title: "Could not share", description: data?.error || "Please try again." });
                return;
            }
            setShare({ url: data.url, message: data.message });
            onChanged(data.info);
        } finally {
            setSharing(false);
        }
    }

    async function handleCopy() {
        if (!share) return;
        try {
            await navigator.clipboard.writeText(share.message);
            setShare(null);
            toast({ title: "Message copied", description: "Paste it in WhatsApp to send to the customer." });
        } catch {
            toast({ variant: "destructive", title: "Copy failed", description: "Select the message and copy it manually." });
        }
    }

    async function openDetails() {
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/admin/reviews/${encodeURIComponent(orderId)}`);
            const data = await res.json().catch(() => null);
            if (!res.ok || !data) {
                toast({ variant: "destructive", title: "Could not load reviews" });
                return;
            }
            setDetails(data);
        } finally {
            setLoadingDetails(false);
        }
    }

    return (
        <>
            {info.status === "reviewed" ? (
                <ActionButton variant="outline" disabled>
                    Reviewed
                </ActionButton>
            ) : (
                info.canShare && (
                    <ActionButton disabled={sharing} onClick={handleShare}>
                        {sharing ? "Preparing…" : hasHistory ? "Share again" : "Share link"}
                    </ActionButton>
                )
            )}

            {(hasHistory || hasReviews) && (
                <ActionButton variant="outline" disabled={loadingDetails} onClick={openDetails}>
                    {loadingDetails ? "Loading…" : "Review details"}
                </ActionButton>
            )}

            {/* ── Share dialog ── */}
            <Dialog open={!!share} onOpenChange={(open) => !open && setShare(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Share review link</DialogTitle>
                        <DialogDescription>
                            Order {formatOrderIdRaw(orderId)}. Copy this message and send it to the customer on WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <label htmlFor={`share-${orderId}`} className="sr-only">
                        Share message
                    </label>
                    <textarea
                        id={`share-${orderId}`}
                        readOnly
                        value={share?.message ?? ""}
                        rows={8}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-full resize-none rounded-md border bg-slate-50 p-3 text-sm"
                    />
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShare(null)}>
                            Close
                        </Button>
                        <Button onClick={handleCopy}>Copy message</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Details dialog ── */}
            <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Reviews for order {formatOrderIdRaw(orderId)}</DialogTitle>
                        <DialogDescription>Sharing history and submitted reviews.</DialogDescription>
                    </DialogHeader>
                    {details && <ReviewDetailsBody details={details} />}
                </DialogContent>
            </Dialog>
        </>
    );
}

/* =========================================================
   DETAILS BODY
   ========================================================= */
function Stars({ rating }: { rating: number }) {
    return (
        <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    aria-hidden="true"
                    className={`h-4 w-4 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                />
            ))}
        </span>
    );
}

function ReviewBlock({ title, subtitle, review }: { title: string; subtitle?: string | null; review: ReviewEntry }) {
    return (
        <div className={`rounded-md border p-3 ${review.rating <= 2 ? "border-red-200 bg-red-50/40" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <Badge variant="outline" className="text-xs capitalize">
                        {review.status.toLowerCase()}
                    </Badge>
                </div>
            </div>
            {review.tags.length > 0 && <p className="mt-2 text-xs text-slate-600">{review.tags.join(" · ")}</p>}
            {review.content && <p className="mt-2 whitespace-pre-line text-sm">{review.content}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDate(review.createdAt)}</p>
        </div>
    );
}

function ReviewDetailsBody({ details }: { details: ReviewDetails }) {
    const { info, orderReview, productReviews } = details;
    return (
        <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border bg-slate-50 p-3 text-sm">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                    <ReviewStatusBadge info={info} />
                </dd>
                <dt className="text-muted-foreground">Shared</dt>
                <dd>
                    {info.shareCount} {info.shareCount === 1 ? "time" : "times"}
                </dd>
                <dt className="text-muted-foreground">First shared</dt>
                <dd>{formatDate(info.firstSharedAt ?? undefined)}</dd>
                <dt className="text-muted-foreground">Last shared</dt>
                <dd>{formatDate(info.lastSharedAt ?? undefined)}</dd>
            </dl>

            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Overall experience</h3>
                {orderReview ? (
                    <ReviewBlock title="Order review" review={orderReview} />
                ) : (
                    <p className="text-sm text-muted-foreground">Not reviewed yet.</p>
                )}
            </section>

            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Products</h3>
                {productReviews.length > 0 ? (
                    productReviews.map((review, i) => (
                        <ReviewBlock key={i} title={review.productName} subtitle={review.variantLabel} review={review} />
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No product reviews yet.</p>
                )}
            </section>
        </div>
    );
}
