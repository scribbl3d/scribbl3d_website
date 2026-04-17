import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/sendEmail";
import { NextRequest, NextResponse } from "next/server";
import sendStatusEmail from "./send-email/sendStatusEmail";

/* =========================================================
   EMAIL HELPERS
   ========================================================= */
async function sendShippingEmail(order: any, trackingInfo: any) {
    if (!order.user?.email) return;

    await sendEmail({
        to: order.user.email,
        subject: "Your Order Has Been Shipped! - Scribbl3D",
        html: `<p>Your order #${order.id.slice(-6)} has been shipped.</p>`,
    });
}

/* =========================================================
   PATCH → UPDATE ORDER
   ========================================================= */
export async function PATCH(req: NextRequest, context: any) {
    try {
        const { orderId } = context.params;
        const { status, trackingInfo, notifyCustomer } = await req.json();

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                trackingInfo: trackingInfo
                    ? JSON.stringify(trackingInfo)
                    : undefined,
            },
            include: {
                user: {
                    select: { email: true, name: true },
                },
            },
        });

        if (notifyCustomer) {
            if (status === "shipped" && trackingInfo) {
                await sendShippingEmail(updatedOrder, trackingInfo);
            }

            if (status === "delivered") {
                await sendStatusEmail(updatedOrder, "delivered", trackingInfo);
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("PATCH ORDER ERROR", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 },
        );
    }
}

/* =========================================================
   DELETE → PAYMENT PENDING & FAILED ONLY
   ========================================================= */
export async function DELETE(req: NextRequest, context: any) {
    try {
        const { orderId } = context.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.status !== "payment_pending" && order.status !== "payment_failed") {
            return NextResponse.json(
                { error: "Only payment pending or failed orders can be deleted" },
                { status: 400 },
            );
        }

        await prisma.shipment.deleteMany({
            where: { orderId },
        });

        await prisma.order.delete({
            where: { id: orderId },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE ORDER ERROR", err);
        return NextResponse.json(
            { error: "Failed to delete order" },
            { status: 500 },
        );
    }
}