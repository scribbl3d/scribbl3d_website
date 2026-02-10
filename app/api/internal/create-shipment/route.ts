// app/api/internal/create-shipment/route.ts
import {
    createDelhiveryMPSShipment,
    createDelhiveryShipment,
} from "@/lib/delhivery/createShipment";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PackageInput {
    length: string;
    breadth: string;
    height: string;
    weight: string;
    quantity: string;
    products_desc?: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            orderId,
            shipping_mode,
            shipment_type = "SPS", // Default to single package
            packages,
            // Legacy single-package fields (for backward compatibility)
            length,
            breadth,
            height,
            weight,
            quantity,
        } = body;

        /* -------------------- Validation -------------------- */
        if (!orderId) {
            return NextResponse.json(
                { ok: false, error: "orderId required" },
                { status: 400 },
            );
        }

        // Normalize packages array
        let normalizedPackages: PackageInput[];

        if (packages && Array.isArray(packages) && packages.length > 0) {
            // New format with packages array
            normalizedPackages = packages;
        } else if (length && breadth && height && weight && quantity) {
            // Legacy single-package format
            normalizedPackages = [
                { length, breadth, height, weight, quantity },
            ];
        } else {
            return NextResponse.json(
                { ok: false, error: "Shipment dimensions incomplete" },
                { status: 400 },
            );
        }

        // Validate all packages have required fields
        for (let i = 0; i < normalizedPackages.length; i++) {
            const pkg = normalizedPackages[i];
            if (
                !pkg.length ||
                !pkg.breadth ||
                !pkg.height ||
                !pkg.weight ||
                !pkg.quantity
            ) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: `Package ${i + 1} has incomplete dimensions`,
                    },
                    { status: 400 },
                );
            }
        }

        // MPS requires at least 2 packages
        if (shipment_type === "MPS" && normalizedPackages.length < 2) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Multi-Package Shipment requires at least 2 packages",
                },
                { status: 400 },
            );
        }

        /* -------------------- Fetch order -------------------- */
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { ok: false, error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.status !== "confirmed") {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Order not ready for shipment. Current status: ${order.status}`,
                },
                { status: 400 },
            );
        }

        /* -------------------- Idempotency -------------------- */
        const existingShipment = await prisma.shipment.findFirst({
            where: {
                orderId,
                isMaster: true,
                status: { not: "failed" },
            },
        });

        if (existingShipment) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Shipment already exists for this order",
                    existingWaybill: existingShipment.waybill,
                },
                { status: 409 },
            );
        }

        /* -------------------- Create Delhivery shipment -------------------- */
        if (shipment_type === "MPS") {
            return await handleMPSShipment(
                order,
                shipping_mode,
                normalizedPackages,
            );
        } else {
            return await handleSPSShipment(
                order,
                shipping_mode,
                normalizedPackages[0],
            );
        }
    } catch (err: any) {
        console.error("[create-shipment] Unexpected error:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Internal server error" },
            { status: 500 },
        );
    }
}

/* -------------------- MPS Handler -------------------- */
async function handleMPSShipment(
    order: any,
    shipping_mode: string,
    packages: PackageInput[],
) {
    const result = await createDelhiveryMPSShipment({
        order,
        shipping_mode,
        packages: packages.map((pkg) => ({
            dimensions: {
                length: Number(pkg.length),
                breadth: Number(pkg.breadth),
                height: Number(pkg.height),
            },
            weight: Number(pkg.weight),
            quantity: Number(pkg.quantity),
            products_desc: pkg.products_desc,
        })),
    });

    // 🔴 PROPER ERROR HANDLING - Don't save failed shipments
    if (!result.ok) {
        console.error("[create-shipment] MPS creation failed:", result.error);
        return NextResponse.json(
            {
                ok: false,
                error: result.error || "Delhivery MPS shipment failed",
                delhivery: result.raw,
            },
            { status: 500 },
        );
    }

    if (!result.masterWaybill) {
        return NextResponse.json(
            {
                ok: false,
                error: "No master waybill returned",
                delhivery: result.raw,
            },
            { status: 500 },
        );
    }

    /* -------------------- DB Transaction (MPS) -------------------- */
    try {
        await prisma.$transaction(async (tx) => {
            // Create master shipment record
            await tx.shipment.create({
                data: {
                    orderId: order.id,
                    provider: "DELHIVERY",
                    waybill: result.masterWaybill!,
                    trackingUrl: `https://www.delhivery.com/track/package/${result.masterWaybill}`,
                    status: "created",
                    attempts: 1,
                    shipmentType: "MPS",
                    isMaster: true,
                    childWaybills: result.childWaybills || [],
                    packageCount: packages.length,
                    rawResponse: result.raw,
                },
            });

            // Create child shipment records for tracking
            for (const childWaybill of result.childWaybills || []) {
                await tx.shipment.create({
                    data: {
                        orderId: order.id,
                        provider: "DELHIVERY",
                        waybill: childWaybill,
                        trackingUrl: `https://www.delhivery.com/track/package/${childWaybill}`,
                        status: "created",
                        attempts: 1,
                        shipmentType: "MPS",
                        isMaster: false,
                        masterWaybill: result.masterWaybill!,
                    },
                });
            }

            // Update order status
            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: "shipped",
                    trackingInfo: {
                        provider: "DELHIVERY",
                        shipmentType: "MPS",
                        masterWaybill: result.masterWaybill,
                        childWaybills: result.childWaybills,
                        packageCount: packages.length,
                        trackingUrl: `https://www.delhivery.com/track/package/${result.masterWaybill}`,
                    },
                },
            });
        });

        return NextResponse.json({
            ok: true,
            shipmentType: "MPS",
            masterWaybill: result.masterWaybill,
            childWaybills: result.childWaybills,
            packageCount: packages.length,
        });
    } catch (err: any) {
        // Handle duplicate waybill (unique constraint violation)
        if (err.code === "P2002") {
            console.warn(
                "[create-shipment] Duplicate MPS shipment prevented:",
                order.id,
            );
            return NextResponse.json(
                {
                    ok: false,
                    error: "Duplicate shipment detected",
                    reused: true,
                },
                { status: 409 },
            );
        }
        throw err;
    }
}

