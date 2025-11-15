import { NextResponse } from "next/server";
import {
  searchPincode,
  searchPincodesByCity,
  searchPincodesByState,
} from "@/lib/pincode-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    if (pincode) {
      const location = await searchPincode(pincode);
      if (!location) {
        return NextResponse.json(
          { error: "Pincode not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(location);
    }

    if (city) {
      const locations = await searchPincodesByCity(city);
      return NextResponse.json(locations);
    }

    if (state) {
      const locations = await searchPincodesByState(state);
      return NextResponse.json(locations);
    }

    return NextResponse.json(
      { error: "Please provide a search parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error searching pincodes:", error);
    return NextResponse.json(
      { error: "Failed to search pincodes" },
      { status: 500 }
    );
  }
}
