// app/api/internal/sync-refunds/route.ts
import { db } from "@/lib/db";
import { checkPhonePeRefundStatus } from "@/lib/refundStatus";
import { NextResponse } from "next/server";

export async function POST() {
    console.log("🔁 [SYNC-REFUNDS] Starting refund sync");

    const refunds = await db.order.findMany({
        where: {
            refundStatus: { in: ["initiated", "pending"] },
            refundId: { not: null },
        },
        select: {
            id: true,
            refundId: true,
        },
    });

    console.log(`🔎 [SYNC-REFUNDS] Found ${refunds.length} refunds`);

    for (const order of refunds) {
        try {
            console.log("➡️ Checking order:", order.id);

            const result = await checkPhonePeRefundStatus(order.refundId!);

            if (!result.success) {
                console.log("⚠️ [SYNC-REFUNDS] Refund not ready:", result.code);
                continue;
            }

            const code = result.code;

            if (code === "PAYMENT_PENDING") {
                await db.order.update({
                    where: { id: order.id },
                    data: { refundStatus: "pending" },
                });
            }

            if (code === "PAYMENT_SUCCESS") {
                await db.order.update({
                    where: { id: order.id },
                    data: {
                        refundStatus: "success",
                        refundCompletedAt: new Date(),
                    },
                });
            }

            if (code === "PAYMENT_ERROR") {
                await db.order.update({
                    where: { id: order.id },
                    data: { refundStatus: "failed" },
                });
            }
        } catch (err) {
            console.error("🔥 [SYNC-REFUNDS] Error syncing refund:", err);
        }
    }

    console.log("✅ [SYNC-REFUNDS] Done");

    return NextResponse.json({ ok: true });
}
