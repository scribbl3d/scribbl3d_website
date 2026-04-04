// ─── app/api/discounts/route.ts ───

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get("admin") === "true";

    if (isAdminView) {
        const adminDiscounts = await prisma.discount.findMany({
            include: {
                itemTypes: true,
                _count: {
                    select: { usages: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(adminDiscounts);
    }

    let discounts = await prisma.discount.findMany({
        where: {
            isActive: true,
            isHidden: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
            itemTypes: true,
            _count: {
                select: { usages: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // ── Filter out ineligible coupons for the current user ──
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string };
    } | null;
    const userId = session?.user?.id ?? null;

    if (userId) {
        // Check if this is the user's first order
        const completedOrderCount = await prisma.order.count({
            where: {
                userId,
                status: {
                    in: [
                        "completed",
                        "shipped",
                        "delivered",
                        "processing",
                        "confirmed",
                    ],
                },
            },
        });

        const isFirstOrder = completedOrderCount === 0;

        // Hide first-order-only coupons from returning users
        if (!isFirstOrder) {
            discounts = discounts.filter((d) => !d.firstOrderOnly);
        }

        // Hide coupons the user has fully exhausted
        const usages = await prisma.discountUsage.groupBy({
            by: ["discountId"],
            where: { userId },
            _count: { id: true },
        });

        const usageMap = new Map(
            usages.map((u) => [u.discountId, u._count.id]),
        );

        discounts = discounts.filter((d) => {
            if (d.maxUsesPerUser == null) return true; // unlimited
            const used = usageMap.get(d.id) ?? 0;
            return used < d.maxUsesPerUser;
        });
    } else {
        // Not logged in — hide first-order-only coupons (can't verify eligibility)
        discounts = discounts.filter((d) => !d.firstOrderOnly);
    }

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
            firstOrderOnly: body.firstOrderOnly ?? false,
            maxUsesPerUser: body.maxUsesPerUser ?? null,

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
