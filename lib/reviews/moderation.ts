import type { Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Admin review moderation (M1–M4): one list across order-level and product
 * reviews, approve / hide only (customer text is never edited or deleted).
 */

export const MODERATION_PAGE_SIZE = 20;
export const LOW_RATING_MAX = 2;

export type ReviewKind = "order" | "product";
export type ModerationAction = "approve" | "hide";

export type ModerationFilters = {
    status?: ReviewStatus | "ALL";
    kind?: ReviewKind | "all";
    rating?: "low" | 1 | 2 | 3 | 4 | 5 | "all";
    page?: number;
};

export type ModerationItem = {
    id: string;
    kind: ReviewKind;
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
};

function ratingWhere(rating: ModerationFilters["rating"]) {
    if (rating === "low") return { rating: { lte: LOW_RATING_MAX } };
    if (typeof rating === "number") return { rating };
    return {};
}

function snapshotItems(items: unknown): { name?: string }[] {
    if (typeof items === "string") {
        try {
            return JSON.parse(items);
        } catch {
            return [];
        }
    }
    return Array.isArray(items) ? items : [];
}

export async function listReviewsForModeration(filters: ModerationFilters) {
    const page = Math.max(1, filters.page || 1);
    const take = page * MODERATION_PAGE_SIZE; // enough of each kind to fill this page after merging
    const where = {
        ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
        ...ratingWhere(filters.rating),
    };
    const wantOrder = filters.kind !== "product";
    const wantProduct = filters.kind !== "order";

    const [orderReviews, productReviews, orderTotal, productTotal] = await Promise.all([
        wantOrder
            ? prisma.orderReview.findMany({ where: where as Prisma.OrderReviewWhereInput, orderBy: { createdAt: "desc" }, take })
            : [],
        wantProduct
            ? prisma.productReview.findMany({
                  where: where as Prisma.ProductReviewWhereInput,
                  orderBy: { createdAt: "desc" },
                  take,
                  include: {
                      order: { select: { items: true } },
                      printer: { select: { name: true } },
                      filament: { select: { name: true } },
                      resin: { select: { name: true } },
                      prebuiltProduct: { select: { name: true } },
                  },
              })
            : [],
        wantOrder ? prisma.orderReview.count({ where: where as Prisma.OrderReviewWhereInput }) : 0,
        wantProduct ? prisma.productReview.count({ where: where as Prisma.ProductReviewWhereInput }) : 0,
    ]);

    const merged: ModerationItem[] = [
        ...orderReviews.map((r) => ({
            id: r.id,
            kind: "order" as const,
            orderId: r.orderId,
            orderNumber: r.orderId.slice(-8).toUpperCase(),
            productName: null,
            itemType: null,
            variantLabel: null,
            rating: r.rating,
            content: r.content,
            tags: r.tags,
            reviewerName: r.reviewerName,
            status: r.status,
            isIncentivised: r.isIncentivised,
            createdAt: r.createdAt.toISOString(),
            moderatedAt: r.moderatedAt?.toISOString() ?? null,
        })),
        ...productReviews.map((r) => ({
            id: r.id,
            kind: "product" as const,
            orderId: r.orderId,
            orderNumber: r.orderId.slice(-8).toUpperCase(),
            productName:
                snapshotItems(r.order?.items)[r.orderItemIndex]?.name ||
                r.prebuiltProduct?.name ||
                r.printer?.name ||
                r.filament?.name ||
                r.resin?.name ||
                "Product",
            itemType: r.itemType,
            variantLabel: r.variantLabel,
            rating: r.rating,
            content: r.content,
            tags: r.tags,
            reviewerName: r.reviewerName,
            status: r.status,
            isIncentivised: r.isIncentivised,
            createdAt: r.createdAt.toISOString(),
            moderatedAt: r.moderatedAt?.toISOString() ?? null,
        })),
    ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.id < b.id ? 1 : -1));

    const start = (page - 1) * MODERATION_PAGE_SIZE;
    return {
        reviews: merged.slice(start, start + MODERATION_PAGE_SIZE),
        total: orderTotal + productTotal,
        page,
        pageSize: MODERATION_PAGE_SIZE,
    };
}

/** Approve (pending/hidden → approved) or hide (→ hidden). Returns null if not found. */
export async function moderateReview(kind: ReviewKind, id: string, action: ModerationAction, now = new Date()) {
    const data = { status: (action === "approve" ? "APPROVED" : "HIDDEN") as ReviewStatus, moderatedAt: now };
    try {
        return kind === "order"
            ? await prisma.orderReview.update({ where: { id }, data, select: { id: true, status: true, moderatedAt: true } })
            : await prisma.productReview.update({ where: { id }, data, select: { id: true, status: true, moderatedAt: true } });
    } catch (error) {
        if ((error as { code?: string })?.code === "P2025") return null;
        throw error;
    }
}

/** Counts per status across both kinds, plus pending 1–2★ (summary cards and tabs) */
export async function getModerationStatusCounts() {
    const [orderGroups, productGroups, low] = await Promise.all([
        prisma.orderReview.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.productReview.groupBy({ by: ["status"], _count: { _all: true } }),
        getReviewModerationCounts(),
    ]);
    const counts = { PENDING: 0, APPROVED: 0, HIDDEN: 0 } as Record<ReviewStatus, number>;
    for (const g of [...orderGroups, ...productGroups]) counts[g.status] += g._count._all;
    return {
        pending: counts.PENDING,
        approved: counts.APPROVED,
        hidden: counts.HIDDEN,
        all: counts.PENDING + counts.APPROVED + counts.HIDDEN,
        lowRatingPending: low.lowRating,
    };
}

/** Dashboard flags: pending reviews and pending 1–2★ reviews (M4) */
export async function getReviewModerationCounts() {
    const pending = { status: "PENDING" as ReviewStatus };
    const low = { ...pending, rating: { lte: LOW_RATING_MAX } };
    const [orderPending, productPending, orderLow, productLow] = await Promise.all([
        prisma.orderReview.count({ where: pending }),
        prisma.productReview.count({ where: pending }),
        prisma.orderReview.count({ where: low }),
        prisma.productReview.count({ where: low }),
    ]);
    return { pending: orderPending + productPending, lowRating: orderLow + productLow };
}
