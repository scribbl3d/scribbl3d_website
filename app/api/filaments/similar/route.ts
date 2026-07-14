import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const material = searchParams.get("material");
        const excludeId = searchParams.get("exclude");

        if (!material) {
            return NextResponse.json(
                { error: "Material parameter is required" },
                { status: 400 }
            );
        }

        // Fetch similar filaments with same material, excluding current one
        const filaments = await prisma.filament.findMany({
            where: {
                material,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: {
                id: true,
                slug: true,
                name: true,
                colorName: true,
                hexCode: true,
                material: true,
                finishType: true,
                images: true,
                shortDescription: true,
            },
            take: 8,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Get price from first variant for each filament
        const filamentsWithPrice = await Promise.all(
            filaments.map(async (filament) => {
                const firstVariant = await prisma.filamentVariant.findFirst({
                    where: { filamentId: filament.id, inStock: true },
                    orderBy: [{ isDefault: "desc" }, { price: "asc" }],
                });

                const price = firstVariant?.price || 0;
                const originalPrice = firstVariant?.originalPrice || null;
                const discount = originalPrice
                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                    : 0;

                return {
                    ...filament,
                    price,
                    originalPrice,
                    discount,
                };
            })
        );

        return NextResponse.json({ filaments: filamentsWithPrice });
    } catch (error) {
        console.error("Error fetching similar filaments:", error);
        return NextResponse.json(
            { error: "Failed to fetch similar filaments" },
            { status: 500 }
        );
    }
}
