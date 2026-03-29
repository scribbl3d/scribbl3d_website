import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to Cloudinary
async function uploadToCloudinary(file: File): Promise<string | null> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "trusted-partners", // You can change the folder name
                    resource_type: "image",
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
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(partners);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch partners" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const name = formData.get("name") as string;
        const sub = formData.get("sub") as string;

        if (!name || !sub) {
            return NextResponse.json(
                { error: "Missing name or subheading" },
                { status: 400 },
            );
        }

        if (!file || file.size === 0) {
            return NextResponse.json(
                { error: "Image file is required" },
                { status: 400 },
            );
        }

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        if (!imageUrl) {
            return NextResponse.json(
                { error: "Image upload failed" },
                { status: 500 },
            );
        }

        // Save to Database
        const newPartner = await prisma.partner.create({
            data: { name, sub, image: imageUrl },
        });

        return NextResponse.json(newPartner, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create partner" },
            { status: 500 },
        );
    }
}
