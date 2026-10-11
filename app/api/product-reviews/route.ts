import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductReviewPage, getProductReviewSummary } from "@/lib/reviews/productReviews";

const querySchema = z.object({
    type: z.enum(["printer", "filament", "resin", "prebuilt"]),
    id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    page: z.coerce.number().int().min(1).max(200).default(1),
});

/** GET ?type=&id=&page= → approved reviews for a PDP ("Load more"); public */
export async function GET(request: NextRequest) {
    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { type, id, page } = parsed.data;
    try {
        const summary = await getProductReviewSummary(type, id);
        // Below the display threshold nothing is public yet
        const reviews = summary.showList ? await getProductReviewPage(type, id, page) : [];
        return NextResponse.json(
            { reviews, total: summary.showList ? summary.count : 0 },
            { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
        );
    } catch (error) {
        console.error("[Product reviews] Failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
    }
}
