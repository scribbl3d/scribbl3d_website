// PATH: app/api/stock-notifications/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email/index";
import { sanitizeWithLimit, sanitizeOptional, isRateLimited } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface ProductLookup {
    id: string;
    inStock: boolean;
    slug: string | null;
}

/* ============================================================================
   POST – Subscribe to stock notification
   Body: { productId, productName, productType, email, phone, name?,
           variantId?, variantLabel? }
   ============================================================================ */
export async function POST(request: NextRequest) {
    try {
        // Rate limit by IP
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(`stock:${ip}`, 10, 60_000)) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const body = await request.json();
        const {
            productId,
            productType,
            variantId,
        } = body;

        // Sanitize string inputs
        const productName = sanitizeWithLimit(body.productName, 300);
        const email = String(body.email || "").trim().toLowerCase();
        const phone = String(body.phone || "").trim();
        const name = sanitizeOptional(body.name, 200);
        const variantLabel = sanitizeOptional(body.variantLabel, 200);

        if (!productId || !productName || !email || !phone) {
            return NextResponse.json(
                {
                    error: "productId, productName, email and phone are required",
                },
                { status: 400 },
            );
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 },
            );
        }

        const phoneClean = phone.replace(/\D/g, "").slice(-10);
        if (phoneClean.length < 10) {
            return NextResponse.json(
                { error: "Invalid phone number (10 digits required)" },
                { status: 400 },
            );
        }

        const existing = await prisma.stockNotification.findFirst({
            where: {
                productId,
                email: email.toLowerCase().trim(),
                notified: false,
                variantId: variantId ?? null,
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
                variantId: variantId ?? null,
                variantLabel: variantLabel?.trim() || null,
                email: email.toLowerCase().trim(),
                phone: phoneClean,
                name: name?.trim() || null,
            },
        });

        // Fire-and-forget admin email notification
        console.log("[Admin Email] Attempting to send Stock Notification admin email...");
        sendAdminNotification({
            type: "stock-notification",
            details: {
                "Customer Name": name?.trim() || "—",
                "Customer Email": email || "—",
                "Customer Phone": phoneClean || "—",
                "Product Name": productName || "—",
                "Product Type": productType || "prebuilt",
                "Variant": variantLabel || "—",
            },
        }).then((res) => console.log("[Admin Email] Stock notification result:", JSON.stringify(res)))
          .catch((err) => console.error("[Admin Email] Stock notification email failed:", err));

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
   Query params: productId, productType, variantId, notified, page, limit
   ============================================================================ */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const productType = searchParams.get("productType");
        const variantId = searchParams.get("variantId");
        const notified = searchParams.get("notified");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: any = {};
        if (productId) where.productId = productId;
        if (productType) where.productType = productType;
        if (variantId) where.variantId = variantId;
        if (notified !== null && notified !== "")
            where.notified = notified === "true";

        const [notifications, totalCount] = await Promise.all([
            prisma.stockNotification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.stockNotification.count({ where }),
        ]);

        // ── Collect IDs per product type ──────────────────────────────────
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
        const resinIds = Array.from(
            new Set(
                notifications
                    .filter((n) => n.productType === "resin")
                    .map((n) => n.productId),
            ),
        );

        // ── Product-level stock lookup ────────────────────────────────────
        const [prebuiltRows, printerRows, resinRows] = await Promise.all([
            prebuiltIds.length > 0
                ? prisma.prebuiltProducts.findMany({
                      where: { id: { in: prebuiltIds } },
                      select: { id: true, inStock: true, slug: true },
                  })
                : [],
            printerIds.length > 0
                ? prisma.printer.findMany({
                      where: { id: { in: printerIds } },
                      select: { id: true, inStock: true, slug: true },
                  })
                : [],
            resinIds.length > 0
                ? prisma.resin.findMany({
                      where: { id: { in: resinIds } },
                      select: { id: true, inStock: true, slug: true },
                  })
                : [],
        ]);

        const prebuiltMap = new Map<string, ProductLookup>();
        const printerMap = new Map<string, ProductLookup>();
        const resinMap = new Map<string, ProductLookup>();
        prebuiltRows.forEach((p) => prebuiltMap.set(p.id, p as ProductLookup));
        printerRows.forEach((p) => printerMap.set(p.id, p as ProductLookup));
        resinRows.forEach((p) => resinMap.set(p.id, p as ProductLookup));

        // ── Variant-level stock lookup ────────────────────────────────────
        const prebuiltVariantIds = Array.from(
            new Set(
                notifications
                    .filter((n) => n.productType === "prebuilt" && n.variantId)
                    .map((n) => n.variantId as string),
            ),
        );
        const resinVariantIds = Array.from(
            new Set(
                notifications
                    .filter((n) => n.productType === "resin" && n.variantId)
                    .map((n) => n.variantId as string),
            ),
        );

        const [prebuiltVariantRows, resinColourRows, resinWeightRows] =
            await Promise.all([
                prebuiltVariantIds.length > 0
                    ? prisma.prebuiltVariants.findMany({
                          where: { id: { in: prebuiltVariantIds } },
                          select: { id: true, inStock: true },
                      })
                    : [],
                resinVariantIds.length > 0
                    ? prisma.resinColour.findMany({
                          where: { id: { in: resinVariantIds } },
                          select: { id: true, inStock: true },
                      })
                    : [],
                resinVariantIds.length > 0
                    ? prisma.resinWeight.findMany({
                          where: { id: { in: resinVariantIds } },
                          select: { id: true, inStock: true },
                      })
                    : [],
            ]);

        type VariantStock = { id: string; inStock: boolean };
        const prebuiltVariantMap = new Map<string, VariantStock>();
        const resinVariantMap = new Map<string, VariantStock>();
        prebuiltVariantRows.forEach((v) =>
            prebuiltVariantMap.set(v.id, { id: v.id, inStock: v.inStock }),
        );
        resinColourRows.forEach((v) =>
            resinVariantMap.set(v.id, { id: v.id, inStock: v.inStock }),
        );
        resinWeightRows.forEach((v) =>
            resinVariantMap.set(v.id, { id: v.id, inStock: v.inStock }),
        );

        // ── Enrich notifications ──────────────────────────────────────────
        const enriched = notifications.map((n) => {
            let productData: ProductLookup | undefined;
            if (n.productType === "printer")
                productData = printerMap.get(n.productId);
            else if (n.productType === "resin")
                productData = resinMap.get(n.productId);
            else productData = prebuiltMap.get(n.productId);

            let variantInStock: boolean | null = null;
            if (n.variantId) {
                if (n.productType === "prebuilt") {
                    variantInStock =
                        prebuiltVariantMap.get(n.variantId)?.inStock ?? null;
                } else if (n.productType === "resin") {
                    variantInStock =
                        resinVariantMap.get(n.variantId)?.inStock ?? null;
                }
            }

            return {
                ...n,
                currentInStock:
                    variantInStock !== null
                        ? variantInStock
                        : (productData?.inStock ?? null),
                productSlug: productData?.slug ?? null,
            };
        });

        return NextResponse.json({
            notifications: enriched,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
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
   Body: { notificationId } OR { productId } OR { variantId }
   ============================================================================ */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, notificationId, variantId } = body;

        if (notificationId) {
            await prisma.stockNotification.update({
                where: { id: notificationId },
                data: { notified: true, notifiedAt: new Date() },
            });
        } else if (variantId) {
            await prisma.stockNotification.updateMany({
                where: { variantId, notified: false },
                data: { notified: true, notifiedAt: new Date() },
            });
        } else if (productId) {
            await prisma.stockNotification.updateMany({
                where: { productId, notified: false },
                data: { notified: true, notifiedAt: new Date() },
            });
        } else {
            return NextResponse.json(
                { error: "productId, variantId, or notificationId required" },
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

/* ============================================================================
   DELETE – Delete a single notification by ID
   Query: ?id=<notificationId>
   ============================================================================ */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 },
            );
        }

        await prisma.stockNotification.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[STOCK_NOTIFICATION_DELETE]", error);
        return NextResponse.json(
            { error: "Failed to delete notification" },
            { status: 500 },
        );
    }
}
