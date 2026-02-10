// app/api/orders/feedback/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, tags, items, comment } = body;

    if (!orderId) {
        return NextResponse.json(
            { error: "orderId is required" },
            { status: 400 },
        );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
            { error: "At least one item rating is required" },
            { status: 400 },
        );
    }

    // Validate each item has a rating
    for (const item of items) {
        if (!item.rating || item.rating < 1 || item.rating > 5) {
            return NextResponse.json(
                { error: "Each item must have a rating between 1-5" },
                { status: 400 },
            );
        }
    }

    // Verify order belongs to user
    const order = await db.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
    });

    if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Upsert: one feedback record per order
    const feedback = await db.orderFeedback.upsert({
        where: { orderId },
        update: {
            tags: tags || [],
            items, // JSON: [{ index, name, productId, itemType, rating, review }]
            comment: comment || null,
        },
        create: {
            orderId,
            userId: session.user.id,
            tags: tags || [],
            items,
            comment: comment || null,
        },
    });

    return NextResponse.json(feedback);
}
