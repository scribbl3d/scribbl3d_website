import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isAdminRequest } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { sendOrderCancelled } from "@/lib/email/index";
import { mapOrderToCancelEmailData } from "@/lib/email/mapOrderToEmailData";
import { canCustomerCancelOrder, pickDisplayShipment } from "@/lib/orders/cancellation";
import { toPaise } from "@/lib/payments/phonepe";
import { initiatePhonePeRefund, PhonePeRefundRejectedError, refundConfigError } from "@/lib/refund";
import { cancelReviewReward } from "@/lib/reviews/rewards";
import { cancelOrderShipments } from "@/lib/shipment/cancelShipments";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cancels an order in one server-side operation: claim the order (so only
 * one request can refund it), cancel any Delhivery waybills, then refund.
 * A verified admin may also retry a refund that PhonePe rejected.
 */

/** Deterministic refund ID per attempt: RFD_<orderId>, then RFD_<orderId>_2, _3… */
function nextRefundId(orderId: string, previous: string | null) {
    if (!previous) return `RFD_${orderId}`;
    const attempt = Number(previous.match(/_(\d+)$/)?.[1] || 1);
    return `RFD_${orderId}_${attempt + 1}`;
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await context.params;

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

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { user: true, shipments: true },
        });

        if (!order || (!isAdmin && order.userId !== session?.user?.id)) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        const isRefundRetry =
            isAdmin &&
            order.status === "cancelled" &&
            order.refundStatus === "failed";

        // Prevent a second refund for an order already cancelled/refunded
        if (!isRefundRetry && (order.status === "cancelled" || order.refundId)) {
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

        if (!order.paymentReference) {
            return NextResponse.json(
                { error: "This order has no captured payment to refund" },
                { status: 409 },
            );
        }

        const configError = refundConfigError();
        if (configError) {
            console.error("[CANCEL] Refunds unavailable:", configError);
            return NextResponse.json(
                { error: "Refunds are temporarily unavailable. Please try again later." },
                { status: 503 },
            );
        }

        /* ---------- CLAIM (exactly one request proceeds) ---------- */
        const refundTxnId = nextRefundId(order.id, isRefundRetry ? order.refundId : null);
        const claim = await db.order.updateMany({
            where: isRefundRetry
                ? { id: order.id, status: "cancelled", refundStatus: "failed", refundId: order.refundId }
                : { id: order.id, refundId: null, status: { not: "cancelled" } },
            data: {
                refundId: refundTxnId,
                refundStatus: "requested",
                refundInitiatedAt: new Date(),
            },
        });
        if (claim.count === 0) {
            return NextResponse.json(
                { error: "This order is already being cancelled" },
                { status: 409 },
            );
        }

        /* ---------- CANCEL SHIPMENTS ---------- */
        if (!isRefundRetry) {
            const shipments = await cancelOrderShipments(order.shipments);
            if (!shipments.ok) {
                // Nothing was refunded: release the claim so it can be retried
                await db.order.updateMany({
                    where: { id: order.id, refundId: refundTxnId },
                    data: { refundId: null, refundStatus: null, refundInitiatedAt: null },
                });
                console.error("[CANCEL] Shipment cancellation failed:", { orderId: order.id, results: shipments.results });
                return NextResponse.json(
                    {
                        error: shipments.inTransit
                            ? "The parcel is already in transit, so the shipment cannot be cancelled. Arrange a return with Delhivery before refunding."
                            : "We couldn't cancel the shipment with the courier. Please try again.",
                        results: shipments.results,
                    },
                    { status: shipments.inTransit ? 409 : 502 },
                );
            }
        }

        /* ---------- REFUND ---------- */
        let refundStatus = "initiated";
        try {
            await initiatePhonePeRefund({
                refundTransactionId: refundTxnId,
                providerReferenceId: order.paymentReference,
                amount: toPaise(order.totalAmount),
                orderId: order.id,
            });
        } catch (err) {
            // A definite rejection can be retried by an admin; anything else
            // (timeout, network) is reconciled by the refund status sync.
            refundStatus = err instanceof PhonePeRefundRejectedError ? "failed" : "pending";
            console.error("[CANCEL] Refund request did not complete:", {
                orderId: order.id,
                refundTxnId,
                refundStatus,
                error: err instanceof Error ? err.message : String(err),
            });
        }

        await db.order.update({
            where: { id: order.id },
            data: { status: "cancelled", refundStatus },
        });

        if (!isRefundRetry) {
            // Refunded order: its review coupon (if any) is cancelled (C7)
            await cancelReviewReward(order.id).catch((err) =>
                console.error("[CANCEL] Review coupon cancel failed:", err instanceof Error ? err.message : err),
            );

            // Send cancellation email (fire-and-forget)
            if (order.user?.email) {
                sendOrderCancelled(
                    mapOrderToCancelEmailData(
                        { ...order, refundStatus },
                        cancelledBy,
                        cancellationReason,
                    ),
                ).catch((err) =>
                    console.error("[Email] Order cancellation email failed:", err),
                );
            }
        }

        return NextResponse.json({ success: true, refundStatus });
    } catch (err) {
        console.error("[CANCEL] Error:", { orderId, error: err instanceof Error ? err.message : err });
        return NextResponse.json(
            { error: "Cancel failed" },
            { status: 500 },
        );
    }
}
