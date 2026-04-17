import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary-utils";

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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const banner = await prisma.heroBanner.findUnique({ where: { id } });
        if (!banner)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch banner" },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const mediaType = (formData.get("mediaType") as string) || "image";
        const file = formData.get("file") as File | null;

        const existingBanner = await prisma.heroBanner.findUnique({
            where: { id },
            select: { mediaUrl: true, mediaType: true },
        });

        if (!existingBanner) {
            return NextResponse.json(
                { error: "Banner not found" },
                { status: 404 },
            );
        }

        let mediaUrl: string | undefined;
        if (file && file.size > 0) {
            if (existingBanner.mediaUrl) {
                const oldResourceType =
                    existingBanner.mediaType === "video" ? "video" : "image";
                await deleteFromCloudinary(
                    existingBanner.mediaUrl,
                    oldResourceType,
                );
            }
            const resourceType = mediaType === "video" ? "video" : "image";
            const url = await uploadToCloudinary(file, resourceType);
            if (!url)
                return NextResponse.json(
                    { error: "File upload failed" },
                    { status: 500 },
                );
            mediaUrl = url;
        }

        const updateData: any = {
            headline: formData.get("headline") as string,
            headlineAccent: (formData.get("headlineAccent") as string) || null,
            subtext: (formData.get("subtext") as string) || null,
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
        };
        if (mediaUrl) updateData.mediaUrl = mediaUrl;

        const banner = await prisma.heroBanner.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update banner" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const banner = await prisma.heroBanner.findUnique({
            where: { id },
            select: { mediaUrl: true, mediaType: true },
        });

        if (banner?.mediaUrl) {
            const resourceType = banner.mediaType === "video" ? "video" : "image";
            await deleteFromCloudinary(banner.mediaUrl, resourceType);
        }

        await prisma.heroBanner.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete banner" },
            { status: 500 },
        );
    }
}
