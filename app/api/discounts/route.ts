import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const discounts = await prisma.discount.findMany({
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(discounts);
}

export async function POST(req: Request) {
    const body = await req.json();

    const discount = await prisma.discount.create({
        data: {
            name: body.name,
            code: body.code,
            scope: body.scope,
            applicableItemType: body.applicableItemType || null,
            valueType: body.valueType,
            value: body.value,
            minCartValue: body.minCartValue ?? null,
            isActive: true,
        },
    });

    return NextResponse.json(discount, { status: 201 });
}
