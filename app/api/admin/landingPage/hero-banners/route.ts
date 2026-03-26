import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(
    file: File,
    resourceType: "image" | "video",
): Promise<string | null> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "hero-banners",
                    resource_type: resourceType,
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            stream.end(buffer);
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

export async function GET() {
    try {
        const banners = await prisma.heroBanner.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(banners);
    } catch (error) {
        console.error("Error fetching banners:", error);
        return NextResponse.json(
            { error: "Failed to fetch banners" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const mediaType = (formData.get("mediaType") as string) || "image";
        const file = formData.get("file") as File | null;

        let mediaUrl = "";
        if (file && file.size > 0) {
            const resourceType = mediaType === "video" ? "video" : "image";
            const url = await uploadToCloudinary(file, resourceType);
            if (!url)
                return NextResponse.json(
                    { error: "File upload failed" },
                    { status: 500 },
                );
            mediaUrl = url;
        } else {
            return NextResponse.json(
                { error: "File is required" },
                { status: 400 },
            );
        }

        const banner = await prisma.heroBanner.create({
            data: {
                headline: formData.get("headline") as string,
                headlineAccent:
                    (formData.get("headlineAccent") as string) || null,
                subtext: (formData.get("subtext") as string) || null,
                mediaUrl,
                mediaType,
                altText: (formData.get("altText") as string) || null,
                buttonText: (formData.get("buttonText") as string) || null,
                buttonLink: (formData.get("buttonLink") as string) || null,
                sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
                isActive: formData.get("isActive") === "true",
                duration: parseInt(formData.get("duration") as string) || 5000,
                buttonGradientFrom:
                    (formData.get("buttonGradientFrom") as string) || "#4f46e5",
                buttonGradientTo:
                    (formData.get("buttonGradientTo") as string) || "#7c3aed",
                textColor: (formData.get("textColor") as string) || "#ffffff",
            },
        });

        return NextResponse.json(banner, { status: 201 });
    } catch (error) {
        console.error("Error creating banner:", error);
        return NextResponse.json(
            { error: "Failed to create banner" },
            { status: 500 },
        );
    }
}
