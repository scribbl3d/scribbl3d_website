import { prisma } from "@/lib/prisma";

interface DiscountEligibilityResult {
    eligible: boolean;
    reason?: string;
}

export async function validateDiscountEligibility(
    discountId: string,
    userId: string | null,
): Promise<DiscountEligibilityResult> {
    const discount = await prisma.discount.findUnique({
        where: { id: discountId },
    });

    if (!discount || !discount.isActive) {
        return { eligible: false, reason: "This coupon is no longer active" };
    }

    if (discount.expiresAt && new Date() > discount.expiresAt) {
        return { eligible: false, reason: "This coupon has expired" };
    }

    // If no user is logged in but the coupon has user-level restrictions, block it
    if (
        !userId &&
        (discount.firstOrderOnly || discount.maxUsesPerUser != null)
    ) {
        return {
            eligible: false,
            reason: "Please log in to use this coupon",
        };
    }

    if (!userId) {
        // No user-level restrictions and not logged in — allow
        return { eligible: true };
    }

    // ── CHECK 1: First-order-only ──
    if (discount.firstOrderOnly) {
        const completedOrderCount = await prisma.order.count({
            where: {
                userId,
                // Adjust these statuses to match your Order model's enum/values
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

        if (completedOrderCount > 0) {
            return {
                eligible: false,
                reason: "This coupon is only valid for your first order",
            };
        }
    }

    // ── CHECK 2: Per-user usage limit ──
    if (discount.maxUsesPerUser != null) {
        const usageCount = await prisma.discountUsage.count({
            where: {
                discountId: discount.id,
                userId,
            },
        });

        if (usageCount >= discount.maxUsesPerUser) {
            return {
                eligible: false,
                reason:
                    discount.maxUsesPerUser === 1
                        ? "You have already used this coupon"
                        : `You have already used this coupon ${discount.maxUsesPerUser} time(s)`,
            };
        }
    }

    return { eligible: true };
}

/**
 * Records that a user has redeemed a discount on a specific order.
 * Call AFTER order creation succeeds.
 */
export async function recordDiscountUsage(
    discountId: string,
    userId: string,
    orderId: string,
) {
    await prisma.discountUsage.create({
        data: {
            discountId,
            userId,
            orderId,
        },
    });
}
