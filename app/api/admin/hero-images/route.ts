import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

/* =========================
   GET – Fetch hero images
   ========================= */
export async function GET() {
    try {
        const heroImages = await prisma.heroImage.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(heroImages);
    } catch (error) {
        console.error("[HERO_IMAGES_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch hero images" },
            { status: 500 }
        );
    }
}

/* =========================
   POST – Upload hero image
   ========================= */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File | null;
        const page = formData.get("page") as string | null;
        const alt = formData.get("alt") as string | null;

        if (!file || !page || !alt) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary (keep hierarchy same as before)
        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "hero-images",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        // Save Cloudinary URL in DB
        const heroImage = await prisma.heroImage.create({
            data: {
                page,
                imageUrl: uploadResult.secure_url,
                alt,
            },
        });

        return NextResponse.json(heroImage, { status: 201 });
    } catch (error) {
        console.error("[HERO_IMAGES_POST]", error);
        return NextResponse.json(
            { error: "Failed to upload hero image" },
            { status: 500 }
        );
    }
}
