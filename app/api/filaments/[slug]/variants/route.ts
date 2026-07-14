import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Try to find by slug first, then by ID
        let filament = await prisma.filament.findUnique({
            where: { slug },
            select: { id: true },
        });

        // If not found by slug, try by ID
        if (!filament) {
            filament = await prisma.filament.findUnique({
                where: { id: slug },
                select: { id: true },
            });
        }

        if (!filament) {
            return NextResponse.json(
                { error: "Filament not found" },
                { status: 404 }
            );
        }

        const variants = await prisma.filamentVariant.findMany({
            where: { filamentId: filament.id },
            select: {
                id: true,
                diameter: true,
                spoolWeight: true,
                price: true,
                originalPrice: true,
                inStock: true,
            },
            orderBy: [
                { diameter: "asc" },
                { spoolWeight: "asc" },
            ],
        });

        return NextResponse.json({ variants });
    } catch (error) {
        console.error("[FILAMENT_VARIANTS_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch variants" },
            { status: 500 }
        );
    }
}
