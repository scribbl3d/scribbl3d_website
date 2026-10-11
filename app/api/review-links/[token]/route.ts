import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getClientIdentifier } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { REVIEW_CONTENT_MAX } from "@/lib/reviews/constants";
import { loadReviewLink, PRODUCT_FIELD } from "@/lib/reviews/reviewableItems";
import { rewardReviewSubmission } from "@/lib/reviews/rewards";
import { getOrderTags, getProductTags } from "@/lib/reviews/tags";

type Context = { params: Promise<{ token: string }> };

const ratingFields = {
    rating: z.number().int().min(1).max(5),
    content: z.string().max(REVIEW_CONTENT_MAX).optional().nullable(),
    tags: z.array(z.string()).max(20).optional(),
};

const submissionSchema = z
    .object({
        // Required checkbox: review may be displayed and used for improvement/marketing
        consent: z.literal(true, {
            errorMap: () => ({ message: "Please agree to how your review will be used." }),
        }),
        order: z.object(ratingFields).optional(),
        reviews: z
            .array(z.object({ index: z.number().int().min(0), ...ratingFields }))
            .max(50)
            .optional(),
    })
    .refine((body) => body.order || (body.reviews && body.reviews.length > 0), {
        message: "Add a rating before submitting.",
    });

const CLOSED_MESSAGES = {
    invalid: "This review link is not valid.",
    ineligible: "This order is not available for review.",
    expired: "This review link has expired.",
    completed: "All items in this order have already been reviewed.",
} as const;

/** Submit an order-level review and/or product reviews via the order's review link (no login) */
export async function POST(request: NextRequest, { params }: Context) {
    const limit = await rateLimit(`review-link:${getClientIdentifier(request)}`, 10, 15 * 60 * 1000);
    if (!limit.success) {
        return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { token } = await params;
    const context = await loadReviewLink(token);
    if (context.state !== "open") {
        return NextResponse.json(
            { error: CLOSED_MESSAGES[context.state], state: context.state },
            { status: context.state === "invalid" ? 404 : 409 },
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid review" }, { status: 400 });
    }

    const items = new Map(context.items.map((item) => [item.index, item]));
    const seen = new Set<number>();
    const data: Prisma.ProductReviewCreateManyInput[] = [];

    const { order, reviews = [] } = parsed.data;
    const consentedAt = new Date();

    if (order) {
        if (context.orderReviewed) {
            return NextResponse.json({ error: "You have already reviewed this order." }, { status: 409 });
        }
        // Tags must match the rating band (e.g. no "Fast delivery" on a 1-star review)
        const allowed = getOrderTags(order.rating);
        if ((order.tags || []).some((tag) => !allowed.includes(tag))) {
            return NextResponse.json({ error: "Invalid tag selected." }, { status: 400 });
        }
    }

    for (const review of reviews) {
        const item = items.get(review.index);
        if (!item || seen.has(review.index)) {
            return NextResponse.json({ error: "One of these items cannot be reviewed." }, { status: 400 });
        }
        if (item.reviewed) {
            return NextResponse.json({ error: "One of these items has already been reviewed." }, { status: 409 });
        }
        seen.add(review.index);

        const tags = Array.from(new Set(review.tags || []));
        const allowed = getProductTags(item.itemType, review.rating);
        if (tags.some((tag) => !allowed.includes(tag))) {
            return NextResponse.json({ error: "Invalid tag selected." }, { status: 400 });
        }

        data.push({
            orderId: context.orderId,
            orderItemIndex: item.index,
            userId: context.userId,
            itemType: item.itemType,
            [PRODUCT_FIELD[item.itemType]]: item.productId,
            variantLabel: item.variantLabel,
            rating: review.rating,
            content: review.content?.trim() || null,
            tags,
            reviewerName: context.reviewerName,
            consentedAt,
        });
    }

    try {
        await prisma.$transaction([
            ...(order
                ? [
                      prisma.orderReview.create({
                          data: {
                              orderId: context.orderId,
                              userId: context.userId,
                              rating: order.rating,
                              content: order.content?.trim() || null,
                              tags: Array.from(new Set(order.tags || [])),
                              reviewerName: context.reviewerName,
                              consentedAt,
                          },
                      }),
                  ]
                : []),
            ...(data.length > 0 ? [prisma.productReview.createMany({ data })] : []),
        ]);
    } catch (error) {
        // Unique orderId / (orderId, orderItemIndex): a concurrent submission got there first
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json({ error: "This has already been reviewed." }, { status: 409 });
        }
        console.error("[Review link] Failed to save reviews:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not save your review. Please try again." }, { status: 500 });
    }

    // Coupon on the first submission inside the 15-day window (also labels the order's reviews incentivised)
    await rewardReviewSubmission(context.orderId, context.reviewerName);

    const remaining = context.items.filter((item) => !item.reviewed && !seen.has(item.index)).length;
    return NextResponse.json(
        { submitted: data.length, orderReviewed: context.orderReviewed || !!order, remaining },
        { status: 201 },
    );
}
