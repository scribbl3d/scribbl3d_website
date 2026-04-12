import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Reusable type for Next.js 15
type RouteContext = {
    params: Promise<{ page: string }>;
};

// GET current hero for a page
export async function GET(
    _req: Request,
    { params }: RouteContext
) {
    const { page } = await params;

    try {
        const hero = await prisma.pageHero.findUnique({
            where: { page },
        });

        return NextResponse.json(hero);
    } catch (error) {
        console.error("PageHero GET failed:", error);
        return NextResponse.json(
            { message: "Failed to fetch hero" },
            { status: 500 }
        );
    }
}

// PUT — create or update hero for a page
export async function PUT(
    req: Request,
    { params }: RouteContext
) {
    const { page } = await params;

    try {
        const formData = await req.formData();

        const headline = (formData.get("headline") as string) || null;
        const subtext = (formData.get("subtext") as string) || null;
        const mediaType = (formData.get("mediaType") as string) || "video";
        let mediaUrl = (formData.get("mediaUrl") as string) || "";

        // Handle file upload
        const mediaFile = formData.get("mediaFile") as File;

        if (mediaFile && mediaFile.size > 0) {
            const buffer = Buffer.from(await mediaFile.arrayBuffer());
            const resourceType = mediaType === "video" ? "video" : "image";

            const uploadResult: any = await new Promise((resolve, reject) => {
                const uploadOptions: any = {
                    folder: `hero/${page}`,
                    resource_type: resourceType,
                };

                // Only apply image transformations for images
                if (resourceType === "image") {
                    uploadOptions.transformation = [
                        {
                            width: 1920,
                            quality: "auto:good",
                            fetch_format: "auto",
                        },
                    ];
                }

                cloudinary.uploader
                    .upload_stream(uploadOptions, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    })
                    .end(buffer);
            });

            mediaUrl = uploadResult.secure_url;
        }

        if (!mediaUrl) {
            return NextResponse.json(
                { error: "Media URL or file is required" },
                { status: 400 }
            );
        }

        const hero = await prisma.pageHero.upsert({
            where: { page },
            update: { mediaUrl, mediaType, headline, subtext },
            create: {
                page,
                mediaUrl,
                mediaType,
                headline,
                subtext,
            },
        });

        return NextResponse.json(hero);
    } catch (err: any) {
        console.error("PageHero PUT failed:", err);
        return NextResponse.json(
            { error: err.message || "Failed to update hero" },
            { status: 500 }
        );
    }
}