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

        const md = shippingMode === "Surface" ? "S" : "E";

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
        console.log("Shipping kharcha", res.data);
        const charge = Array.isArray(res.data) ? res.data[0] : res.data;

        return NextResponse.json({
            ok: true,
            charge,
        });
    } catch (err: any) {
        console.error("Shipping charge error", err?.response?.data || err);

        return NextResponse.json(
            { ok: false, error: "Failed to calculate shipping" },
            { status: 500 },
        );
    }
}
