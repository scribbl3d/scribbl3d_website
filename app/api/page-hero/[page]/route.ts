import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
    params: Promise<{ page: string }>;
};

export async function GET(
    _req: Request,
    { params }: RouteContext
) {
    const { page } = await params;

    try {
        const hero = await prisma.pageHero.findUnique({
            where: { page },
        });

        return NextResponse.json(hero);
    } catch {
        return NextResponse.json(null, { status: 500 });
    }
}