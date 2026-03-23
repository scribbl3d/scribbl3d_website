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

export async function GET() {
    try {
        const items = await prisma.bestSeller.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching best sellers:", error);
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

        const item = await prisma.bestSeller.create({
            data: {
                name: formData.get("name") as string,
                price: formData.get("price") as string,
                image: imageUrl,
                href: formData.get("href") as string,
                isHero,
                variant: isHero
                    ? null
                    : (formData.get("variant") as string) || null,
                description: isHero
                    ? (formData.get("description") as string) || null
                    : null,

                sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
                isActive: formData.get("isActive") !== "false",
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Error creating best seller:", error);
        return NextResponse.json(
            { error: "Failed to create" },
            { status: 500 },
        );
    }
}
