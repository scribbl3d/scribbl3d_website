import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) return NextResponse.json([]);

    const results = await prisma.product.findMany({
        where: {
            name: { contains: q, mode: "insensitive" },
        },
        select: { id: true, name: true },
        take: 10,
    });

    return NextResponse.json(results);
}
