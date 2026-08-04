// /api/internal/calculate-shipping/route.ts
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            shippingMode,
            weight,
            length,
            breadth,
            height,
            originPincode,
            destinationPincode,
            paymentType,
        } = body;

        if (!weight || !originPincode || !destinationPincode) {
            return NextResponse.json(
                { ok: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Check if DELHIVERY_TOKEN is set
        if (!process.env.DELHIVERY_TOKEN) {
            console.error("❌ DELHIVERY_TOKEN environment variable is not set!");
            return NextResponse.json(
                { ok: false, error: "Shipping service not configured" },
                { status: 500 },
            );
        }

        const md = shippingMode === "Surface" ? "S" : "E";

        console.log("🚚 [Delhivery API] Request:", {
            mode: shippingMode,
            weight: weight + "g",
            dimensions: `${length}x${breadth}x${height}cm`,
            from: originPincode,
            to: destinationPincode,
        });

        // ✅ USE PRODUCTION URL for Live API Token
        const res = await axios.get(
            "https://track.delhivery.com/api/kinko/v1/invoice/charges/.json",
            {
                params: {
                    md,
                    ss: "Delivered",
                    o_pin: originPincode,
                    d_pin: destinationPincode,
                    cgm: weight,
                    pt: paymentType,
                    l: length,
                    b: breadth,
                    h: height,
                },
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                },
                timeout: 8000,
            },
        );

        console.log("✅ [Delhivery API] Response:", res.data);
        const charge = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!charge || (!charge.total_amount && !charge.charge)) {
            console.error("⚠️ [Delhivery API] No charge data in response:", res.data);
            return NextResponse.json(
                { ok: false, error: "No shipping charge returned" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            ok: true,
            charge,
        });
    } catch (err: any) {
        console.error("❌ [Delhivery API] Error:", {
            message: err.message,
            response: err?.response?.data,
            status: err?.response?.status,
        });

        return NextResponse.json(
            { ok: false, error: "Failed to calculate shipping" },
            { status: 500 },
        );
    }
}
