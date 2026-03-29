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
                { folder: "about-page" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            stream.end(buffer);
        });
        return result.secure_url;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    try {
        // We only need the first one since there's no carousel
        const hero = await prisma.aboutHero.findFirst();
        return NextResponse.json(hero || {});
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const id = formData.get("id") as string;
        const file = formData.get("file") as File | null;

        let mediaUrl = formData.get("mediaUrl") as string;

        // If a new file is uploaded, push it to Cloudinary
        if (file && file.size > 0) {
            const uploadedUrl = await uploadToCloudinary(file);
            if (uploadedUrl) mediaUrl = uploadedUrl;
        }

        const data = {
            headline: formData.get("headline") as string,
            headlineAccent: formData.get("headlineAccent") as string,
            subtext: formData.get("subtext") as string,
            buttonText: formData.get("buttonText") as string,
            buttonLink: formData.get("buttonLink") as string,
            mediaUrl: mediaUrl,
        };

        let hero;
        if (id && id !== "undefined") {
            // Update existing
            hero = await prisma.aboutHero.update({ where: { id }, data });
        } else {
            // Create new
            hero = await prisma.aboutHero.create({ data });
        }

        return NextResponse.json(hero);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
