import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const issuer = "scribbl3d-admin";
const audience = "scribbl3d-operations";

function signingKey() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Admin session signing is not configured");
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(signingKey());
}

export async function verifyAdminSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), {
      algorithms: ["HS256"], issuer, audience, maxTokenAge: "1h",
    });
    if (payload.role !== "admin" || typeof payload.email !== "string" || !payload.email || !payload.exp) return null;
    return { email: payload.email, role: "admin" as const };
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function isAdminRequest(request: NextRequest) {
  return isSameOrigin(request) && !!(await verifyAdminSession(request.cookies.get("admin_token")?.value));
}
