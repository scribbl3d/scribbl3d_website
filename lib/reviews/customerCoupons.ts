import { prisma } from "@/lib/prisma";

/** Customer-locked coupons (review rewards) for the profile "Coupons" tab (C9) */

export type CustomerCouponStatus = "active" | "used" | "expired" | "cancelled";

export type CustomerCoupon = {
    code: string;
    value: number;
    valueType: "percentage" | "flat";
    maxDiscount: number | null;
    expiresAt: string | null;
    status: CustomerCouponStatus;
    orderNumber: string | null; // order whose review earned it
    issuedAt: string;
};

export async function getCustomerCoupons(userId: string, now = new Date()): Promise<CustomerCoupon[]> {
    const discounts = await prisma.discount.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            code: true,
            value: true,
            valueType: true,
            maxDiscount: true,
            expiresAt: true,
            isActive: true,
            maxUsesPerUser: true,
            createdAt: true,
            reviewReward: { select: { orderId: true, cancelledAt: true, issuedAt: true } },
            _count: { select: { usages: true } },
        },
    });

    return discounts.map((d) => {
        let status: CustomerCouponStatus = "active";
        if (d.reviewReward?.cancelledAt || (!d.isActive && d._count.usages === 0)) status = "cancelled";
        else if (d.maxUsesPerUser != null && d._count.usages >= d.maxUsesPerUser) status = "used";
        else if (d.expiresAt && d.expiresAt <= now) status = "expired";
        else if (!d.isActive) status = "cancelled";

        return {
            code: d.code,
            value: d.value,
            valueType: d.valueType,
            maxDiscount: d.maxDiscount,
            expiresAt: d.expiresAt?.toISOString() ?? null,
            status,
            orderNumber: d.reviewReward ? d.reviewReward.orderId.slice(-8).toUpperCase() : null,
            issuedAt: (d.reviewReward?.issuedAt ?? d.createdAt).toISOString(),
        };
    });
}
