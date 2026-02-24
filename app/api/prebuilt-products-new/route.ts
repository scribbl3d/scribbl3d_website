import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get("category");

        // Construct the where clause based on whether a category is provided
        const whereClause = categorySlug
            ? {
                  category: {
                      // Converts 'articulated-models' back to 'Articulated Models'
                      // and performs a case-insensitive match
                      equals: categorySlug.replace(/-/g, " "),
                      mode: "insensitive" as const,
                  },
              }
            : {};

        const products = await prisma.prebuiltProductRiya.findMany({
            where: whereClause,
            include: {
                images: {
                    orderBy: {
                        position: "asc",
                    },
                },
                attributes: true,
                variants: {
                    where: {
                        isActive: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Always return an array (even if empty) to prevent .map() errors on frontend
        return NextResponse.json(products || []);
    } catch (error) {
        console.error("Error fetching prebuilt products:", error);
        // Returning an empty array instead of an error object prevents frontend crashes
        return NextResponse.json([], { status: 500 });
    }
}
