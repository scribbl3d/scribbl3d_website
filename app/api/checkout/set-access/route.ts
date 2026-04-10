import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    
    // Set a cookie that allows access to checkout for 10 minutes
    cookieStore.set("checkout-access", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
    });

    return NextResponse.json({ success: true });
}
