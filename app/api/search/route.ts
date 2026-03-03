import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        results: [],
        message: "No query provided",
      });
    }

    await prisma.$connect();

    const [products, prebuiltProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { color: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
        take: 5,
      }),
      prisma.prebuiltProducts.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          images: true,
        },
        take: 5,
      }),
    ]);

    const results = [
      ...products.map((p) => ({ ...p, type: "product" })),
      ...prebuiltProducts.map((p) => ({ ...p, type: "prebuilt" })),
    ];

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
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
