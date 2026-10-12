import { NextResponse } from "next/server";

// Retired: changed the account email without verifying the new address,
// which allowed account takeover. Not used by the site.
export async function POST() {
  return NextResponse.json({ error: "Email changes are not available" }, { status: 410 });
}
