import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { reviewLinkUrl } from "@/lib/reviews/link";
import { buildReviewShareMessage, getAdminReviewInfo, recordReviewShare } from "@/lib/reviews/requests";

const bodySchema = z.object({ orderId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/) });

/** POST { orderId } → records a share and returns the link + WhatsApp message to copy */
export async function POST(request: NextRequest) {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }
    const { orderId } = parsed.data;

    try {
        const info = await getAdminReviewInfo(orderId);
        if (!info.canShare) {
            return NextResponse.json(
                { error: "This order's review link cannot be shared.", status: info.status },
                { status: 409 },
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { deliveredAt: true, shippingAddress: true, user: { select: { name: true } } },
        });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        await recordReviewShare(orderId, order.deliveredAt);

        const address = (typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress) as
            | { fullName?: string; name?: string }
            | null;
        const name = address?.fullName || address?.name || order.user?.name;

        return NextResponse.json({
            url: reviewLinkUrl(orderId),
            message: buildReviewShareMessage(name, orderId),
            info: await getAdminReviewInfo(orderId),
        });
    } catch (error) {
        console.error("[Admin reviews] Share failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not create the review link" }, { status: 500 });
    }
}
