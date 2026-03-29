import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

// Configure Cloudinary (Make sure these exist in your .env file)
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload Next.js File object to Cloudinary from memory
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: folder,
    });
    return result.secure_url;
}

const blogSchema = z.object({
    slug: z.string().max(255).optional().nullable(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    description: z.string().max(500).optional().nullable(),
    keywords: z.string().max(255),
    thumbnailImage: z.string().min(1, "Thumbnail is required"),
    heroImage: z.string().min(1, "Hero image is required"),
    published: z.boolean().optional(),
    publishedAt: z.coerce.date().optional().nullable(),
    featured: z.boolean().optional(),
});

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(blogs);
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return NextResponse.json(
            { error: "Failed to fetch blogs" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // 1. Handle File Uploads first
        const thumbnailFile = formData.get("thumbnailImage") as File | null;
        const heroFile = formData.get("heroImage") as File | null;

        if (!thumbnailFile || !heroFile) {
            return NextResponse.json(
                { error: "Both images are required" },
                { status: 400 },
            );
        }

        // Upload to Cloudinary concurrently for speed
        const [thumbnailUrl, heroUrl] = await Promise.all([
            uploadToCloudinary(thumbnailFile, "blog_thumbnails"),
            uploadToCloudinary(heroFile, "blog_heroes"),
        ]);

        // 2. Extract and format the rest of the text data
        // FormData returns strings, so we must manually convert "true"/"false" to actual booleans
        const rawData = {
            title: formData.get("title"),
            content: formData.get("content"),
            description: formData.get("description"),
            keywords: formData.get("keywords"),
            slug: formData.get("slug"),
            published: formData.get("published") === "true",
            featured: formData.get("featured") === "true",
            thumbnailImage: thumbnailUrl,
            heroImage: heroUrl,
            publishedAt: formData.get("publishedAt"),
        };

        // 3. Validate with Zod
        const validatedData = blogSchema.parse(rawData);

        // Auto-set publishedAt if missing
        if (validatedData.published && !validatedData.publishedAt) {
            validatedData.publishedAt = new Date();
        }

        // 4. Save to Database
        const blog = await prisma.blog.create({
            data: validatedData,
        });

        return NextResponse.json({ success: true, blog });
    } catch (error) {
        console.error("Blog creation error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to create blog post" },
            { status: 500 },
        );
    }
}
