import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* =========================
   GET DISCOUNT BY ID
========================= */
export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;

    const discount = await prisma.discount.findUnique({
        where: { id },
        include: { itemTypes: true },
    });

    if (!discount) {
        return NextResponse.json(
            { error: "Discount not found" },
            { status: 404 },
        );
    }

    return NextResponse.json(discount);
}

/* =========================
   UPDATE DISCOUNT
========================= */
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;
    const body = await req.json();

    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.valueType !== undefined) updateData.valueType = body.valueType;
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isHidden !== undefined) updateData.isHidden = body.isHidden;

    if (body.minOrderValue !== undefined)
        updateData.minOrderValue =
            body.minOrderValue === null ? null : Number(body.minOrderValue);

    if (body.maxDiscount !== undefined)
        updateData.maxDiscount =
            body.maxDiscount === null ? null : Number(body.maxDiscount);

    if (body.expiresAt !== undefined)
        updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    // ── NEW: Usage restriction fields ──
    if (body.firstOrderOnly !== undefined)
        updateData.firstOrderOnly = body.firstOrderOnly;

    if (body.maxUsesPerUser !== undefined)
        updateData.maxUsesPerUser =
            body.maxUsesPerUser === null ? null : Number(body.maxUsesPerUser);

    /* ---------- ITEM TYPES ---------- */
    if (
        "itemTypes" in body &&
        body.scope === "item_type" &&
        Array.isArray(body.itemTypes) &&
        body.itemTypes.length > 0
    ) {
        await prisma.discountItemType.deleteMany({
            where: { discountId: id },
        });
        
        updateData.itemTypes = {
            create: body.itemTypes.map((t: string) => ({
                itemType: t,
            })),
        };
    }

    const updated = await prisma.discount.update({
        where: { id },
        data: updateData,
        include: { itemTypes: true },
    });

    return NextResponse.json(updated);
}

/* =========================
   DELETE DISCOUNT
========================= */
export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;

    await prisma.discount.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
