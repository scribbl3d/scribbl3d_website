import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const field = searchParams.get("field") || "name";
        const query = searchParams.get("query") || "";

        if (!query) {
            return NextResponse.json([]);
        }

        const filaments = await prisma.filament.findMany({
            where: {
                [field]: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                [field]: true,
            },
            take: 10,
            distinct: [field as any],
        });

        const suggestions = filaments
            .map((f: any) => f[field])
            .filter((val): val is string => val !== null && val !== undefined);

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json([], { status: 500 });
    }
}
