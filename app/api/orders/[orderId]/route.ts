import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

// Order summary for the payment success page. Only the signed-in owner can
// read it, and only the fields that page needs are returned.
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                userId: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                user: { select: { email: true } },
            },
        });

        if (!order || order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            user: order.user,
        });
    } catch (error) {
        console.error("[API] Error fetching order:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}
