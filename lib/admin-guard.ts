import "server-only";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { isSameOrigin, verifyAdminSession } from "@/lib/admin-session";

/**
 * In-handler admin check for route handlers (defence in depth: middleware
 * also gates /api/admin and /api/internal). Returns a 401 response to send
 * back, or null when the request has a verified same-origin admin session.
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const session = await verifyAdminSession(cookieStore.get("admin_token")?.value);
  if (!session || !isSameOrigin({ headers: headerStore })) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  return null;
}
