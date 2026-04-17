import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteFromCloudinary, deleteMultipleFromCloudinary } from "@/lib/cloudinary-utils";

// Configure Cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Removed NEXT_PUBLIC_
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const isAuthenticated = () => true;

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, { folder });
    return result.secure_url;
}

const blogSchema = z.object({
    slug: z.string().max(255).optional().nullable(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    description: z.string().max(500).optional().nullable(),
    keywords: z.string().max(255),
    thumbnailImage: z.string().min(1),
    heroImage: z.string().min(1),
    published: z.boolean().optional(),
    publishedAt: z.coerce.date().optional().nullable(),
    featured: z.boolean().optional(),
});

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;

    if (!isAuthenticated())
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const blog = await prisma.blog.findUnique({ where: { id } });
        if (!blog)
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 },
            );
        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch blog" },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    if (!isAuthenticated())
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();

        const existingBlog = await prisma.blog.findUnique({
            where: { id },
            select: { thumbnailImage: true, heroImage: true },
        });

        if (!existingBlog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 },
            );
        }

        // 1. Process Images
        // These could be 'File' objects (if user uploaded a new image) OR string URLs (if they didn't touch it)
        let thumbnailUrl = formData.get("thumbnailImage");
        let heroUrl = formData.get("heroImage");

        // If it's a File object, upload it. If it's already a string, just keep the string.
        if (thumbnailUrl instanceof File) {
            if (existingBlog.thumbnailImage) {
                await deleteFromCloudinary(existingBlog.thumbnailImage);
            }
            thumbnailUrl = await uploadToCloudinary(
                thumbnailUrl,
                "blog_thumbnails",
            );
        }

        if (heroUrl instanceof File) {
            if (existingBlog.heroImage) {
                await deleteFromCloudinary(existingBlog.heroImage);
            }
            heroUrl = await uploadToCloudinary(heroUrl, "blog_heroes");
        }

        // 2. Map form data
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

        const validatedData = blogSchema.parse(rawData);

        // Auto-set or clear publishedAt
        if (validatedData.published && !validatedData.publishedAt) {
            validatedData.publishedAt = new Date();
        } else if (validatedData.published === false) {
            validatedData.publishedAt = null;
        }

        // 3. Update database
        const blog = await prisma.blog.update({
            where: { id },
            data: validatedData,
        });
        return NextResponse.json(blog);
    } catch (error) {
        console.error("Failed to update blog:", error);
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
            { error: "Failed to update blog" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    if (!isAuthenticated())
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const blog = await prisma.blog.findUnique({
            where: { id },
            select: { thumbnailImage: true, heroImage: true },
        });

        if (blog) {
            const imagesToDelete = [blog.thumbnailImage, blog.heroImage].filter(
                Boolean,
            );
            if (imagesToDelete.length > 0) {
                await deleteMultipleFromCloudinary(imagesToDelete);
            }
        }

        await prisma.blog.delete({ where: { id } });
        return NextResponse.json({ message: "Blog deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete blog" },
            { status: 500 },
        );
    }
}
