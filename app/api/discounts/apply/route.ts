// ─── app/api/discounts/apply/route.ts ───

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { validateDiscountEligibility } from "@/app/cart/utils/validateDiscountEligibility";
import { applyRateLimit } from "@/lib/api-helpers";
import { RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Slow down coupon-code guessing
    const rateLimitResult = await applyRateLimit(
        req,
        RateLimits.COUPON.limit,
        RateLimits.COUPON.windowMs,
    );
    if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult, "Too many coupon attempts. Please try again later.");
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code || code.length > 50) {
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
        // Only what the cart needs to show and calculate the discount
        select: {
            id: true,
            name: true,
            code: true,
            scope: true,
            valueType: true,
            value: true,
            minOrderValue: true,
            maxDiscount: true,
            expiresAt: true,
            isActive: true,
            isHidden: true,
            itemTypes: { select: { itemType: true } },
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
