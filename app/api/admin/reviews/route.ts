import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-session";
import { getModerationStatusCounts, listReviewsForModeration } from "@/lib/reviews/moderation";

const querySchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "HIDDEN", "ALL"]).default("PENDING"),
    kind: z.enum(["order", "product", "all"]).default("all"),
    rating: z
        .union([z.literal("low"), z.literal("all"), z.coerce.number().int().min(1).max(5)])
        .default("all"),
    page: z.coerce.number().int().min(1).max(500).default(1),
});

/** GET → order-level and product reviews for moderation (All reviews page) */
export async function GET(request: NextRequest) {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }

    try {
        const [result, counts] = await Promise.all([
            listReviewsForModeration(parsed.data as Parameters<typeof listReviewsForModeration>[0]),
            getModerationStatusCounts(),
        ]);
        return NextResponse.json({ ...result, counts }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("[Admin reviews] List failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
    }
}
