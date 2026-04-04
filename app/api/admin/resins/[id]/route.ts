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

/* ========================= GET ========================= */

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

        if (!resin) {
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(resin);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resin" },
            { status: 500 },
        );
    }
}

/* ========================= PUT ========================= */

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
        const inStock = formData.get("inStock") !== "false";

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

                        const res: any = await new Promise((resolve, reject) => {
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
                        });

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
                inStock: col.inStock ?? true,
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

            // ✅ FIXED LOOP (weights)
            for (let idx = 0; idx < weights.length; idx++) {
                const w = weights[idx];

                const weightData = {
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
                    inStock: w.inStock ?? true,
                };

                if (w.id) {
                    await tx.resinWeight.updateMany({
                        where: { id: w.id, resinId: id },
                        data: weightData,
                    });
                } else {
                    await tx.resinWeight.create({
                        data: { resinId: id, ...weightData },
                    });
                }
            }

            // ✅ FIXED LOOP (colours)
            for (let idx = 0; idx < processedColours.length; idx++) {
                const c = processedColours[idx];

                const colourData = {
                    name: c.name,
                    hexCode: c.hexCode,
                    sortOrder: idx,
                    inStock: c.inStock,
                };

                let colour = await tx.resinColour.create({
                    data: { resinId: id, ...colourData },
                });

                // ✅ FIXED LOOP (images)
                for (let imageIdx = 0; imageIdx < c.images.length; imageIdx++) {
                    const img = c.images[imageIdx];

                    await tx.resinImage.create({
                        data: {
                            colourId: colour.id,
                            url: img.url,
                            altText: img.altText,
                            sortOrder: imageIdx,
                        },
                    });
                }
            }

            return tx.resin.findUnique({
                where: { id },
                include: {
                    attributes: true,
                    colours: {
                        include: { images: true },
                    },
                    weights: true,
                },
            });
        });

        return NextResponse.json(resin);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to update resin" },
            { status: 500 },
        );
    }
}

/* ========================= DELETE ========================= */

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        await prisma.resin.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete resin" },
            { status: 500 },
        );
    }
}