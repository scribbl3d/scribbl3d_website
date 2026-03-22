import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [
            heroBanners,
            latestPrinters,
            latestFilaments,
            latestResins,
            latestPrebuilts,
            blogs,
        ] = await Promise.all([
            // Hero Banners
            prisma.heroBanner.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
            }),

            // New Arrivals — latest 4 from each table
            prisma.printer.findMany({
                where: { inStock: true },
                orderBy: { updatedAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    originalPrice: true,
                    shortDescription: true,
                    technology: true,
                    images: {
                        orderBy: { sortOrder: "asc" },
                        take: 1,
                        select: { url: true },
                    },
                    updatedAt: true,
                },
            }),

            prisma.product.findMany({
                orderBy: { updatedAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    name: true,

                    price: true,
                    originalPrice: true,

                    category: true,
                    images: true,
                    updatedAt: true,
                },
            }),

            prisma.resin.findMany({
                orderBy: { updatedAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    shortDescription: true,
                    cardImageUrl: true,
                    weights: {
                        orderBy: { sortOrder: "asc" },
                        take: 1,
                        select: { price: true, originalPrice: true },
                    },
                    updatedAt: true,
                },
            }),

            prisma.prebuiltProducts.findMany({
                orderBy: { updatedAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    name: true,
                    slug: true,

                    shortDescription: true,
                    category: true,
                    images: true,
                    updatedAt: true,
                },
            }),

            // Blogs for Learning Hub
            prisma.blog.findMany({
                orderBy: { createdAt: "desc" },
                take: 3,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    keywords: true,
                    thumbnailImage: true,
                    createdAt: true,
                },
            }),
        ]);

        // Normalize new arrivals into a single sorted array
        const newArrivals = [
            ...latestPrinters.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                originalPrice: p.originalPrice,
                description: p.shortDescription,
                image: p.images[0]?.url || null,
                type: "printer" as const,
                updatedAt: p.updatedAt,
                href: `/printers/${p.slug}`,
            })),
            ...latestFilaments.map((p) => ({
                id: p.id,
                name: p.name,

                price: p.price,
                originalPrice: p.originalPrice,

                image: p.images?.[0] || null,
                type: "filament" as const,
                updatedAt: p.updatedAt,
            })),
            ...latestResins.map((r) => ({
                id: r.id,
                name: r.name,
                slug: r.slug,
                price: r.weights[0]?.price || 0,
                originalPrice: r.weights[0]?.originalPrice || null,
                description: r.shortDescription,
                image: r.cardImageUrl,
                type: "resin" as const,
                updatedAt: r.updatedAt,
                href: `/resins/${r.slug}`,
            })),
            ...latestPrebuilts.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,

                description: p.shortDescription,

                type: "prebuilt" as const,
                updatedAt: p.updatedAt,
                href: `/products/${p.slug}`,
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
            )
            .slice(0, 4);

        return NextResponse.json({
            heroBanners,
            newArrivals,
            blogs,
        });
    } catch (error) {
        console.error("Landing page API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch landing page data" },
            { status: 500 },
        );
    }
}
