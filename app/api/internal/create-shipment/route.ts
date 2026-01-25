// app/api/internal/create-shipment/route.ts
import { createDelhiveryShipment } from "@/lib/delhivery/createShipment";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const {
        orderId,
        shipping_mode,
        length,
        breadth,
        height,
        weight,
        quantity,
    } = await req.json();

    /* -------------------- Validation -------------------- */
    if (!orderId) {
        return NextResponse.json(
            { ok: false, error: "orderId required" },
            { status: 400 },
        );
    }

    if (!length || !breadth || !height || !weight || !quantity) {
        return NextResponse.json(
            { ok: false, error: "Shipment dimensions incomplete" },
            { status: 400 },
        );
    }

    /* -------------------- Fetch order -------------------- */
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order || order.status !== "confirmed") {
        return NextResponse.json(
            { ok: false, error: "Order not ready for shipment" },
            { status: 400 },
        );
    }

    /* -------------------- Idempotency -------------------- */
    const existingShipment = await prisma.shipment.findFirst({
        where: { orderId },
    });

    if (existingShipment && existingShipment.status !== "failed") {
        return NextResponse.json(
            { ok: false, error: "Shipment already exists" },
            { status: 409 },
        );
    }

    /* -------------------- Create Delhivery shipment -------------------- */
    const result = await createDelhiveryShipment({
        order,
        shipping_mode,
        dimensions: {
            length: Number(length),
            breadth: Number(breadth),
            height: Number(height),
        },
        weight: Number(weight),
        quantity: Number(quantity),
    });

    if (!result.ok || !result.waybill) {
        return NextResponse.json(
            {
                ok: false,
                error: "Delhivery shipment failed",
                delhivery: result.raw,
            },
            { status: 500 },
        );
    }

    /* -------------------- DB Transaction -------------------- */
    try {
        await prisma.$transaction(async (tx) => {
            await tx.shipment.create({
                data: {
                    orderId,
                    provider: "DELHIVERY",
                    waybill: result.waybill,
                    trackingUrl: `https://www.delhivery.com/track/package/${result.waybill}`,
                    status: "created",
                    attempts: 1,

                    rawResponse: result.raw,
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

        return NextResponse.json({
            ok: true,
            waybill: result.waybill,
        });
    } catch (err: any) {
        // 🔒 Unique constraint safety
        if (err.code === "P2002") {
            console.warn(
                "[create-shipment] Duplicate shipment prevented:",
                orderId,
            );

            return NextResponse.json({
                ok: true,
                reused: true,
            });
        }

        throw err;
    }
}
