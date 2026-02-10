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
    const { orderId, items, tags, comment } = body;

    // Validate
    if (!orderId || !tags || !Array.isArray(tags) || tags.length === 0) {
        return NextResponse.json(
            { error: "orderId and at least one tag are required" },
            { status: 400 },
        );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
            { error: "At least one item must be selected" },
            { status: 400 },
        );
    }

    // Verify order belongs to user
    const order = await db.order.findUnique({
        where: { id: orderId },
        select: { userId: true, status: true },
    });

    if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Upsert: one feedback record per order (replaces previous feedback)
    const feedback = await db.orderFeedback.upsert({
        where: { orderId },
        update: {
            items, // JSON array of { index, name, productId, itemType }
            tags, // string[] of selected tags
            comment: comment || null,
        },
        create: {
            orderId,
            userId: session.user.id,
            items,
            tags,
            comment: comment || null,
        },
    });

    return NextResponse.json(feedback);
}
