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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchField = searchParams.get("searchField") || "name";
        const searchTerm = searchParams.get("searchTerm") || "";
        const sort = searchParams.get("sort") || "updatedAt-desc";
        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);
        const [sortField, sortOrder] = sort.split("-");

        const where =
            searchTerm && searchField
                ? {
                      [searchField]: {
                          contains: searchTerm,
                          mode: "insensitive",
                      },
                  }
                : {};

        const [resins, totalCount] = await Promise.all([
            prisma.resin.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortField]: sortOrder === "asc" ? "asc" : "desc",
                },
                select: {
                    id: true,
                    name: true,
                    brand: true,
                    technology: true,
                    resolution: true,
                    updatedAt: true,
                    cardImageUrl: true,
                },
            }),
            prisma.resin.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            resins,
            totalPages,
        });
    } catch (error) {
        console.error("Admin resins fetch failed:", error);
        return NextResponse.json(
            { message: "Failed to fetch resins" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // Safety Check using CORRECT variables
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY
        ) {
            throw new Error("Cloudinary credentials missing in .env");
        }

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

        // 2. Card Image
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

        // 3. Nested Structures
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

        // 4. Handle Colours & Nested Images
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

        // 5. Create in DB
        const resin = await prisma.resin.create({
            data: {
                name,
                slug,
                brand,
                technology,
                resolution,
                shortDescription,
                description,
                cardImageUrl,

                attributes: { create: attributes },
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
                specifications: { create: specifications },
                features: { create: features },
                applications: { create: applications },
                compatibilities: { create: compatibilities },
                downloads: { create: downloads },

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
        console.error("Create resin failed:", err);
        return NextResponse.json(
            { error: err.message || "Failed to create resin" },
            { status: 500 }
        );
    }
}
