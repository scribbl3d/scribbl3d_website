import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } },
) {
    const discount = await prisma.discount.findUnique({
        where: { id: params.id },
        include: { itemTypes: true },
    });

    if (!discount) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(discount);
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    const body = await req.json();

    // Build the update data — only include fields that are present in body
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.valueType !== undefined) updateData.valueType = body.valueType;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isHidden !== undefined) updateData.isHidden = body.isHidden;

    if (body.minOrderValue !== undefined)
        updateData.minOrderValue = body.minOrderValue;
    if (body.maxDiscount !== undefined)
        updateData.maxDiscount = body.maxDiscount;
    if (body.expiresAt !== undefined)
        updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    // Only touch itemTypes if explicitly provided in the request body
    if ("itemTypes" in body) {
        // Delete existing item types first
        await prisma.discountItemType.deleteMany({
            where: { discountId: params.id },
        });

        // Recreate if scope is item_type and types are provided
        if (
            body.scope === "item_type" &&
            Array.isArray(body.itemTypes) &&
            body.itemTypes.length > 0
        ) {
            updateData.itemTypes = {
                create: body.itemTypes.map((t: string) => ({
                    itemType: t,
                })),
            };
        }
    }

    const discount = await prisma.discount.update({
        where: { id: params.id },
        data: updateData,
        include: { itemTypes: true },
    });

    return NextResponse.json(discount);
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } },
) {
    await prisma.discount.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
