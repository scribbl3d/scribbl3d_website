import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =========================
   PATCH → UPDATE VARIANTS
========================= */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ✅ await params
    const body = await req.json();

    const updated = await prisma.wishlistItem.update({
        where: { id },
        data: {
            // productSizeId: body.productSizeId ?? undefined,
            // productColorId: body.productColorId ?? undefined,

            resinColourId: body.resinColourId ?? undefined,
            resinWeightId: body.resinWeightId ?? undefined,

            // prebuiltColor: body.prebuiltColor ?? undefined,
            // prebuiltSize: body.prebuiltSize ?? undefined,
        },
    });

    return NextResponse.json(updated);
}

/* =========================
   DELETE → REMOVE ITEM
========================= */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ✅ await params

    await prisma.wishlistItem.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
