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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const image = await prisma.communityImage.findUnique({ where: { id } });
        if (!image)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(image);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        let imageUrl: string | undefined;
        if (file && file.size > 0) {
            const url = await uploadToCloudinary(file);
            if (!url)
                return NextResponse.json(
                    { error: "Upload failed" },
                    { status: 500 },
                );
            imageUrl = url;
        }

        const updateData: any = {
            altText: (formData.get("altText") as string) || null,
            linkPath: (formData.get("linkPath") as string) || null,
            sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
            isActive: formData.get("isActive") === "true",
        };
        if (imageUrl) updateData.imageUrl = imageUrl;

        const image = await prisma.communityImage.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(image);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update" },
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
        await prisma.communityImage.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
