import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Clear the session cookie
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": `next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`,
      },
    }
  );
}