/* -------------------- SPS Handler -------------------- */
async function handleSPSShipment(
    order: any,
    shipping_mode: string,
    pkg: PackageInput,
) {
    const result = await createDelhiveryShipment({
        order,
        shipping_mode,
        dimensions: {
            length: Number(pkg.length),
            breadth: Number(pkg.breadth),
            height: Number(pkg.height),
        },
        weight: Number(pkg.weight),
        quantity: Number(pkg.quantity),
    });

    // 🔴 PROPER ERROR HANDLING - Don't save failed shipments
    if (!result.ok) {
        console.error("[create-shipment] SPS creation failed:", result.error);
        return NextResponse.json(
            {
                ok: false,
                error: result.error || "Delhivery shipment failed",
                delhivery: result.raw,
            },
            { status: 500 },
        );
    }

    if (!result.waybill) {
        return NextResponse.json(
            {
                ok: false,
                error: "No waybill returned",
                delhivery: result.raw,
            },
            { status: 500 },
        );
    }

    /* -------------------- DB Transaction (SPS) -------------------- */
    try {
        await prisma.$transaction(async (tx) => {
            await tx.shipment.create({
                data: {
                    orderId: order.id,
                    provider: "DELHIVERY",
                    waybill: result.waybill!,
                    trackingUrl: `https://www.delhivery.com/track/package/${result.waybill}`,
                    status: "created",
                    attempts: 1,
                    shipmentType: "SPS",
                    isMaster: true,
                    rawResponse: result.raw,
                },
            });

            await tx.order.update({
                where: { id: order.id },
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
            shipmentType: "SPS",
            waybill: result.waybill,
        });
    } catch (err: any) {
        // Handle duplicate waybill (unique constraint violation)
        if (err.code === "P2002") {
            console.warn(
                "[create-shipment] Duplicate shipment prevented:",
                order.id,
            );
            return NextResponse.json(
                {
                    ok: false,
                    error: "Duplicate shipment detected",
                    reused: true,
                },
                { status: 409 },
            );
        }
        throw err;
    }
}
