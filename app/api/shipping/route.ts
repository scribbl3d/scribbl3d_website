import { NextResponse } from "next/server";
import { calculateShippingTime } from "@/lib/shipping-calculator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json(
        { error: "Pincode is required" },
        { status: 400 }
      );
    }

    const shippingInfo = await calculateShippingTime(pincode);
    return NextResponse.json(shippingInfo);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping time" },
      { status: 500 }
    );
  }
}
