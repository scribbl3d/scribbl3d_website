import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long"
);

export async function createSession(payload: Record<string, unknown>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);

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
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as Record<string, unknown>;
  } catch (error) {
    console.error("Session verification failed:", error);
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
