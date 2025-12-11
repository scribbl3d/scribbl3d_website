// app/api/order/[orderId]/create-shipment/route.ts
import { createDelhiveryStagingShipment } from "@/lib/delhivery-staging";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        // Next.js dynamic API requirement — await params
        const { orderId } = await context.params;
        if (!orderId) {
            console.error("[create-shipment] Missing orderId in params");
            return NextResponse.json(
                { ok: false, message: "orderId required" },
                { status: 400 }
            );
        }

        // Fetch order
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            console.error("[create-shipment] Order not found:", orderId);
            return NextResponse.json(
                { ok: false, message: "order not found" },
                { status: 404 }
            );
        }

        console.log("[create-shipment] Creating shipment for order:", orderId);

        // Call helper to create shipment at Delhivery (staging/mock)
        const result = await createDelhiveryStagingShipment(order);

        // Normalize values with safe fallbacks
        const savedProvider =
            result.saved?.provider ??
            (result.delhiveryResp?.provider as string) ??
            "DELHIVERY_STAGING";
        const savedWaybill = result.saved?.waybill ?? result.saved?.id ?? "";
        const savedStatus =
            result.saved?.status ?? (result.ok ? "created" : "error");
        const savedTrackingUrl = result.saved?.trackingUrl ?? null;
        const savedRaw =
            result.delhiveryResp ??
            result.saved?.rawResponse ??
            result.error ??
            {};

        // Upsert shipment (one shipment per order assumed)
        const existingShipment = await prisma.shipment.findFirst({
            where: { orderId: order.id },
        });

        let shipment;
        if (existingShipment) {
            shipment = await prisma.shipment.update({
                where: { id: existingShipment.id },
                data: {
                    provider: savedProvider,
                    waybill: savedWaybill,
                    status: savedStatus,
                    trackingUrl: savedTrackingUrl,
                    rawResponse: savedRaw,
                },
            });
        } else {
            shipment = await prisma.shipment.create({
                data: {
                    orderId: String(order.id),
                    provider: savedProvider,
                    waybill: savedWaybill,
                    status: savedStatus,
                    trackingUrl: savedTrackingUrl,
                    rawResponse: savedRaw,
                },
            });
        }

        console.log(
            "[create-shipment] Shipment saved:",
            shipment.id,
            "status:",
            shipment.status
        );

        // Decide whether to update the Order status
        const statusLower = String(shipment.status || "").toLowerCase();
        const shouldMarkShipped = ["shipped", "created"].includes(statusLower);
        const shouldMarkError =
            result.ok === false || statusLower === "error" || !!result.error;

        const trackingInfoPayload = {
            provider: shipment.provider,
            trackingNumber: shipment.waybill || null,
            trackingUrl: shipment.trackingUrl || null,
            raw: shipment.rawResponse || {},
        };

        // Force-update order when shipment indicates shipped/created or error
        try {
            if (shouldMarkShipped) {
                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "shipped",
                        trackingInfo: trackingInfoPayload,
                    },
                });
                console.log(
                    "[create-shipment] FORCED order.status=shipped for order:",
                    order.id
                );
                // return combined response
                return NextResponse.json({
                    ok: true,
                    delhiveryResp: result.delhiveryResp ?? null,
                    savedShipment: shipment,
                    order: updatedOrder,
                });
            } else if (shouldMarkError) {
                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "error",
                        trackingInfo: trackingInfoPayload,
                    },
                });
                console.log(
                    "[create-shipment] FORCED order.status=error for order:",
                    order.id
                );
                return NextResponse.json({
                    ok: true,
                    delhiveryResp: result.delhiveryResp ?? null,
                    savedShipment: shipment,
                    order: updatedOrder,
                });
            } else {
                // Only update trackingInfo (no status change)
                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        trackingInfo: trackingInfoPayload,
                    },
                });
                console.log(
                    "[create-shipment] Order trackingInfo updated (no status change):",
                    order.id
                );
                return NextResponse.json({
                    ok: true,
                    delhiveryResp: result.delhiveryResp ?? null,
                    savedShipment: shipment,
                    order: updatedOrder,
                });
            }
        } catch (orderErr: any) {
            console.error(
                "[create-shipment] Failed to update order after shipment:",
                orderErr
            );
            // still return shipment info so admin can retry/update manually
            return NextResponse.json(
                {
                    ok: false,
                    message: "Shipment saved but failed to update order",
                    savedShipment: shipment,
                    error: String(orderErr),
                },
                { status: 500 }
            );
        }
    } catch (err: any) {
        console.error("[create-shipment] ERROR:", err);
        return NextResponse.json(
            { ok: false, message: String(err) },
            { status: 500 }
        );
    }
}
