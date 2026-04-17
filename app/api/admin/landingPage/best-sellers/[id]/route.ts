import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary-utils";

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
                    folder: "best-sellers",
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
        const item = await prisma.bestSeller.findUnique({ where: { id } });
        if (!item)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(item);
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

        const existingItem = await prisma.bestSeller.findUnique({
            where: { id },
            select: { image: true },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 },
            );
        }

        let imageUrl: string | undefined;
        if (file && file.size > 0) {
            if (existingItem.image) {
                await deleteFromCloudinary(existingItem.image);
            }
            const url = await uploadToCloudinary(file);
            if (!url)
                return NextResponse.json(
                    { error: "Upload failed" },
                    { status: 500 },
                );
            imageUrl = url;
        }

        const isHero = formData.get("isHero") === "true";
        const specsRaw = formData.get("specs") as string;
        let specs = null;
        if (isHero && specsRaw) {
            try {
                specs = JSON.parse(specsRaw);
            } catch {
                specs = null;
            }
        }

        const updateData: any = {
            name: formData.get("name") as string,
            price: formData.get("price") as string,
            href: formData.get("href") as string,
            isHero,
            variant: isHero
                ? null
                : (formData.get("variant") as string) || null,
            description: isHero
                ? (formData.get("description") as string) || null
                : null,
            specs: isHero ? specs : null,
            sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
            isActive: formData.get("isActive") !== "false",
        };
        if (imageUrl) updateData.image = imageUrl;

        const item = await prisma.bestSeller.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(item);
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
        const item = await prisma.bestSeller.findUnique({
            where: { id },
            select: { image: true },
        });

        if (item?.image) {
            await deleteFromCloudinary(item.image);
        }

        await prisma.bestSeller.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
