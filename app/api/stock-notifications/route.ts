// PATH: app/api/stock-notifications/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ProductLookup {
    id: string;
    inStock: boolean;
    slug: string | null;
}

/* ============================================================================
   POST – Subscribe to stock notification
   ============================================================================ */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, productName, productType, email, phone, name } =
            body;

        if (!productId || !productName || !email || !phone) {
            return NextResponse.json(
                {
                    error: "productId, productName, email and phone are required",
                },
                { status: 400 },
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 },
            );
        }

        const phoneClean = phone.replace(/\D/g, "");
        if (phoneClean.length < 10) {
            return NextResponse.json(
                { error: "Invalid phone number" },
                { status: 400 },
            );
        }

        const existing = await prisma.stockNotification.findFirst({
            where: {
                productId,
                email: email.toLowerCase().trim(),
                notified: false,
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: "Already subscribed", alreadyExists: true },
                { status: 200 },
            );
        }

        const notification = await prisma.stockNotification.create({
            data: {
                productId,
                productName,
                productType: productType ?? "prebuilt",
                email: email.toLowerCase().trim(),
                phone: phoneClean,
                name: name?.trim() || null,
            },
        });

        return NextResponse.json(
            { success: true, notification },
            { status: 201 },
        );
    } catch (error) {
        console.error("[STOCK_NOTIFICATION_POST]", error);
        return NextResponse.json(
            { error: "Failed to save notification request" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   GET – Admin: list all notifications with live stock status
   Query params: productId, productType ("prebuilt" | "printer"), notified
   ============================================================================ */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const productType = searchParams.get("productType");
        const notified = searchParams.get("notified");

        const where: any = {};
        if (productId) where.productId = productId;
        if (productType) where.productType = productType;
        if (notified !== null) where.notified = notified === "true";

        const notifications = await prisma.stockNotification.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        // Collect unique IDs per type
        const prebuiltIds = Array.from(
            new Set(
                notifications
                    .filter((n) => n.productType === "prebuilt")
                    .map((n) => n.productId),
            ),
        );

        const printerIds = Array.from(
            new Set(
                notifications
                    .filter((n) => n.productType === "printer")
                    .map((n) => n.productId),
            ),
        );

        // Fetch live stock status from both tables separately (avoids Promise.all type inference issues)
        const prebuiltRows: ProductLookup[] =
            prebuiltIds.length > 0
                ? await prisma.prebuiltProducts.findMany({
                      where: { id: { in: prebuiltIds } },
                      select: { id: true, inStock: true, slug: true },
                  })
                : [];

        const printerRows: ProductLookup[] =
            printerIds.length > 0
                ? await prisma.printer.findMany({
                      where: { id: { in: printerIds } },
                      select: { id: true, inStock: true, slug: true },
                  })
                : [];

        // Build lookup maps
        const prebuiltMap = new Map<string, ProductLookup>(
            prebuiltRows.map((p) => [p.id, p]),
        );
        const printerMap = new Map<string, ProductLookup>(
            printerRows.map((p) => [p.id, p]),
        );

        // Enrich each notification with live stock info
        const enriched = notifications.map((n) => {
            const productData =
                n.productType === "printer"
                    ? printerMap.get(n.productId)
                    : prebuiltMap.get(n.productId);

            return {
                ...n,
                currentInStock: productData?.inStock ?? null,
                productSlug: productData?.slug ?? null,
            };
        });

        return NextResponse.json({ notifications: enriched });
    } catch (error) {
        console.error("[STOCK_NOTIFICATION_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   PATCH – Mark notification(s) as notified
   Body: { notificationId } OR { productId }
   ============================================================================ */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, notificationId } = body;

        if (notificationId) {
            await prisma.stockNotification.update({
                where: { id: notificationId },
                data: { notified: true, notifiedAt: new Date() },
            });
        } else if (productId) {
            await prisma.stockNotification.updateMany({
                where: { productId, notified: false },
                data: { notified: true, notifiedAt: new Date() },
            });
        } else {
            return NextResponse.json(
                { error: "productId or notificationId required" },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[STOCK_NOTIFICATION_PATCH]", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 },
        );
    }
}
