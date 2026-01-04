import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const items = await prisma.carouselItem.findMany({
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("[CAROUSEL_PUBLIC_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch carousel items" },
            { status: 500 }
        );
    }
}
