// app/api/admin/resins/[id]/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

type ProcessedImage = {
    id?: string;
    url: string;
    altText: string | null;
    sortOrder: number;
};

type ProcessedColour = {
    id?: string;
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
                        {
                            folder: `resins/${slug}`,
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
                                        {
                                            folder: `resins/${slug}/gallery`,
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
                                        },
                                    )
                                    .end(buffer);
                            },
                        );
                        imageUrl = res.secure_url;
                    }
                }
                processedImages.push({
                    id: img.id || undefined,
                    url: imageUrl,
                    altText: null,
                    sortOrder: img.sortOrder,
                });
            }
            processedColours.push({
                id: col.id || undefined,
                name: col.name,
                hexCode: col.hexCode || null,
                sortOrder: col.sortOrder || 0,
                inStock: col.inStock ?? true, // ← per-colour inStock
                images: processedImages,
            });
        }

        const resin = await prisma.$transaction(async (tx) => {
            await tx.resin.update({
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
                    inStock,
                },
            });

            // Non-variant metadata: replace wholesale
            await tx.resinAttribute.deleteMany({ where: { resinId: id } });
            await tx.resinSpecification.deleteMany({ where: { resinId: id } });
            await tx.resinFeature.deleteMany({ where: { resinId: id } });
            await tx.resinApplication.deleteMany({ where: { resinId: id } });
            await tx.resinCompatibility.deleteMany({ where: { resinId: id } });
            await tx.resinDownload.deleteMany({ where: { resinId: id } });

            if (attributes.length) {
                await tx.resinAttribute.createMany({
                    data: attributes.map((a: any) => ({
                        resinId: id,
                        label: a.label,
                        value: a.value,
                    })),
                });
            }

            if (specifications.length) {
                await tx.resinSpecification.createMany({
                    data: specifications.map((s: any, idx: number) => ({
                        resinId: id,
                        category: s.category,
                        label: s.label,
                        value: s.value,
                        sortOrder: idx,
                    })),
                });
            }

            if (features.length) {
                await tx.resinFeature.createMany({
                    data: features.map((f: any, idx: number) => ({
                        resinId: id,
                        title: f.title,
                        sortOrder: idx,
                    })),
                });
            }

            if (applications.length) {
                await tx.resinApplication.createMany({
                    data: applications.map((a: any, idx: number) => ({
                        resinId: id,
                        name: a.name,
                        sortOrder: idx,
                    })),
                });
            }

            if (compatibilities.length) {
                await tx.resinCompatibility.createMany({
                    data: compatibilities.map((c: any, idx: number) => ({
                        resinId: id,
                        name: c.name,
                        sortOrder: idx,
                    })),
                });
            }

            if (downloads.length) {
                await tx.resinDownload.createMany({
                    data: downloads.map((d: any, idx: number) => ({
                        resinId: id,
                        title: d.title,
                        description: d.description || null,
                        downloadUrl: d.downloadUrl || null,
                        sortOrder: idx,
                    })),
                });
            }

            // Weights: preserve IDs for existing rows
            const incomingWeightIds = weights
                .map((w: any) => w.id)
                .filter((wid: unknown): wid is string => typeof wid === "string");

            if (incomingWeightIds.length) {
                await tx.resinWeight.deleteMany({
                    where: {
                        resinId: id,
                        id: { notIn: incomingWeightIds },
                    },
                });
            } else {
                await tx.resinWeight.deleteMany({ where: { resinId: id } });
            }

            for (const [idx, w] of weights.entries()) {
                const weightData = {
                    weightInGrams: Number(w.weightInGrams),
                    price: Number(w.price),
                    originalPrice: w.originalPrice ? Number(w.originalPrice) : null,
                    discount:
                        w.originalPrice && Number(w.originalPrice) > Number(w.price)
                            ? Math.round(
                                  ((Number(w.originalPrice) - Number(w.price)) /
                                      Number(w.originalPrice)) *
                                      100,
                              )
                            : null,
                    sortOrder: idx,
                    inStock: w.inStock ?? true,
                };

                if (w.id) {
                    const updated = await tx.resinWeight.updateMany({
                        where: { id: w.id, resinId: id },
                        data: weightData,
                    });
                    if (updated.count === 0) {
                        await tx.resinWeight.create({
                            data: { resinId: id, ...weightData },
                        });
                    }
                } else {
                    await tx.resinWeight.create({
                        data: { resinId: id, ...weightData },
                    });
                }
            }

            // Colours + images: preserve IDs for existing rows
            const incomingColourIds = processedColours
                .map((c) => c.id)
                .filter((cid: unknown): cid is string => typeof cid === "string");

            if (incomingColourIds.length) {
                await tx.resinColour.deleteMany({
                    where: {
                        resinId: id,
                        id: { notIn: incomingColourIds },
                    },
                });
            } else {
                await tx.resinColour.deleteMany({ where: { resinId: id } });
            }

            for (const [idx, c] of processedColours.entries()) {
                const colourData = {
                    name: c.name,
                    hexCode: c.hexCode,
                    sortOrder: idx,
                    inStock: c.inStock,
                };

                let colourId = c.id;
                if (c.id) {
                    const updated = await tx.resinColour.updateMany({
                        where: { id: c.id, resinId: id },
                        data: colourData,
                    });
                    if (updated.count === 0) {
                        const created = await tx.resinColour.create({
                            data: { resinId: id, ...colourData },
                        });
                        colourId = created.id;
                    }
                } else {
                    const created = await tx.resinColour.create({
                        data: { resinId: id, ...colourData },
                    });
                    colourId = created.id;
                }

                if (!colourId) continue;

                const incomingImageIds = c.images
                    .map((img) => img.id)
                    .filter((iid: unknown): iid is string => typeof iid === "string");

                if (incomingImageIds.length) {
                    await tx.resinImage.deleteMany({
                        where: {
                            colourId,
                            id: { notIn: incomingImageIds },
                        },
                    });
                } else {
                    await tx.resinImage.deleteMany({ where: { colourId } });
                }

                for (const [imageIdx, img] of c.images.entries()) {
                    const imageData = {
                        url: img.url,
                        altText: img.altText,
                        sortOrder: imageIdx,
                    };

                    if (img.id) {
                        const updated = await tx.resinImage.updateMany({
                            where: { id: img.id, colourId },
                            data: imageData,
                        });
                        if (updated.count === 0) {
                            await tx.resinImage.create({
                                data: { colourId, ...imageData },
                            });
                        }
                    } else {
                        await tx.resinImage.create({
                            data: { colourId, ...imageData },
                        });
                    }
                }
            }

            return tx.resin.findUnique({
                where: { id },
                include: {
                    attributes: { orderBy: { id: "asc" } },
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
