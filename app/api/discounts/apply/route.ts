import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json(
            { message: "Discount code required" },
            { status: 400 },
        );
    }

    const discount = await prisma.discount.findFirst({
        where: {
            code: code.toUpperCase(),
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
            itemTypes: true,
        },
    });

    if (!discount) {
        return NextResponse.json(
            { message: "Invalid or expired discount" },
            { status: 404 },
        );
    }

    return NextResponse.json(discount);
}
