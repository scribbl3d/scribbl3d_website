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
        // Handle showGradient: "true" = true, anything else (including null/undefined) = false
        const showGradientValue = formData.get("showGradient");
        const showGradient = showGradientValue === "true";
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
            update: { mediaUrl, mediaType, headline, subtext, showGradient },
            create: {
                page,
                mediaUrl,
                mediaType,
                headline,
                subtext,
                showGradient,
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

// DELETE — remove hero for a page and clean up Cloudinary
export async function DELETE(
    _req: Request,
    { params }: RouteContext
) {
    const { page } = await params;

    try {
        // First, get the current hero to extract Cloudinary public_id
        const hero = await prisma.pageHero.findUnique({
            where: { page },
        });

        if (!hero) {
            return NextResponse.json(
                { error: "Hero not found" },
                { status: 404 }
            );
        }

        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        if (hero.mediaUrl && hero.mediaUrl.includes("cloudinary.com")) {
            try {
                const urlParts = hero.mediaUrl.split("/");
                const uploadIndex = urlParts.indexOf("upload");
                if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                    // Get everything after "upload/v{version}/"
                    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
                    // Remove file extension to get public_id
                    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

                    // Delete from Cloudinary
                    const resourceType = hero.mediaType === "video" ? "video" : "image";
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: resourceType,
                    });
                    
                    console.log(`Deleted from Cloudinary: ${publicId}`);
                }
            } catch (cloudinaryErr) {
                console.error("Cloudinary deletion failed:", cloudinaryErr);
                // Continue with DB deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await prisma.pageHero.delete({
            where: { page },
        });

        return NextResponse.json({ success: true, message: "Hero deleted successfully" });
    } catch (err: any) {
        console.error("PageHero DELETE failed:", err);
        return NextResponse.json(
            { error: err.message || "Failed to delete hero" },
            { status: 500 }
        );
    }
}