// /api/internal/calculate-shipping/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isAdminRequest } from "@/lib/admin-session";
import { DelhiveryQuoteError, getDelhiveryCharge } from "@/lib/shipping/delhiveryQuote";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // Used by signed-in checkout and the ops shipment dialog
    if (!(await isAdminRequest(req))) {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 },
            );
        }
    }

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

        const charge = await getDelhiveryCharge({
            shippingMode: shippingMode === "Surface" ? "Surface" : "Express",
            weight,
            length,
            breadth,
            height,
            originPincode,
            destinationPincode,
            paymentType,
        });
        return NextResponse.json({ ok: true, charge });
    } catch (err) {
        const message = err instanceof DelhiveryQuoteError ? err.message : "Failed to calculate shipping";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
