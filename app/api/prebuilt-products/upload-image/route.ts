import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const productName = formData.get("productName") as string;

        if (!file || !productName) {
            return NextResponse.json(
                { error: "File and product name are required" },
                { status: 400 }
            );
        }

        // slugify product name
        const folderName = productName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString("base64")}`,
            {
                folder: `prebuilt-products/${folderName}`,
                resource_type: "image",
            }
        );

        return NextResponse.json({
            imageUrl: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("Prebuilt product image upload failed:", error);
        return NextResponse.json(
            { error: "Image upload failed" },
            { status: 500 }
        );
    }
}
