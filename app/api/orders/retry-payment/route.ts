import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { orderId, newTransactionId } = await req.json();

        if (!orderId || !newTransactionId) {
            return NextResponse.json(
                { error: "orderId and newTransactionId are required" },
                { status: 400 },
            );
        }

        // Find the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 },
            );
        }

        // Only allow retry for pending/failed payments
        if (order.status !== "payment_pending" && order.status !== "payment_failed") {
            return NextResponse.json(
                { error: `Cannot retry payment for order with status: ${order.status}` },
                { status: 400 },
            );
        }

        // Update the order with the new transaction ID
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                transactionId: newTransactionId,
                status: "payment_pending",
            },
        });

        return NextResponse.json({
            success: true,
            orderId: updatedOrder.id,
            transactionId: newTransactionId,
        });
    } catch (error) {
        console.error("[RetryPayment] Error:", error);
        return NextResponse.json(
            { error: "Failed to update payment details" },
            { status: 500 },
        );
    }
}
