import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: { "Set-Cookie": cookie },
    }
  );
}
