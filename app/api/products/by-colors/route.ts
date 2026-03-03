import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const color = searchParams.get("color");

    if (!category || !color) {
        return NextResponse.json(
            { error: "Category and color are required" },
            { status: 400 },
        );
    }

    try {
        const product = await prisma.product.findFirst({
            where: {
                AND: [{ category: category }, { color: color }],
            },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
