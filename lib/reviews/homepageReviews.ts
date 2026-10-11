import { prisma } from "@/lib/prisma";

/**
 * Homepage "What Our Customers Say": approved order-level (overall
 * experience) reviews with written text come first, newest first, followed by
 * the testimonials managed in Admin → Landing (copied from Google reviews).
 */

export const HOMEPAGE_CUSTOMER_REVIEWS_LIMIT = 20;

export type HomepageTestimonial = {
    id: string;
    quote: string;
    name: string;
    role: string;
    initials: string;
    rating: number;
};

export function initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || "?").slice(0, 2);
    return letters.toUpperCase();
}

export async function getCustomerOrderReviewTestimonials(): Promise<HomepageTestimonial[]> {
    const reviews = await prisma.orderReview.findMany({
        where: { status: "APPROVED", content: { not: null } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: HOMEPAGE_CUSTOMER_REVIEWS_LIMIT,
        select: { id: true, content: true, reviewerName: true, rating: true },
    });
    return reviews
        .filter((r) => r.content && r.content.trim() !== "")
        .map((r) => ({
            id: `review-${r.id}`,
            quote: r.content!.trim(),
            name: r.reviewerName,
            role: "Verified customer",
            initials: initialsFor(r.reviewerName),
            rating: r.rating,
        }));
}

/** Customer reviews first, then the managed testimonials (already in their sort order) */
export function mergeHomepageTestimonials(
    customerReviews: HomepageTestimonial[],
    managed: HomepageTestimonial[],
): HomepageTestimonial[] {
    return [...customerReviews, ...managed];
}
