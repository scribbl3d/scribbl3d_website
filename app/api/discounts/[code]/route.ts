import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    context: { params: Promise<{ code: string }> },
) {
    const { code } = await context.params;

    const discount = await prisma.discount.findFirst({
        where: {
            code,
            isActive: true,
        },
    });

    if (!discount) {
        return NextResponse.json(
            { message: "Invalid discount code" },
            { status: 404 },
        );
    }

    return NextResponse.json(discount);
}
