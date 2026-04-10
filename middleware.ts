import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 🚨 BYPASS middleware for PDF label generation
    if (pathname.startsWith("/api/internal/generate-label")) {
        return NextResponse.next();
    }

    console.log("🔥 Middleware HIT:", pathname);

    const origin = request.headers.get("origin") || "";
    const response = NextResponse.next();

    // ----------------------------
    // 🔥 GLOBAL CORS CONFIGURATION
    // ----------------------------
    const allowedOrigins = [
        "http://localhost:3000",
        "https://scribbl3d.com",
        "https://scribbl3d-website.vercel.app",
    ];

    if (allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Vary", "Origin");
    }

    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
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

    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isAuthPage) {
        if (token) {
            return NextResponse.redirect(new URL("/profile", request.url));
        }
        return response;
    }

    const isProtectedRoute =
        pathname.startsWith("/profile") || pathname.startsWith("/dashboard") || pathname.startsWith("/checkout");

    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Special validation for /checkout: must come from /cart
    if (pathname.startsWith("/checkout") && token) {
        const referer = request.headers.get("referer") || "";
        const fromCart = request.cookies.get("checkout-access")?.value;
        
        // Allow if coming from cart or has valid checkout access cookie
        if (!fromCart && !referer.includes("/cart")) {
            return NextResponse.redirect(new URL("/cart", request.url));
        }
    }

    // Add cache control headers for protected routes
    if (isProtectedRoute && token) {
        response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
    }

    const isAdminRoute = pathname.startsWith("/ops/control");
    const adminToken = request.cookies.get("admin_token")?.value;

    if (isAdminRoute) {
        if (pathname === "/ops/control/login") {
            return response;
        }

        if (!adminToken) {
            return NextResponse.redirect(
                new URL("/ops/control/login", request.url),
            );
        }
    }

    return response;
}

// ----------------------------
// MATCHER (VERY IMPORTANT)
// ----------------------------
export const config = {
    matcher: [
        "/api/:path*",
        "/profile/:path*",
        "/dashboard/:path*",
        "/checkout/:path*",
        "/login",
        "/register",
        "/ops/control/:path*",
    ],
};
