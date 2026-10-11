import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { getAdminReviewInfo } from "@/lib/reviews/requests";

type Context = { params: Promise<{ orderId: string }> };

/** GET → sharing history and submitted reviews for one order (A3) */
export async function GET(request: NextRequest, { params }: Context) {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
    }

    const { orderId } = await params;
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(orderId)) {
        return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                items: true,
                orderReview: {
                    select: { rating: true, content: true, tags: true, status: true, isIncentivised: true, createdAt: true },
                },
                reviews: {
                    orderBy: { orderItemIndex: "asc" },
                    select: {
                        orderItemIndex: true,
                        variantLabel: true,
                        rating: true,
                        content: true,
                        tags: true,
                        status: true,
                        isIncentivised: true,
                        createdAt: true,
                        printer: { select: { name: true } },
                        filament: { select: { name: true } },
                        resin: { select: { name: true } },
                        prebuiltProduct: { select: { name: true } },
                    },
                },
            },
        });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const items = (typeof order.items === "string" ? JSON.parse(order.items) : order.items) as { name?: string }[];
        return NextResponse.json(
            {
                info: await getAdminReviewInfo(orderId),
                orderReview: order.orderReview,
                productReviews: order.reviews.map(({ printer, filament, resin, prebuiltProduct, ...review }) => ({
                    ...review,
                    productName:
                        items?.[review.orderItemIndex]?.name ||
                        prebuiltProduct?.name ||
                        printer?.name ||
                        filament?.name ||
                        resin?.name ||
                        "Product",
                })),
            },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        console.error("[Admin reviews] Details failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ error: "Could not load reviews" }, { status: 500 });
    }
}
