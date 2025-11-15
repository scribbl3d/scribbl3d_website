import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    console.log("🔥 Middleware HIT:", request.nextUrl.pathname);

    const origin = request.headers.get("origin") || "";
    const response = NextResponse.next();

    // ----------------------------
    // 🔥 GLOBAL CORS CONFIGURATION
    // ----------------------------
    const allowedOrigins = ["http://localhost:3000", "https://scribbl3d.com"];

    if (allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Vary", "Origin");
    }

    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    // 🟡 Handle Preflight OPTIONS Requests
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: response.headers,
        });
    }

    // ----------------------------
    // 🛡️ AUTH + ADMIN LOGIC BELOW
    // ----------------------------
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const pathname = request.nextUrl.pathname;

    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isAuthPage) {
        if (token) {
            return NextResponse.redirect(new URL("/profile", request.url));
        }
        return response;
    }

    const isProtectedRoute =
        pathname.startsWith("/profile") || pathname.startsWith("/dashboard");

    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const adminToken = request.cookies.get("admin_token")?.value;

    if (isAdminRoute) {
        if (pathname === "/admin/login") {
            return response;
        }

        if (!adminToken) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return response;
}

// ----------------------------
// MATCHER (VERY IMPORTANT)
// ----------------------------
export const config = {
    matcher: [
        "/api/:path*", // ensures CORS runs for API (critical)
        "/profile/:path*",
        "/dashboard/:path*",
        "/login",
        "/register",
        "/admin/:path*",
    ],
};
