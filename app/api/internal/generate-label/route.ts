//app/api/internal/generate-label/route.ts
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

/**
 * Generate label for single waybill or all waybills in MPS shipment
 *
 * Query params:
 * - waybill: Single waybill (works for both SPS and MPS)
 * - orderId: Generate labels for all packages in an order (MPS)
 * - all: If "true" with orderId, generates combined PDF for all packages
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const waybill = searchParams.get("waybill");
    const orderId = searchParams.get("orderId");
    const all = searchParams.get("all") === "true";

    // If orderId provided with all=true, generate labels for all packages
    if (orderId && all) {
        return handleMPSLabels(orderId);
    }

    // Single waybill label generation
    if (!waybill) {
        return NextResponse.json(
            { error: "waybill required" },
            { status: 400 },
        );
    }

    return generateSingleLabel(waybill);
}

/**
 * Generate label for a single waybill
 */
async function generateSingleLabel(waybill: string) {
    try {
        const delhiveryRes = await axios.get(
            `${getDelhiveryBaseUrl()}/api/p/packing_slip`,
            {
                params: {
                    wbns: waybill,
                    pdf: true,
                    pdf_size: "4R",
                },
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                },
            },
        );

        // 🔍 ADD THIS - Log full response
        console.log(
            "[LABEL DEBUG] Full Delhivery response:",
            JSON.stringify(delhiveryRes.data, null, 2),
        );

        const pkg = delhiveryRes.data?.packages?.[0];

        if (!pkg) {
            return NextResponse.json(
                { error: "No package data returned by Delhivery" },
                { status: 500 },
            );
        }

        // ✅ BEST CASE: redirect to S3 PDF
        if (pkg.pdf_download_link) {
            const pdfRes = await axios.get(pkg.pdf_download_link, {
                responseType: "arraybuffer",
            });

            await prisma.shipment.updateMany({
                where: { waybill },
                data: {
                    labelGenerated: true,
                    labelGeneratedAt: new Date(),
                },
            });

            return new Response(pdfRes.data, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
                },
            });
        }

        // 🔁 FALLBACK: base64 encoded PDF
        if (pkg.pdf_encoding) {
            const pdfBuffer = Buffer.from(pkg.pdf_encoding, "base64");

            await prisma.shipment.updateMany({
                where: { waybill },
                data: {
                    labelGenerated: true,
                    labelGeneratedAt: new Date(),
                },
            });

            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
                },
            });
        }

        return NextResponse.json(
            { error: "No label returned by Delhivery" },
            { status: 500 },
        );
    } catch (err: any) {
        console.error("Delhivery label error:", err?.response?.data || err);

        return NextResponse.json(
            { error: "Failed to generate label from Delhivery" },
            { status: 500 },
        );
    }
}

/**
 * Generate labels for all packages in an MPS order
 * Delhivery supports multiple waybills in a single request
 */
async function handleMPSLabels(orderId: string) {
    try {
        // Get all shipments for this order
        const shipments = await prisma.shipment.findMany({
            where: { orderId },
            select: {
                waybill: true,
                isMaster: true,
                shipmentType: true,
            },
            orderBy: { isMaster: "desc" }, // Master first
        });

        if (shipments.length === 0) {
            return NextResponse.json(
                { error: "No shipments found for this order" },
                { status: 404 },
            );
        }

        // Collect all waybills
        const waybills = shipments
            .map((s) => s.waybill)
            .filter((w): w is string => w !== null);

        if (waybills.length === 0) {
            return NextResponse.json(
                { error: "No waybills found" },
                { status: 404 },
            );
        }

        // Delhivery accepts comma-separated waybills
        const wbnsParam = waybills.join(",");

        console.log(
            `[GENERATE-LABEL] MPS labels for order ${orderId}:`,
            waybills,
        );

        const delhiveryRes = await axios.get(
            `${getDelhiveryBaseUrl()}/api/p/packing_slip`,
            {
                params: {
                    wbns: wbnsParam,
                    pdf: true,
                    pdf_size: "4R",
                },
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                },
            },
        );

        const packages = delhiveryRes.data?.packages || [];

        if (packages.length === 0) {
            return NextResponse.json(
                { error: "No package data returned by Delhivery" },
                { status: 500 },
            );
        }

        // If single combined PDF is available
        if (delhiveryRes.data?.pdf_download_link) {
            const pdfRes = await axios.get(
                delhiveryRes.data.pdf_download_link,
                {
                    responseType: "arraybuffer",
                },
            );

            // Mark all shipments as label generated
            await prisma.shipment.updateMany({
                where: { orderId },
                data: {
                    labelGenerated: true,
                    labelGeneratedAt: new Date(),
                },
            });

            return new Response(pdfRes.data, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="labels-${orderId}.pdf"`,
                },
            });
        }

        // If individual PDFs, try to get the first one's combined link
        // or return info about all packages
        const firstPkg = packages[0];

        if (firstPkg?.pdf_download_link) {
            // For MPS, Delhivery often returns a combined PDF when multiple wbns are requested
            const pdfRes = await axios.get(firstPkg.pdf_download_link, {
                responseType: "arraybuffer",
            });

            await prisma.shipment.updateMany({
                where: { orderId },
                data: {
                    labelGenerated: true,
                    labelGeneratedAt: new Date(),
                },
            });

            return new Response(pdfRes.data, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="labels-${orderId}.pdf"`,
                },
            });
        }

        // Fallback: Return JSON with individual label info
        return NextResponse.json({
            message: "Multiple labels available",
            packages: packages.map((pkg: any) => ({
                waybill: pkg.waybill,
                pdf_download_link: pkg.pdf_download_link,
                has_pdf: !!pkg.pdf_download_link || !!pkg.pdf_encoding,
            })),
        });
    } catch (err: any) {
        console.error("Delhivery MPS label error:", err?.response?.data || err);

        return NextResponse.json(
            { error: "Failed to generate MPS labels from Delhivery" },
            { status: 500 },
        );
    }
}

function getDelhiveryBaseUrl() {
    return "https://staging-express.delhivery.com";
}
