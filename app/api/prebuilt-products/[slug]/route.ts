import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: any }) {
    try {
        const slug = params.slug as string;

        const product = await db.prebuiltProducts.findUnique({
            where: { slug },
            include: {
                images: {
                    orderBy: { position: "asc" },
                },
                variants: {
                    where: { isActive: true },
                },
                attributes: true,
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
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
