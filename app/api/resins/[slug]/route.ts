import { prisma } from "@/lib/prisma"; // 👈 recommended (see note below)
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: { slug: string } }
) {
    try {
        const { slug } = context.params; // ✅ unwrap FIRST

        const resin = await prisma.resin.findUnique({
            where: { slug },
            include: {
                attributes: true,
                compatibilities: true,

                weights: {
                    orderBy: { sortOrder: "asc" },
                },

                colours: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        images: {
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },

                specifications: {
                    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
                },

                features: {
                    orderBy: { sortOrder: "asc" },
                },

                applications: {
                    orderBy: { sortOrder: "asc" },
                },

                downloads: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!resin) {
            return NextResponse.json(
                { message: "Resin not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(resin);
    } catch (error) {
        console.error("Error fetching resin:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
