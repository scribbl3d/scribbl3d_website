// app/api/admin/resins/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
    inStock: boolean;
    images: ProcessedImage[];
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const resin = await prisma.resin.findUnique({
            where: { id },
            include: {
                attributes: true,
                colours: {
                    orderBy: { sortOrder: "asc" },
                    include: { images: { orderBy: { sortOrder: "asc" } } },
                },
                weights: { orderBy: { sortOrder: "asc" } },
                specifications: { orderBy: { sortOrder: "asc" } },
                features: { orderBy: { sortOrder: "asc" } },
                applications: { orderBy: { sortOrder: "asc" } },
                compatibilities: { orderBy: { sortOrder: "asc" } },
                downloads: { orderBy: { sortOrder: "asc" } },
            },
        });

        if (!resin)
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 },
            );
        return NextResponse.json(resin);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resin" },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY
        ) {
            throw new Error("Cloudinary credentials missing in .env");
        }

        const { id } = await params;
        const formData = await req.formData();

        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const brand = formData.get("brand") as string;
        const technology = formData.get("technology") as string;
        const resolution = JSON.parse(
            (formData.get("resolution") as string) || "[]",
        );
        const shortDescription = formData.get("shortDescription") as string;
        const description = formData.get("description") as string;
        const inStock = formData.get("inStock") !== "false"; // ← product-level inStock

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
                        },
                    )
                    .end(buffer);
            });
            cardImageUrl = uploadResult.secure_url;
        }

        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]",
        );
        const weights = JSON.parse((formData.get("weights") as string) || "[]");
        const specifications = JSON.parse(
            (formData.get("specifications") as string) || "[]",
        );
        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const applications = JSON.parse(
            (formData.get("applications") as string) || "[]",
        );
        const compatibilities = JSON.parse(
            (formData.get("compatibilities") as string) || "[]",
        );
        const downloads = JSON.parse(
            (formData.get("downloads") as string) || "[]",
        );

        const rawColours = JSON.parse(
            (formData.get("colours") as string) || "[]",
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
                                        },
                                    )
                                    .end(buffer);
                            },
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
                inStock: col.inStock ?? true, // ← per-colour inStock
                images: processedImages,
            });
        }

        // Delete all related records then recreate
        await prisma.$transaction([
            prisma.resinAttribute.deleteMany({ where: { resinId: id } }),
            prisma.resinColour.deleteMany({ where: { resinId: id } }), // cascades images
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
                inStock, // ← product-level

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
                                          100,
                                  )
                                : null,
                        sortOrder: idx,
                        inStock: w.inStock ?? true, // ← per-weight inStock
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
                    create: processedColours.map((c, idx) => ({
                        name: c.name,
                        hexCode: c.hexCode,
                        sortOrder: idx,
                        inStock: c.inStock, // ← per-colour inStock
                        images: {
                            create: c.images.map((img, i) => ({
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
            { status: 500 },
        );
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const resin = await prisma.resin.findUnique({
            where: { id },
            include: { colours: { include: { images: true } } },
        });

        if (!resin)
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 },
            );

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

        await prisma.resin.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete failed:", err);
        return NextResponse.json(
            { error: "Failed to delete resin" },
            { status: 500 },
        );
    }
}
