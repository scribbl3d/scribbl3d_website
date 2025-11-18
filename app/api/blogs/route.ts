import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                keywords: true,
                createdAt: true,
                content: true,
                thumbnailImage: true, // 👈 MUST BE HERE
                heroImage: true, // 👈 MUST BE HERE
            },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        return NextResponse.json(
            { error: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}
