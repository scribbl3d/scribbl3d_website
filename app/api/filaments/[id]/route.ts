import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Try to fetch by ID first, then by slug
        let filament = await prisma.filament.findUnique({
            where: { id },
            include: {
                variants: {
                    orderBy: [
                        { isDefault: "desc" },
                        { price: "asc" },
                    ],
                },
                specifications: {
                    orderBy: { displayOrder: "asc" },
                },
                downloads: {
                    orderBy: { displayOrder: "asc" },
                },
                relatedColors: {
                    include: {
                        filament: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                colorName: true,
                                hexCode: true,
                                images: true,
                            },
                        },
                    },
                    orderBy: { displayOrder: "asc" },
                },
            },
        });

        // If not found by ID, try by slug
        if (!filament) {
            filament = await prisma.filament.findUnique({
                where: { slug: id },
                include: {
                    variants: {
                        orderBy: [
                            { isDefault: "desc" },
                            { price: "asc" },
                        ],
                    },
                    specifications: {
                        orderBy: { displayOrder: "asc" },
                    },
                    downloads: {
                        orderBy: { displayOrder: "asc" },
                    },
                    relatedColors: {
                        include: {
                            filament: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    colorName: true,
                                    hexCode: true,
                                    images: true,
                                },
                            },
                        },
                        orderBy: { displayOrder: "asc" },
                    },
                },
            });
        }

        if (!filament) {
            return NextResponse.json(
                { error: "Filament not found" },
                { status: 404 }
            );
        }

        // Group specifications by category
        const groupedSpecs = filament.specifications.reduce((acc, spec) => {
            if (!acc[spec.category]) {
                acc[spec.category] = [];
            }
            acc[spec.category].push({
                label: spec.key,
                value: spec.value,
            });
            return acc;
        }, {} as Record<string, Array<{ label: string; value: string }>>);

        // Get related colors (same material + finish)
        const relatedColors = filament.relatedColors.map(rc => rc.filament);

        // Transform data for frontend
        const transformedFilament = {
            id: filament.id,
            name: filament.name,
            slug: filament.slug,
            brand: filament.brand,
            material: filament.material,
            finishType: filament.finishType,
            category: filament.category,
            colorName: filament.colorName,
            hexCode: filament.hexCode,
            shortDescription: filament.shortDescription,
            longDescription: filament.longDescription,
            images: filament.images,
            features: filament.features,
            applications: filament.applications,
            compatibility: filament.compatibility,
            inStock: filament.inStock,
            createdAt: filament.createdAt,
            updatedAt: filament.updatedAt,
            // Variants
            variants: filament.variants,
            // Specifications grouped by category
            specs: groupedSpecs,
            // Downloads
            downloads: filament.downloads.map(d => ({
                id: d.id,
                title: d.title,
                description: d.description,
                downloadUrl: d.fileUrl,
                fileType: d.fileType,
            })),
            // Related colors
            colours: relatedColors.map(c => ({
                id: c.id,
                name: c.colorName,
                hex: c.hexCode,
                slug: c.slug,
                image: c.images[0] || null,
            })),
        };

        return NextResponse.json(transformedFilament);
    } catch (error) {
        console.error("Error fetching filament:", error);
        return NextResponse.json(
            { error: "Failed to fetch filament" },
            { status: 500 }
        );
    }
}
