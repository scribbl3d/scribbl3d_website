import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { getAdminReviewInfo } from "@/lib/reviews/requests";

const MAX_ORDERS = 50;

/** GET ?orderIds=a,b,c → review status for the orders visible on the Delivered tab */
export async function GET(request: NextRequest) {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
    }

    const ids = Array.from(
        new Set(
            (request.nextUrl.searchParams.get("orderIds") || "")
                .split(",")
                .map((id) => id.trim())
                .filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id)),
        ),
    );
    if (ids.length === 0) return NextResponse.json({});
    if (ids.length > MAX_ORDERS) {
        return NextResponse.json({ error: `At most ${MAX_ORDERS} orders per request` }, { status: 400 });
    }

    try {
        const entries = await Promise.all(ids.map(async (id) => [id, await getAdminReviewInfo(id)] as const));
        return NextResponse.json(Object.fromEntries(entries), { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        console.error("[Admin reviews] Status failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not load review status" }, { status: 500 });
    }
}
