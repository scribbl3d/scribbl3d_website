import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-session";
import { moderateReview } from "@/lib/reviews/moderation";

const bodySchema = z.object({
    kind: z.enum(["order", "product"]),
    id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    action: z.enum(["approve", "hide"]),
});

/** PATCH { kind, id, action } → approve or hide one review (no delete, no edits) */
export async function PATCH(request: NextRequest) {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const { kind, id, action } = parsed.data;
        const review = await moderateReview(kind, id, action);
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
        return NextResponse.json(review);
    } catch (error) {
        console.error("[Admin reviews] Moderation failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not update the review" }, { status: 500 });
    }
}
