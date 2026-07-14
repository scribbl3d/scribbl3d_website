import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// GET single filament by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const filament = await prisma.filament.findUnique({
            where: { id },
            include: {
                variants: {
                    orderBy: { displayOrder: "asc" },
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
                                colorName: true,
                                hexCode: true,
                            },
                        },
                    },
                },
            },
        });

        if (!filament) {
            return NextResponse.json(
                { error: "Filament not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(filament);
    } catch (error) {
        console.error("Error fetching filament:", error);
        return NextResponse.json(
            { error: "Failed to fetch filament" },
            { status: 500 }
        );
    }
}

// UPDATE filament
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();

        // Parse basic fields
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string | null;
        const shortDescription = formData.get("shortDescription") as string | null;
        const longDescription = formData.get("longDescription") as string | null;
        const material = formData.get("material") as string | null;
        const finishType = formData.get("finishType") as string | null;
        const brand = formData.get("brand") as string | null;
        const category = formData.get("category") as string | null;
        const colorName = formData.get("colorName") as string | null;
        const hexCode = formData.get("hexCode") as string | null;
        const inStock = formData.get("inStock") === "true";

        // Parse arrays
        const existingImages = JSON.parse(formData.get("images") as string || "[]");
        const features = JSON.parse(formData.get("features") as string || "[]");
        const applications = JSON.parse(formData.get("applications") as string || "[]");
        const compatibility = JSON.parse(formData.get("compatibility") as string || "[]");

        // Handle new image uploads
        const newImageFiles = formData.getAll("newImages") as File[];
        const uploadedNewImages: string[] = await Promise.all(
            newImageFiles.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                
                const uploadResult: any = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: `filaments/${slug || name.toLowerCase().replace(/\s+/g, '-')}`,
                            resource_type: "image",
                            transformation: [
                                {
                                    width: 1600,
                                    height: 1600,
                                    crop: "pad",
                                    background: "white",
                                    quality: "auto:good",
                                    fetch_format: "auto",
                                },
                            ],
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(buffer);
                });

                return uploadResult.secure_url;
            })
        );

        // Combine existing and new images
        const images = [...existingImages, ...uploadedNewImages];

        // Parse variants
        const variants = JSON.parse(formData.get("variants") as string || "[]");
        
        // Parse specifications
        const specifications = JSON.parse(formData.get("specifications") as string || "[]");
        
        // Parse downloads
        const downloads = JSON.parse(formData.get("downloads") as string || "[]");

        // Update filament in transaction
        const updatedFilament = await prisma.$transaction(async (tx) => {
            // Update main filament
            const filament = await tx.filament.update({
                where: { id },
                data: {
                    name,
                    ...(slug && { slug }),
                    ...(shortDescription && { shortDescription }),
                    ...(longDescription && { longDescription }),
                    ...(material && { material }),
                    ...(finishType && { finishType }),
                    ...(brand && { brand }),
                    ...(category && { category }),
                    ...(colorName && { colorName }),
                    ...(hexCode && { hexCode }),
                    images,
                    features,
                    applications,
                    compatibility,
                    inStock,
                },
            });

            // Update or create variants (preserve IDs to avoid breaking cart references)
            const existingVariants = await tx.filamentVariant.findMany({
                where: { filamentId: id },
            });

            // Create a map of existing variants by diameter+spoolWeight
            const existingMap = new Map(
                existingVariants.map(v => [`${v.diameter}-${v.spoolWeight}`, v])
            );

            // Track which variants we're keeping
            const variantsToKeep = new Set<string>();

            // Upsert each variant
            for (let index = 0; index < variants.length; index++) {
                const v = variants[index];
                const key = `${v.diameter}-${v.spoolWeight}`;
                variantsToKeep.add(key);
                
                const existing = existingMap.get(key);
                
                if (existing) {
                    // Update existing variant (preserves ID and cart references)
                    await tx.filamentVariant.update({
                        where: { id: existing.id },
                        data: {
                            price: parseInt(v.price),
                            originalPrice: v.originalPrice ? parseInt(v.originalPrice) : null,
                            inStock: v.inStock !== false,
                            isDefault: v.isDefault || false,
                            displayOrder: index,
                        },
                    });
                } else {
                    // Create new variant
                    await tx.filamentVariant.create({
                        data: {
                            filamentId: id,
                            diameter: v.diameter,
                            spoolWeight: v.spoolWeight,
                            price: parseInt(v.price),
                            originalPrice: v.originalPrice ? parseInt(v.originalPrice) : null,
                            inStock: v.inStock !== false,
                            isDefault: v.isDefault || false,
                            displayOrder: index,
                        },
                    });
                }
            }

            // Delete variants that are no longer in the list
            const variantsToDelete = existingVariants.filter(
                v => !variantsToKeep.has(`${v.diameter}-${v.spoolWeight}`)
            );
            if (variantsToDelete.length > 0) {
                await tx.filamentVariant.deleteMany({
                    where: {
                        id: { in: variantsToDelete.map(v => v.id) },
                    },
                });
            }

            // Delete existing specifications and create new ones
            await tx.filamentSpecification.deleteMany({ where: { filamentId: id } });
            if (specifications.length > 0) {
                await tx.filamentSpecification.createMany({
                    data: specifications.map((s: any, index: number) => ({
                        filamentId: id,
                        category: s.category,
                        key: s.key,
                        value: s.value,
                        displayOrder: index,
                    })),
                });
            }

            // Delete existing downloads and create new ones
            await tx.filamentDownload.deleteMany({ where: { filamentId: id } });
            if (downloads.length > 0) {
                await tx.filamentDownload.createMany({
                    data: downloads.map((d: any, index: number) => ({
                        filamentId: id,
                        title: d.title,
                        description: d.description || undefined,
                        fileUrl: d.fileUrl,
                        fileType: d.fileType || "PDF",
                        displayOrder: index,
                    })),
                });
            }

            // Update color group if material or finishType changed
            if (material && finishType) {
                const groupCategory = `${material} ${finishType}`;
                
                // Delete old color group entries for this filament
                await tx.filamentColorGroup.deleteMany({
                    where: { filamentId: id },
                });

                // Get the current max display order for this category
                const maxOrder = await tx.filamentColorGroup.findFirst({
                    where: { category: groupCategory },
                    orderBy: { displayOrder: 'desc' },
                    select: { displayOrder: true },
                });

                // Create new color group entry
                await tx.filamentColorGroup.create({
                    data: {
                        filamentId: id,
                        category: groupCategory,
                        material,
                        finishType,
                        displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
                    },
                });
            }

            return filament;
        });

        return NextResponse.json(updatedFilament);
    } catch (error) {
        console.error("Error updating filament:", error);
        return NextResponse.json(
            { error: "Failed to update filament" },
            { status: 500 }
        );
    }
}

// DELETE filament
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.filament.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting filament:", error);
        return NextResponse.json(
            { error: "Failed to delete filament" },
            { status: 500 }
        );
    }
}
