// app/api/internal/create-shipment/route.ts
import { createDelhiveryShipment } from "@/lib/delhivery/createShipment";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { orderId } = await req.json();

    if (!orderId) {
        return NextResponse.json(
            { ok: false, error: "orderId required" },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });
    const existingShipment = await prisma.shipment.findUnique({
        where: { orderId },
    });

    if (existingShipment && existingShipment.status !== "failed") {
        return NextResponse.json(
            { error: "Shipment already exists" },
            { status: 409 }
        );
    }

    if (!order || order.status !== "confirmed") {
        return NextResponse.json(
            { ok: false, error: "Order not ready for shipment" },
            { status: 400 }
        );
    }

    // 🔒 Idempotency: do not create duplicate shipments
    const existing = await prisma.shipment.findFirst({
        where: { orderId },
    });

    if (existing) {
        return NextResponse.json({
            ok: true,
            reused: true,
            shipmentId: existing.id,
        });
    }

    const result = await createDelhiveryShipment(order);

    if (!result.ok || !result.waybill) {
        return NextResponse.json(
            {
                ok: false,
                error: "Delhivery shipment failed",
                delhivery: result.raw,
            },
            { status: 500 }
        );
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.shipment.create({
                data: {
                    orderId,
                    provider: "DELHIVERY",
                    waybill: result.waybill!,
                    trackingUrl: `https://www.delhivery.com/track/package/${result.waybill}`,
                    status: "created",
                    rawResponse: result.raw,
                    attempts: 1,
                },
            });

            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "shipped",
                    trackingInfo: {
                        provider: "DELHIVERY",
                        waybill: result.waybill,
                        trackingUrl: `https://www.delhivery.com/track/package/${result.waybill}`,
                    },
                },
            });
        });

        return NextResponse.json({ ok: true, waybill: result.waybill });
    } catch (err: any) {
        // 🔒 Idempotency guard for race conditions
        if (err.code === "P2002") {
            console.warn(
                "[create-shipment] Duplicate shipment prevented for order:",
                orderId
            );

            return NextResponse.json({
                ok: true,
                reused: true,
            });
        }

        throw err;
    }

    return NextResponse.json({
        ok: true,
        waybill: result.waybill,
    });
}
