import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                keywords: true,
                createdAt: true,
                publishedAt: true,
                content: true,
                thumbnailImage: true,
                heroImage: true,
                published: true, // 👈 ADDED: Frontend needs this to show the post
                featured: true, // 👈 ADDED: Frontend needs this to pin the post
            },
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
