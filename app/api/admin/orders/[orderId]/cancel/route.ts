import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isAdminRequest } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { sendOrderCancelled } from "@/lib/email/index";
import { mapOrderToCancelEmailData } from "@/lib/email/mapOrderToEmailData";
import { canCustomerCancelOrder, pickDisplayShipment } from "@/lib/orders/cancellation";
import { initiatePhonePeRefund } from "@/lib/refund";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: any) {
    const orderId = context.params.orderId;

    // Who is cancelling is decided server-side, never from the request body
    const isAdmin = await isAdminRequest(req);
    const session = isAdmin ? null : await getServerSession(authOptions);
    if (!isAdmin && !session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const cancelledBy: "customer" | "admin" = isAdmin ? "admin" : "customer";

    let cancellationReason: string | undefined;
    try {
        const body = await req.json();
        if (typeof body?.reason === "string") cancellationReason = body.reason;
    } catch {
        // No body sent
    }

    console.log("=================================================");
    console.log("🧨 [CANCEL] API HIT");
    console.log("🧨 [CANCEL] Order ID:", orderId);
    console.log("🧨 [CANCEL] Cancelled by:", cancelledBy);

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { user: true, shipments: true },
        });

        if (!order || (!isAdmin && order.userId !== session?.user?.id)) {
            console.log("❌ [CANCEL] Order not found");
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        // Prevent a second refund for an order already cancelled/refunded
        if (order.status === "cancelled" || order.refundId) {
            return NextResponse.json(
                { error: "Order is already cancelled" },
                { status: 409 },
            );
        }

        if (
            !isAdmin &&
            !canCustomerCancelOrder(
                order.status,
                pickDisplayShipment(order.shipments)?.status,
            )
        ) {
            return NextResponse.json(
                { error: "This order can no longer be cancelled" },
                { status: 409 },
            );
        }

        console.log("📄 [CANCEL] ORDER FOUND:", {
            id: order.id,
            paymentMethod: order.paymentMethod,
            transactionId: order.transactionId,
            paymentReference: order.paymentReference,
            totalAmount: order.totalAmount,
        });

        if (!order.paymentReference) {
            throw new Error(
                "Missing providerReferenceId (paymentReference / OMO id)",
            );
        }

        const refundTxnId =
            "RFD_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);

        console.log("💸 [CANCEL] Generated refundTxnId:", refundTxnId);
        console.log("💸 [CANCEL] Initiating PhonePe refund…");

        const refundResponse = await initiatePhonePeRefund({
            refundTransactionId: refundTxnId,
            providerReferenceId: order.paymentReference,
            amount: Math.round(order.totalAmount * 100),
            orderId: order.id,
        });

        console.log("✅ [CANCEL] Refund API RESPONSE:");
        console.log(JSON.stringify(refundResponse, null, 2));

        await db.order.update({
            where: { id: order.id },
            data: {
                status: "cancelled",
                refundStatus: "initiated",
                refundId: refundTxnId,
                refundInitiatedAt: new Date(),
            },
        });

        console.log("✅ [CANCEL] Order updated in DB");

        // Send cancellation email (fire-and-forget)
        if (order.user?.email) {
            sendOrderCancelled(
                mapOrderToCancelEmailData(
                    order,
                    cancelledBy,
                    cancellationReason,
                ),
            ).catch((err) =>
                console.error("[Email] Order cancellation email failed:", err),
            );
        }

        console.log("=================================================");

        return NextResponse.json({
            success: true,
            refund: refundResponse,
        });
    } catch (err: any) {
        console.error("🔥 [CANCEL] ERROR");
        console.error(err);
        console.log("=================================================");

        return NextResponse.json(
            { error: err.message || "Cancel failed" },
            { status: 500 },
        );
    }
}
