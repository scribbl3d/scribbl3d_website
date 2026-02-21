import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// --- CLOUDINARY CONFIGURATION (MATCHING YOUR ENV FILE) ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
type ProcessedImage = {
    url: string;
    altText: string | null;
    sortOrder: number;
};

type ProcessedColour = {
    name: string;
    hexCode: string | null;
    sortOrder: number;
    images: ProcessedImage[];
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const resin = await prisma.resin.findUnique({
            where: { id },
            include: {
                attributes: true,
                colours: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        images: { orderBy: { sortOrder: "asc" } },
                    },
                },
                weights: { orderBy: { sortOrder: "asc" } },
                specifications: { orderBy: { sortOrder: "asc" } },
                features: { orderBy: { sortOrder: "asc" } },
                applications: { orderBy: { sortOrder: "asc" } },
                compatibilities: { orderBy: { sortOrder: "asc" } },
                downloads: { orderBy: { sortOrder: "asc" } },
            },
        });

        if (!resin) {
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(resin);
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch resin" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Safety Check using CORRECT variables
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY
        ) {
            throw new Error("Cloudinary credentials missing in .env");
        }

        const { id } = await params;
        const formData = await req.formData();

        // 1. Basic Fields
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const brand = formData.get("brand") as string;
        const technology = formData.get("technology") as string;
        const resolution = JSON.parse(
            (formData.get("resolution") as string) || "[]"
        );
        const shortDescription = formData.get("shortDescription") as string;
        const description = formData.get("description") as string;

        // 2. Card Image Handling
        let cardImageUrl = (formData.get("cardImageUrl") as string) || null;
        const cardImageFile = formData.get("cardImageFile") as File;

        if (cardImageFile) {
            const buffer = Buffer.from(await cardImageFile.arrayBuffer());
            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        { folder: `resins/${slug}` },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    )
                    .end(buffer);
            });
            cardImageUrl = uploadResult.secure_url;
        }

        // 3. Parse JSON structures
        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]"
        );
        const weights = JSON.parse((formData.get("weights") as string) || "[]");
        const specifications = JSON.parse(
            (formData.get("specifications") as string) || "[]"
        );
        const features = JSON.parse(
            (formData.get("features") as string) || "[]"
        );
        const applications = JSON.parse(
            (formData.get("applications") as string) || "[]"
        );
        const compatibilities = JSON.parse(
            (formData.get("compatibilities") as string) || "[]"
        );
        const downloads = JSON.parse(
            (formData.get("downloads") as string) || "[]"
        );

        // 4. Handle Nested Images in Colours
        const rawColours = JSON.parse(
            (formData.get("colours") as string) || "[]"
        );
        const processedColours: ProcessedColour[] = [];

        for (const col of rawColours) {
            const processedImages: ProcessedImage[] = [];
            for (const img of col.images) {
                let imageUrl = img.url;
                if (img.uploadKey) {
                    const file = formData.get(img.uploadKey) as File;
                    if (file) {
                        const buffer = Buffer.from(await file.arrayBuffer());
                        const res: any = await new Promise(
                            (resolve, reject) => {
                                cloudinary.uploader
                                    .upload_stream(
                                        { folder: `resins/${slug}/gallery` },
                                        (error, result) => {
                                            if (error) reject(error);
                                            else resolve(result);
                                        }
                                    )
                                    .end(buffer);
                            }
                        );
                        imageUrl = res.secure_url;
                    }
                }
                processedImages.push({
                    url: imageUrl,
                    altText: null,
                    sortOrder: img.sortOrder,
                });
            }
            processedColours.push({
                name: col.name,
                hexCode: col.hexCode || null,
                sortOrder: col.sortOrder || 0,
                images: processedImages,
            });
        }

        // 5. Database Transaction
        await prisma.$transaction([
            prisma.resinAttribute.deleteMany({ where: { resinId: id } }),
            prisma.resinColour.deleteMany({ where: { resinId: id } }), // Cascades
            prisma.resinWeight.deleteMany({ where: { resinId: id } }),
            prisma.resinSpecification.deleteMany({ where: { resinId: id } }),
            prisma.resinFeature.deleteMany({ where: { resinId: id } }),
            prisma.resinApplication.deleteMany({ where: { resinId: id } }),
            prisma.resinCompatibility.deleteMany({ where: { resinId: id } }),
            prisma.resinDownload.deleteMany({ where: { resinId: id } }),
        ]);

        const resin = await prisma.resin.update({
            where: { id },
            data: {
                name,
                slug,
                brand,
                technology,
                resolution,
                shortDescription,
                description,
                cardImageUrl,

                attributes: {
                    create: attributes.map((a: any) => ({
                        label: a.label,
                        value: a.value,
                    })),
                },
                weights: {
                    create: weights.map((w: any, idx: number) => ({
                        weightInGrams: Number(w.weightInGrams),
                        price: Number(w.price),
                        originalPrice: w.originalPrice
                            ? Number(w.originalPrice)
                            : null,
                        discount:
                            w.originalPrice &&
                            Number(w.originalPrice) > Number(w.price)
                                ? Math.round(
                                      ((Number(w.originalPrice) -
                                          Number(w.price)) /
                                          Number(w.originalPrice)) *
                                          100
                                  )
                                : null,
                        sortOrder: idx,
                    })),
                },
                specifications: {
                    create: specifications.map((s: any, idx: number) => ({
                        category: s.category,
                        label: s.label,
                        value: s.value,
                        sortOrder: idx,
                    })),
                },
                features: {
                    create: features.map((f: any, idx: number) => ({
                        title: f.title,
                        sortOrder: idx,
                    })),
                },
                applications: {
                    create: applications.map((a: any, idx: number) => ({
                        name: a.name,
                        sortOrder: idx,
                    })),
                },
                compatibilities: {
                    create: compatibilities.map((c: any, idx: number) => ({
                        name: c.name,
                        sortOrder: idx,
                    })),
                },
                downloads: {
                    create: downloads.map((d: any, idx: number) => ({
                        title: d.title,
                        description: d.description || null,
                        downloadUrl: d.downloadUrl || null,
                        sortOrder: idx,
                    })),
                },
                colours: {
                    create: processedColours.map((c: any, idx: number) => ({
                        name: c.name,
                        hexCode: c.hexCode,
                        sortOrder: idx,
                        images: {
                            create: c.images.map((img: any, i: number) => ({
                                url: img.url,
                                sortOrder: i,
                            })),
                        },
                    })),
                },
            },
        });

        return NextResponse.json(resin);
    } catch (err: any) {
        console.error("Update resin failed:", err);
        return NextResponse.json(
            { error: err.message || "Failed to update resin" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch Resin to get images for cleanup
        const resin = await prisma.resin.findUnique({
            where: { id },
            include: {
                colours: {
                    include: { images: true },
                },
            },
        });

        if (!resin)
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 }
            );

        // 2. Clean up Cloudinary Images (Card Image)
        if (resin.cardImageUrl) {
            try {
                const publicId = resin.cardImageUrl
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .replace(/\.[^/.]+$/, "");
                await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.warn("Failed to delete card image", e);
            }
        }

        // 3. Clean up Gallery Images
        for (const col of resin.colours) {
            for (const img of col.images) {
                try {
                    const publicId = img.url
                        .split("/")
                        .slice(-2)
                        .join("/")
                        .replace(/\.[^/.]+$/, "");
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) {
                    console.warn("Failed to delete gallery image", e);
                }
            }
        }

        // 4. Delete Database Record
        await prisma.resin.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete failed:", err);
        return NextResponse.json(
            { error: "Failed to delete resin" },
            { status: 500 }
        );
    }
}
