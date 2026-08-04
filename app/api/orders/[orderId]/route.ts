import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        // Fetch order with user details
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Optional: Verify session if user is logged in
        const session = await getSession();
        if (session?.email && order.user.email !== session.email) {
            // If logged in but trying to access someone else's order
            return NextResponse.json(
                { error: "Unauthorized - Order does not belong to you" },
                { status: 403 }
            );
        }

        // Allow access if:
        // 1. User is logged in and owns the order
        // 2. User is not logged in but has the correct order ID (for payment success page)
        // Order ID is unique and acts as authentication token

        return NextResponse.json(order);
    } catch (error) {
        console.error("[API] Error fetching order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}
