import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const discounts = await prisma.discount.findMany({
        where: {
            isActive: true,
            isHidden: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
            itemTypes: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(discounts);
}

export async function POST(req: Request) {
    const body = await req.json();

    const discount = await prisma.discount.create({
        data: {
            name: body.name,
            code: body.code.toUpperCase(),
            scope: body.scope,
            valueType: body.valueType,
            value: body.value,
            minOrderValue: body.minOrderValue ?? null,
            maxDiscount: body.maxDiscount ?? null,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
            isHidden: body.isHidden ?? false,
            isActive: body.isActive ?? true,

            itemTypes:
                body.scope === "item_type"
                    ? {
                          create: body.itemTypes.map((t: string) => ({
                              itemType: t,
                          })),
                      }
                    : undefined,
        },
    });

    return NextResponse.json(discount, { status: 201 });
}
