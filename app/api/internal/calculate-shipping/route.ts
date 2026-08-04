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

        console.log("✅ [Delhivery API] Raw Response:", JSON.stringify(res.data, null, 2));
        console.log("📊 [Delhivery API] Response Status:", res.status);
        console.log("📋 [Delhivery API] Response Headers:", res.headers);
        
        const charge = Array.isArray(res.data) ? res.data[0] : res.data;

        console.log("💰 [Delhivery API] Extracted Charge:", {
            total_amount: charge?.total_amount,
            charge: charge?.charge,
            gross_amount: charge?.gross_amount,
            status: charge?.status,
        });

        if (!charge || (!charge.total_amount && !charge.charge)) {
            console.error("⚠️ [Delhivery API] No charge data in response");
            console.error("⚠️ [Delhivery API] Full response:", JSON.stringify(res.data, null, 2));
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
            statusText: err?.response?.statusText,
            headers: err?.response?.headers,
            config: {
                url: err?.config?.url,
                params: err?.config?.params,
            },
        });

        // Log if it's a timeout
        if (err.code === 'ECONNABORTED') {
            console.error("⏱️ [Delhivery API] Request timed out after 8 seconds");
        }

        // Log if it's a network error
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            console.error("🌐 [Delhivery API] Network error - cannot reach Delhivery servers");
        }

        // Log if it's an authentication error
        if (err?.response?.status === 401 || err?.response?.status === 403) {
            console.error("🔐 [Delhivery API] Authentication failed - check DELHIVERY_TOKEN");
        }

        return NextResponse.json(
            { ok: false, error: "Failed to calculate shipping", details: err.message },
            { status: 500 },
        );
    }
}
