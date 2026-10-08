import { getToken } from "next-auth/jwt";
import { isSameOrigin, verifyAdminSession } from "@/lib/admin-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * /api/admin and /api/internal routes that do their own access checks
 * (public login/logout, customer-callable, or server-to-server).
 * Every other route under those prefixes requires a verified admin session.
 */
const SELF_CHECKED_API_ROUTES = [
    /^\/api\/admin\/login\/?$/,
    /^\/api\/admin\/logout\/?$/,
    /^\/api\/admin\/orders\/[^/]+\/cancel\/?$/, // admin or owning customer
    /^\/api\/internal\/cancel-shipment\/?$/, // owning customer
    /^\/api\/internal\/calculate-shipping\/?$/, // signed-in customer or admin
    /^\/api\/internal\/sync-shipment\/?$/, // internal token or admin
];

/**
 * Management endpoints outside /api/admin. Listed methods require a verified
 * admin session; other methods stay public (e.g. customer form submissions).
 */
const ADMIN_METHODS_OUTSIDE_ADMIN_API: {
    route: RegExp;
    methods: string[];
    when?: (request: NextRequest) => boolean;
}[] = [
    { route: /^\/api\/about-hero\/?$/, methods: ["POST", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/available-colors\/?$/, methods: ["POST", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/discounts\/?$/, methods: ["POST", "PUT", "PATCH", "DELETE"] },
    {
        route: /^\/api\/discounts\/?$/,
        methods: ["GET"],
        when: (request) => request.nextUrl.searchParams.get("admin") === "true",
    },
    { route: /^\/api\/discounts\/(?!apply\/?$)[^/]+\/?$/, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/partners\/?$/, methods: ["POST", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/partners\/[^/]+\/?$/, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    // Customer form submissions stay public (POST); listings expose customer data
    { route: /^\/api\/(form-responses|personalise-form|prototyping-request|small-batch-manufacturing)\/?$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/(form-responses|personalise-form|prototyping-request|small-batch-manufacturing)\/[^/]+\/?$/, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    // Customers subscribe with POST; listing and status changes are ops-only
    { route: /^\/api\/stock-notifications\/?$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
    { route: /^\/api\/upload\/?$/, methods: ["POST", "PUT", "PATCH", "DELETE"] },
];

function requiresAdminApiSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAdminApi =
        pathname.startsWith("/api/admin/") || pathname.startsWith("/api/internal/");
    if (isAdminApi) {
        return !SELF_CHECKED_API_ROUTES.some((route) => route.test(pathname));
    }
    return ADMIN_METHODS_OUTSIDE_ADMIN_API.some(
        (rule) =>
            rule.route.test(pathname) &&
            rule.methods.includes(request.method) &&
            (!rule.when || rule.when(request)),
    );
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (request.method !== "OPTIONS" && requiresAdminApiSession(request)) {
        const adminSession = await verifyAdminSession(
            request.cookies.get("admin_token")?.value,
        );
        if (!adminSession || !isSameOrigin(request)) {
            return NextResponse.json(
                { error: "Admin sign-in required" },
                { status: 401 },
            );
        }
    }

    if (pathname.startsWith("/api/internal/generate-label")) {
        return NextResponse.next();
    }

    const origin = request.headers.get("origin") || "";
    const response = NextResponse.next();

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

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: response.headers,
        });
    }

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

        if (!(await verifyAdminSession(adminToken))) {
            return NextResponse.redirect(
                new URL("/ops/control/login", request.url),
            );
        }
    }

    return response;
}

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
