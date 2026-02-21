import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page");

        if (!page) {
            return NextResponse.json(
                { error: "Page query param is required" },
                { status: 400 }
            );
        }

        const heroImage = await prisma.heroImage.findFirst({
            where: { page },
            orderBy: { createdAt: "desc" },
        });

        // If no hero image set yet, return null (NOT 404)
        if (!heroImage) {
            return NextResponse.json(null);
        }

        return NextResponse.json(heroImage);
    } catch (error) {
        console.error("[HERO_IMAGE_PUBLIC_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch hero image" },
            { status: 500 }
        );
    }
}
