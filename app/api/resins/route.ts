import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
    const resins = await prisma.resin.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            attributes: true,
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
        },
    });

    return NextResponse.json(resins);
}
