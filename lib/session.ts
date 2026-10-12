import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// Legacy session module. No fallback secret: without JWT_SECRET, sessions
// cannot be created and every token is rejected (fail closed).
function secretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  return secret ? new TextEncoder().encode(secret) : null;
}

export async function createSession(payload: Record<string, unknown>) {
  const key = secretKey();
  if (!key) throw new Error("Session signing is not configured");
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const key = secretKey();
  if (!token || !key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as Record<string, unknown>;
  } catch (error) {
    console.error("Session verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function updateSession(payload: Record<string, unknown>) {
  return createSession(payload);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
