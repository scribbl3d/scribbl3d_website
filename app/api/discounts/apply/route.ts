// ─── app/api/discounts/apply/route.ts ───

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { validateDiscountEligibility } from "@/app/cart/utils/validateDiscountEligibility";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
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

    // ── Check user-level eligibility (first-order / usage limit) ──
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string };
    } | null;
    const userId = session?.user?.id ?? null;

    const { eligible, reason } = await validateDiscountEligibility(
        discount.id,
        userId,
    );

    if (!eligible) {
        return NextResponse.json({ message: reason }, { status: 400 });
    }

    return NextResponse.json(discount);
}
