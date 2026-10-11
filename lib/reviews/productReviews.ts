import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Public product reviews for PDPs (P1–P7). Only APPROVED reviews count.
 * Filament reviews are pooled across the colour group (same "material finish"
 * category the PDP uses for its colour swatches); other families per product.
 */

export const REVIEW_LIST_MIN = 2; // review section shown from 2 approved reviews
export const REVIEW_AVERAGE_MIN = 5; // average, count and breakdown from 5
export const PDP_REVIEWS_PAGE_SIZE = 5;

export type ProductFamily = "printer" | "filament" | "resin" | "prebuilt";

export type PublicReview = {
    id: string;
    reviewerName: string;
    rating: number;
    content: string | null;
    tags: string[];
    variantLabel: string | null;
    isIncentivised: boolean;
    createdAt: string;
};

export type ProductReviewSummary = {
    count: number;
    average: number | null; // only when count >= REVIEW_AVERAGE_MIN
    breakdown: Record<1 | 2 | 3 | 4 | 5, number> | null; // same threshold
    showList: boolean;
    showAverage: boolean;
};

const FIELD: Record<ProductFamily, "printerId" | "filamentId" | "resinId" | "prebuiltProductId"> = {
    printer: "printerId",
    filament: "filamentId",
    resin: "resinId",
    prebuilt: "prebuiltProductId",
};

/** Filament IDs whose reviews are shown together (the colour group) */
export async function pooledFilamentIds(filamentId: string): Promise<string[]> {
    const filament = await prisma.filament.findUnique({
        where: { id: filamentId },
        select: { material: true, finishType: true },
    });
    if (!filament) return [filamentId];

    const groupCategory = `${filament.material} ${filament.finishType}`;
    const group = await prisma.filamentColorGroup.findMany({
        where: { category: groupCategory },
        select: { filamentId: true },
    });
    return Array.from(new Set([filamentId, ...group.map((g) => g.filamentId)]));
}

export async function reviewScope(family: ProductFamily, productId: string): Promise<Prisma.ProductReviewWhereInput> {
    const base: Prisma.ProductReviewWhereInput = { status: "APPROVED" };
    if (family === "filament") {
        return { ...base, filamentId: { in: await pooledFilamentIds(productId) } };
    }
    return { ...base, [FIELD[family]]: productId };
}

export function summarize(groups: { rating: number; count: number }[]): ProductReviewSummary {
    const count = groups.reduce((sum, g) => sum + g.count, 0);
    const showAverage = count >= REVIEW_AVERAGE_MIN;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    let total = 0;
    for (const g of groups) {
        if (g.rating >= 1 && g.rating <= 5) breakdown[g.rating as 1 | 2 | 3 | 4 | 5] += g.count;
        total += g.rating * g.count;
    }
    return {
        count,
        average: showAverage ? Math.round((total / count) * 10) / 10 : null,
        breakdown: showAverage ? breakdown : null,
        showList: count >= REVIEW_LIST_MIN,
        showAverage,
    };
}

export async function getProductReviewSummary(family: ProductFamily, productId: string) {
    const where = await reviewScope(family, productId);
    const groups = await prisma.productReview.groupBy({ by: ["rating"], where, _count: { _all: true } });
    return summarize(groups.map((g) => ({ rating: g.rating, count: g._count._all })));
}

/** Newest first; never exposes order, user or product IDs */
export async function getProductReviewPage(family: ProductFamily, productId: string, page = 1): Promise<PublicReview[]> {
    const where = await reviewScope(family, productId);
    const rows = await prisma.productReview.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (Math.max(1, page) - 1) * PDP_REVIEWS_PAGE_SIZE,
        take: PDP_REVIEWS_PAGE_SIZE,
        select: {
            id: true,
            reviewerName: true,
            rating: true,
            content: true,
            tags: true,
            variantLabel: true,
            isIncentivised: true,
            createdAt: true,
        },
    });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Summary + first page for a PDP; reviews are only loaded when the section will show */
export async function getPdpReviews(family: ProductFamily, productId: string) {
    const summary = await getProductReviewSummary(family, productId);
    const reviews = summary.showList ? await getProductReviewPage(family, productId, 1) : [];
    return { summary, reviews };
}

/** schema.org Review entries for JSON-LD (only reviews visible on the page) */
export function reviewsJsonLd(reviews: PublicReview[]) {
    return reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.reviewerName },
        datePublished: r.createdAt.split("T")[0],
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        ...(r.content && { reviewBody: r.content }),
    }));
}

/** buildProductJsonLd fields: rating + visible reviews, only once the average is shown (S1) */
export function pdpJsonLdRating(pdp: { summary: ProductReviewSummary; reviews: PublicReview[] }) {
    const { summary, reviews } = pdp;
    if (!summary.showAverage || summary.average === null) return {};
    return { rating: { average: summary.average, count: summary.count }, reviews: reviewsJsonLd(reviews) };
}
