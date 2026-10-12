// app/api/internal/sync-refunds/route.ts
import { db } from "@/lib/db";
import { checkPhonePeRefundStatus } from "@/lib/refundStatus";
import { NextResponse } from "next/server";

const FAILED_CODES = ["PAYMENT_ERROR", "PAYMENT_DECLINED", "PAYMENT_FAILED", "TRANSACTION_NOT_FOUND"];
// A refund PhonePe doesn't know yet may still be in flight
const NOT_FOUND_GRACE_MS = 10 * 60 * 1000;

export async function POST() {
    const refunds = await db.order.findMany({
        where: {
            refundStatus: { in: ["requested", "initiated", "pending"] },
            refundId: { not: null },
        },
        select: {
            id: true,
            status: true,
            refundId: true,
            refundStatus: true,
            refundInitiatedAt: true,
        },
        take: 50,
    });

    for (const order of refunds) {
        try {
            const result = await checkPhonePeRefundStatus(order.refundId!);
            const code = result?.code;

            if (code === "PAYMENT_SUCCESS") {
                await db.order.update({
                    where: { id: order.id },
                    data: {
                        status: "cancelled",
                        refundStatus: "success",
                        refundCompletedAt: new Date(),
                    },
                });
                continue;
            }

            if (code === "PAYMENT_PENDING") {
                await db.order.update({
                    where: { id: order.id },
                    data: { status: "cancelled", refundStatus: "pending" },
                });
                continue;
            }

            if (FAILED_CODES.includes(code)) {
                const age = order.refundInitiatedAt
                    ? Date.now() - new Date(order.refundInitiatedAt).getTime()
                    : Infinity;
                if (code === "TRANSACTION_NOT_FOUND" && age < NOT_FOUND_GRACE_MS) continue;

                if (order.status === "cancelled") {
                    // Shown to admins, who can retry the refund
                    await db.order.update({
                        where: { id: order.id },
                        data: { refundStatus: "failed" },
                    });
                } else {
                    // Cancellation was interrupted before the order was cancelled: release it
                    await db.order.updateMany({
                        where: { id: order.id, refundId: order.refundId },
                        data: { refundId: null, refundStatus: null, refundInitiatedAt: null },
                    });
                }
                continue;
            }

            console.log("[SYNC-REFUNDS] Refund not settled yet:", { orderId: order.id, code });
        } catch (err) {
            console.error("[SYNC-REFUNDS] Error syncing refund:", {
                orderId: order.id,
                error: err instanceof Error ? err.message : err,
            });
        }
    }

    return NextResponse.json({ ok: true });
}
