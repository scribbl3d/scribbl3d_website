import { NextResponse } from "next/server";

// Retired legacy status route (unauthenticated, polled PhonePe for minutes).
// Payment status is checked by the owner-gated /api/check-status/[transactionId].
export async function POST() {
    return NextResponse.json({ error: "Not found" }, { status: 410 });
}
