import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    // The 'slug' parameter might actually be an 'id' if the post is old and lacks a slug
    const identifier = (await params).slug;

    try {
        // We use findFirst with an OR condition so it searches both columns
        const blog = await prisma.blog.findFirst({
            where: {
                OR: [{ slug: identifier }, { id: identifier }],
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error("Failed to fetch blog:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog" },
            { status: 500 },
        );
    }
}
