import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/auth";
import { createAdminSession, isSameOrigin } from "@/lib/admin-session";
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from "@/lib/login-rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const rateLimitKey = `admin:${email.toLowerCase()}`;
  if (!checkLoginAttempts(rateLimitKey).allowed) {
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
  }
  const admin = await authenticateAdmin(email, password);
  if (!admin) {
    recordFailedLogin(rateLimitKey);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  try {
    const token = await createAdminSession(admin.email);
    const cookie = serialize("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    });
    resetLoginAttempts(rateLimitKey);
    return NextResponse.json({ success: true }, { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Admin sign-in is unavailable. Please check server configuration." }, { status: 503 });
  }
}
