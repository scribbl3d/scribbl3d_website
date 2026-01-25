import { db } from "@/lib/db";
import { initiatePhonePeRefund } from "@/lib/refund";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { orderId: string } },
) {
    console.log("=================================================");
    console.log(" [CANCEL] API HIT");
    console.log(" [CANCEL] Order ID:", params.orderId);

    try {
        const order = await db.order.findUnique({
            where: { id: params.orderId },
        });

        if (!order) {
            console.log(" [CANCEL] Order not found");
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        console.log(" [CANCEL] ORDER FOUND:", {
            id: order.id,
            paymentMethod: order.paymentMethod,
            transactionId: order.transactionId,
            paymentReference: order.paymentReference,
            totalAmount: order.totalAmount,
        });

        // For v3 refund we ONLY need OMO id
        if (!order.paymentReference) {
            throw new Error(
                "Missing providerReferenceId (paymentReference / OMO id)",
            );
        }

        const refundTxnId =
            "RFD_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);

        console.log(" [CANCEL] Generated refundTxnId:", refundTxnId);
        console.log(" [CANCEL] Initiating PhonePe refund…");

        const refundResponse = await initiatePhonePeRefund({
            refundTransactionId: refundTxnId,
            providerReferenceId: order.paymentReference, // OMOxxxx
            amount: Math.round(order.totalAmount * 100),
            orderId: order.id,
        });

        console.log(" [CANCEL] Refund API SUCCESS RESPONSE:");
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

        console.log(" [CANCEL] Order updated with refund info");
        console.log("=================================================");

        return NextResponse.json({
            success: true,
            refund: refundResponse,
        });
    } catch (err: any) {
        console.error(" [CANCEL] ERROR OCCURRED");
        console.error(err);
        console.log("=================================================");

        return NextResponse.json(
            { error: err.message || "Cancel failed" },
            { status: 500 },
        );
    }
}
