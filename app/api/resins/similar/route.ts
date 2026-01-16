// app/api/resins/similar/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const technology = searchParams.get("technology");
        const excludeId = searchParams.get("exclude");
        const limit = Number(searchParams.get("limit") || 6);

        if (!technology) {
            return NextResponse.json(
                { error: "technology is required" },
                { status: 400 }
            );
        }

        /* ================= WHERE ================= */

        const where: any = {
            technology,
            weights: {
                some: {}, // 🔥 ENSURES at least one purchasable weight
            },
        };

        if (excludeId) {
            where.id = { not: excludeId };
        }

        /* ================= FETCH ================= */

        const resins = await prisma.resin.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,

            include: {
                attributes: true,

                weights: {
                    orderBy: { sortOrder: "asc" }, // 🔥 weight[0] = base pack
                },

                colours: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        images: {
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            resins,
            total: resins.length,
        });
    } catch (error) {
        console.error("Error fetching similar resins:", error);
        return NextResponse.json(
            { error: "Failed to fetch similar resins" },
            { status: 500 }
        );
    }
}
