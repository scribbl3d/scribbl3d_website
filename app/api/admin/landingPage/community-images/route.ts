import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<string | null> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "community-showcase",
                    resource_type: "image",
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
        const images = await prisma.communityImage.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(images);
    } catch (error) {
        console.error("Error fetching community images:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        let imageUrl = "";
        if (file && file.size > 0) {
            const url = await uploadToCloudinary(file);
            if (!url)
                return NextResponse.json(
                    { error: "Upload failed" },
                    { status: 500 },
                );
            imageUrl = url;
        } else {
            return NextResponse.json(
                { error: "Image is required" },
                { status: 400 },
            );
        }

        const image = await prisma.communityImage.create({
            data: {
                imageUrl,
                altText: (formData.get("altText") as string) || null,
                linkPath: (formData.get("linkPath") as string) || null,
                sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
                isActive: formData.get("isActive") === "true",
            },
        });

        return NextResponse.json(image, { status: 201 });
    } catch (error) {
        console.error("Error creating community image:", error);
        return NextResponse.json(
            { error: "Failed to create" },
            { status: 500 },
        );
    }
}
