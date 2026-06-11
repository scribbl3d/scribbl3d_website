import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const searchField = searchParams.get("searchField") || "name";
        const searchTerm = searchParams.get("searchTerm") || "";
        const sort = searchParams.get("sort") || "";
        const page = Number.parseInt(searchParams.get("page") || "1");
        const limit = Number.parseInt(searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (searchTerm) {
            where[searchField] = {
                contains: searchTerm,
                mode: "insensitive",
            };
        }

        // Build orderBy clause
        let orderBy: any = { updatedAt: "desc" };
        if (sort) {
            const [field, direction] = sort.split("-");
            orderBy = { [field]: direction };
        }

        // Fetch filaments - optimized sequential queries
        const filaments = await prisma.filament.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                _count: {
                    select: { variants: true },
                },
            },
        });

        // Get total count separately to avoid connection pool exhaustion
        const total = await prisma.filament.count({ where });

        return NextResponse.json({
            filaments,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (error) {
        console.error("Error fetching filaments:", error);
        return NextResponse.json(
            { error: "Failed to fetch filaments" },
            { status: 500 }
        );
    }
}

// CREATE new filament
export async function POST(req: NextRequest) {
    try {
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

        // Create filament in transaction
        const newFilament = await prisma.$transaction(async (tx) => {
            // Create main filament
            const filament = await tx.filament.create({
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

            // Create variants
            if (variants.length > 0) {
                await tx.filamentVariant.createMany({
                    data: variants.map((v: any, index: number) => ({
                        filamentId: filament.id,
                        diameter: v.diameter,
                        spoolWeight: v.spoolWeight,
                        price: Number.parseInt(v.price),
                        originalPrice: v.originalPrice ? Number.parseInt(v.originalPrice) : undefined,
                        inStock: v.inStock !== false,
                        isDefault: v.isDefault || false,
                        displayOrder: index,
                    })),
                });
            }

            // Create specifications
            if (specifications.length > 0) {
                await tx.filamentSpecification.createMany({
                    data: specifications.map((s: any, index: number) => ({
                        filamentId: filament.id,
                        category: s.category,
                        key: s.key,
                        value: s.value,
                        displayOrder: index,
                    })),
                });
            }

            // Create downloads
            if (downloads.length > 0) {
                await tx.filamentDownload.createMany({
                    data: downloads.map((d: any, index: number) => ({
                        filamentId: filament.id,
                        title: d.title,
                        description: d.description || undefined,
                        fileUrl: d.fileUrl,
                        fileType: d.fileType || "PDF",
                        displayOrder: index,
                    })),
                });
            }

            // Create color group entry if material and finishType are provided
            if (material && finishType) {
                const groupCategory = `${material} ${finishType}`;
                
                // Check if this color group already exists for this filament
                const existingGroup = await tx.filamentColorGroup.findFirst({
                    where: {
                        filamentId: filament.id,
                        category: groupCategory,
                    },
                });

                if (!existingGroup) {
                    // Get the current max display order for this category
                    const maxOrder = await tx.filamentColorGroup.findFirst({
                        where: { category: groupCategory },
                        orderBy: { displayOrder: 'desc' },
                        select: { displayOrder: true },
                    });

                    await tx.filamentColorGroup.create({
                        data: {
                            filamentId: filament.id,
                            category: groupCategory,
                            material,
                            finishType,
                            displayOrder: (maxOrder?.displayOrder ?? -1) + 1,
                        },
                    });
                }
            }

            return filament;
        });

        return NextResponse.json(newFilament, { status: 201 });
    } catch (error) {
        console.error("Error creating filament:", error);
        return NextResponse.json(
            { error: "Failed to create filament" },
            { status: 500 }
        );
    }
}
