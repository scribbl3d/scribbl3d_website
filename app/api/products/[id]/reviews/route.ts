import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const id = (await params).id;
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: id },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
