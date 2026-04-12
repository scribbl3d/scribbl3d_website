import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: { page: string } }
) {
    try {
        const hero = await prisma.pageHero.findUnique({
            where: { page: params.page },
        });
        return NextResponse.json(hero);
    } catch {
        return NextResponse.json(null, { status: 500 });
    }
}