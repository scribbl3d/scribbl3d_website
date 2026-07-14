import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetch all unique values from the database
        const [filaments, variants] = await Promise.all([
            prisma.filament.findMany({
                select: {
                    material: true,
                    finishType: true,
                    brand: true,
                    compatibility: true,
                },
            }),
            prisma.filamentVariant.findMany({
                select: {
                    diameter: true,
                    spoolWeight: true,
                    price: true,
                },
            }),
        ]);

        // Extract unique values
        const materials = Array.from(new Set(filaments.map((f) => f.material).filter(Boolean))).sort();
        const finishTypes = Array.from(new Set(filaments.map((f) => f.finishType).filter(Boolean))).sort();
        const brands = Array.from(new Set(filaments.map((f) => f.brand).filter(Boolean))).sort();
        
        // Flatten compatibility arrays and get unique values
        const printerCompatibility = Array.from(
            new Set(
                filaments
                    .flatMap((f) => f.compatibility || [])
                    .filter(Boolean)
            )
        ).sort();

        // Get unique diameters and spool weights
        const diameters = Array.from(new Set(variants.map((v) => v.diameter).filter(Boolean))).sort();
        const spoolWeights = Array.from(new Set(variants.map((v) => v.spoolWeight).filter(Boolean))).sort();

        // Calculate price range
        const prices = variants.map((v) => v.price).filter(Boolean);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

        return NextResponse.json({
            materials,
            finishTypes,
            brands,
            printerCompatibility,
            diameters,
            spoolWeights,
            priceRange: {
                min: Math.floor(minPrice / 100) * 100, // Round down to nearest 100
                max: Math.ceil(maxPrice / 100) * 100,  // Round up to nearest 100
            },
        });
    } catch (error) {
        console.error("[FILAMENT_FILTERS_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch filter options" },
            { status: 500 }
        );
    }
}
