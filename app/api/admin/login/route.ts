import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const admin = await authenticateAdmin(email, password);

  if (admin) {
    const token = JSON.stringify(admin);
    const cookie = serialize("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } else {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
