import { NextResponse } from "next/server";

// Retired: revealed whether any email has an account (account enumeration).
// Registration now learns this only after the email passes OTP verification.
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 410 });
}
