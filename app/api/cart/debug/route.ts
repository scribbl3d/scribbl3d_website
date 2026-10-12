import { NextResponse } from "next/server";

// Retired temporary diagnostics route (exposed raw cart rows).
export async function GET() {
    return NextResponse.json({ error: "Not found" }, { status: 410 });
}
