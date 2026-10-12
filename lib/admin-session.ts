import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const issuer = "scribbl3d-admin";
const audience = "scribbl3d-operations";

const encoder = new TextEncoder();

// ADMIN_SESSION_SECRET when set; otherwise a key derived from NEXTAUTH_SECRET
// (HMAC with a fixed label), so admin tokens never use the raw customer-auth
// secret. Web Crypto, because middleware runs on the Edge runtime.
async function signingKey(): Promise<Uint8Array> {
  const dedicated = process.env.ADMIN_SESSION_SECRET;
  if (dedicated) {
    if (dedicated.length < 32) throw new Error("Admin session signing is not configured");
    return encoder.encode(dedicated);
  }
  const base = process.env.NEXTAUTH_SECRET;
  if (!base) throw new Error("Admin session signing is not configured");
  const hmac = await crypto.subtle.importKey("raw", encoder.encode(base), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", hmac, encoder.encode("scribbl3d-admin-session")));
}

export async function createAdminSession(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(await signingKey());
}

export async function verifyAdminSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await signingKey(), {
      algorithms: ["HS256"], issuer, audience, maxTokenAge: "1h",
    });
    if (payload.role !== "admin" || typeof payload.email !== "string" || !payload.email || !payload.exp) return null;
    return { email: payload.email, role: "admin" as const };
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Pick<Request, "headers">) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: NextRequest) {
  return isSameOrigin(request) && !!(await verifyAdminSession(request.cookies.get("admin_token")?.value));
}
