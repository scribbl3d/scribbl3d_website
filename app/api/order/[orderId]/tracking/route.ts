// app/api/order/[orderId]/tracking/route.ts
import { fetchDelhiveryWaybill } from "@/lib/delhivery-track";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;
        if (!orderId)
            return NextResponse.json(
                { ok: false, message: "orderId required" },
                { status: 400 }
            );

        // Find shipment by orderId
        const shipment = await prisma.shipment.findUnique({
            where: { orderId },
        });

        if (!shipment) {
            return NextResponse.json(
                { ok: false, message: "No shipment found", status: 404 },
                { status: 404 }
            );
        }

        // Build cleanedFromDB based on what we store in trackingInfo
        const cleanedFromDB = {
            waybill:
                shipment.waybill ||
                (shipment.rawResponse && shipment.rawResponse.waybill) ||
                null,
            provider: shipment.provider || "UNKNOWN",
            status:
                shipment.status ||
                (shipment.rawResponse?.success ? "created" : "unknown"),
            trackingUrl: shipment.trackingUrl || null,
            lastUpdated: shipment.updatedAt,
        };

        // If we have a waybill and we're in live/staging mode (not mock), call provider
        const isMock =
            process.env.DELHIVERY_MOCK_MODE === "true" ||
            !process.env.DELHIVERY_API_TOKEN;
        let providerResult = null;
        if (!isMock && cleanedFromDB.waybill) {
            providerResult = await fetchDelhiveryWaybill(cleanedFromDB.waybill);
        }

        // Compose response (Format B: cleaned + raw)
        const response = {
            ok: true,
            cleaned: {
                ...cleanedFromDB,
                // If provider gave a cleaned status, override DB status (fresh)
                ...(providerResult?.ok ? providerResult.cleaned : {}),
            },
            raw: providerResult?.ok
                ? providerResult.raw
                : (shipment.rawResponse ?? null),
        };

        return NextResponse.json(response);
    } catch (err: any) {
        console.error("TRACKING ROUTE ERROR:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
