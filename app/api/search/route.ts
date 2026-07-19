import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        results: [],
        count: 0,
        message: "No query provided",
      });
    }

    await prisma.$connect();

    const [products, prebuiltProducts, resins, printers, filaments] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { color: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          category: true,
          color: true,
        },
        take: 5,
      }),
      prisma.prebuiltProducts.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          images: { where: { isMain: true }, select: { url: true }, take: 1 },
          variants: {
            where: { isActive: true },
            select: { price: true },
            take: 1,
            orderBy: { price: "asc" },
          },
        },
        take: 5,
      }),
      prisma.resin.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { technology: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          technology: true,
          cardImageUrl: true,
          weights: {
            select: { price: true },
            take: 1,
            orderBy: { price: "asc" },
          },
        },
        take: 5,
      }),
      prisma.printer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { technology: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          technology: true,
          images: { where: { isMain: true }, select: { url: true }, take: 1 },
        },
        take: 5,
      }),
      prisma.filament.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { material: { contains: query, mode: "insensitive" } },
            { colorName: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          material: true,
          colorName: true,
          images: true,
          variants: {
            select: { price: true },
            take: 1,
            orderBy: { price: "asc" },
          },
        },
        take: 5,
      }),
    ]);

    const results = [
      ...products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0] || null,
        subtitle: [p.category, p.color].filter(Boolean).join(" · "),
        href: `/products/${p.id}`,
        type: "product" as const,
      })),
      ...prebuiltProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.variants[0]?.price ?? null,
        image: p.images[0]?.url || null,
        subtitle: p.category,
        href: `/prebuilt-products/${p.slug || p.id}`,
        type: "prebuilt" as const,
      })),
      ...resins.map((r) => ({
        id: r.id,
        name: r.name,
        price: r.weights[0]?.price ?? null,
        image: r.cardImageUrl || null,
        subtitle: [r.brand, r.technology].filter(Boolean).join(" · "),
        href: `/resins/${r.slug}`,
        type: "resin" as const,
      })),
      ...printers.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0]?.url || null,
        subtitle: [p.brand, p.technology].filter(Boolean).join(" · "),
        href: `/printers/${p.slug}`,
        type: "printer" as const,
      })),
      ...filaments.map((f) => ({
        id: f.id,
        name: f.name,
        price: f.variants[0]?.price ?? null,
        image: f.images?.[0] || null,
        subtitle: [f.brand, f.material, f.colorName].filter(Boolean).join(" · "),
        href: `/filament/${f.slug || f.id}`,
        type: "filament" as const,
      })),
    ];

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Search error:", errorMessage);
    return NextResponse.json(
      {
        error: true,
        message: "Failed to perform search",
        details: errorMessage,
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
