import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const blog = await prisma.blog.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                keywords: true,
                description: true,
                thumbnailImage: true,
                heroImage: true,
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}
