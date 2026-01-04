import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log("🔥 ADMIN BLOG IMAGE UPLOAD HIT");

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // "thumbnail" | "hero"
        const blogTitle = formData.get("blogTitle") as string;

        if (!file || !type || !blogTitle) {
            return NextResponse.json(
                { error: "File, type, and blog title are required" },
                { status: 400 }
            );
        }

        // ✅ SLUGIFY BLOG TITLE
        const folderName = blogTitle
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // Convert File → Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString("base64")}`,
            {
                folder: `blog-images/${folderName}`,
                resource_type: "image",
            }
        );

        console.log("✅ Uploaded to Cloudinary:", uploadResult.secure_url);

        // ✅ RETURN CLOUDINARY URL (ONLY THIS)
        return NextResponse.json({
            imageUrl: uploadResult.secure_url,
        });
    } catch (error) {
        console.error("❌ Blog image upload failed:", error);
        return NextResponse.json(
            { error: "Image upload failed" },
            { status: 500 }
        );
    }
}
