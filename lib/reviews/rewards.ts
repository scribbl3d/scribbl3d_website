import { randomInt } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isPreLaunchOrder } from "./link";

/**
 * Review coupons (C1–C8): one per order, issued on the first review
 * submission of any kind, only inside the 15-day coupon window.
 * 5% off the whole cart, capped at ₹500, single use, valid 15 days,
 * locked to the customer, cancelled if the order is refunded.
 */

export const COUPON_WINDOW_DAYS = 15;
export const COUPON_VALID_DAYS = 15;
export const COUPON_PERCENT = 5;
export const COUPON_MAX_DISCOUNT = 500; // rupees
const DAY_MS = 24 * 60 * 60 * 1000;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

export type IssuedReward = { code: string; issuedAt: Date; expiresAt: Date };

export function generateCouponCode(): string {
    let suffix = "";
    for (let i = 0; i < 8; i++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    return `REV${suffix}`;
}

/**
 * Start of the 15-day window: stored on the review request (delivery date,
 * or first admin share for pre-launch orders). Post-launch orders without a
 * request fall back to the delivery date; pre-launch orders that were never
 * shared have no window.
 */
export function couponWindowStart(deliveredAt: Date | null, storedStart: Date | null | undefined): Date | null {
    if (storedStart) return storedStart;
    if (deliveredAt && !isPreLaunchOrder(deliveredAt)) return deliveredAt;
    return null;
}

export function isWithinCouponWindow(start: Date | null, now = new Date()): boolean {
    return !!start && now.getTime() <= start.getTime() + COUPON_WINDOW_DAYS * DAY_MS;
}

/** Every review from an order that earned a coupon is labelled incentivised */
async function markOrderIncentivised(tx: Prisma.TransactionClient, orderId: string) {
    await Promise.all([
        tx.productReview.updateMany({ where: { orderId, isIncentivised: false }, data: { isIncentivised: true } }),
        tx.orderReview.updateMany({ where: { orderId, isIncentivised: false }, data: { isIncentivised: true } }),
    ]);
}

/**
 * Call after a review submission is saved. Returns the new coupon, or null
 * when the order already has one or is outside the window. Safe to call
 * repeatedly and concurrently (ReviewReward.orderId is unique).
 */
export async function issueReviewReward(orderId: string, now = new Date()): Promise<IssuedReward | null> {
    const [order, existingReward] = await Promise.all([
        prisma.order.findUnique({
            where: { id: orderId },
            select: {
                userId: true,
                deliveredAt: true,
                reviewRequest: { select: { couponWindowStartsAt: true } },
            },
        }),
        prisma.reviewReward.findUnique({ where: { orderId }, select: { id: true } }),
    ]);
    if (!order) return null;

    if (existingReward) {
        // Later reviews on an order that already earned a coupon
        await prisma.$transaction((tx) => markOrderIncentivised(tx, orderId));
        return null;
    }

    const start = couponWindowStart(order.deliveredAt, order.reviewRequest?.couponWindowStartsAt);
    if (!isWithinCouponWindow(start, now)) return null;

    const expiresAt = new Date(now.getTime() + COUPON_VALID_DAYS * DAY_MS);

    for (let attempt = 0; attempt < 3; attempt++) {
        const code = generateCouponCode();
        try {
            await prisma.$transaction(async (tx) => {
                const discount = await tx.discount.create({
                    data: {
                        name: `Review reward · order #${orderId.slice(-8).toUpperCase()}`,
                        code,
                        scope: "cart",
                        valueType: "percentage",
                        value: COUPON_PERCENT,
                        maxDiscount: COUPON_MAX_DISCOUNT,
                        minOrderValue: null,
                        expiresAt,
                        isHidden: true,
                        isActive: true,
                        firstOrderOnly: false,
                        maxUsesPerUser: 1,
                        userId: order.userId,
                    },
                    select: { id: true },
                });
                await tx.reviewReward.create({
                    data: { orderId, userId: order.userId, discountId: discount.id, issuedAt: now },
                });
                await markOrderIncentivised(tx, orderId);
            });
            return { code, issuedAt: now, expiresAt };
        } catch (error) {
            const err = error as { code?: string; meta?: { target?: string[] | string } };
            if (err.code !== "P2002") throw error;
            const target = String(err.meta?.target ?? "");
            if (target.includes("orderId")) return null; // another submission issued it first
            // code collision: retry with a new code
        }
    }
    throw new Error("Could not generate a unique coupon code");
}

/** C7: refunded order → coupon cancelled (deactivated, kept for records) */
export async function cancelReviewReward(orderId: string, now = new Date()) {
    const reward = await prisma.reviewReward.findUnique({
        where: { orderId },
        select: { id: true, discountId: true, cancelledAt: true },
    });
    if (!reward || reward.cancelledAt) return false;
    await prisma.$transaction([
        prisma.reviewReward.update({ where: { id: reward.id }, data: { cancelledAt: now } }),
        prisma.discount.update({ where: { id: reward.discountId }, data: { isActive: false } }),
    ]);
    return true;
}

/**
 * Issue the coupon for a just-saved submission and email it. Never throws:
 * a coupon or email failure must not fail the review itself.
 */
export async function rewardReviewSubmission(orderId: string, reviewerName: string, now = new Date()) {
    try {
        const reward = await issueReviewReward(orderId, now);
        if (!reward) return { issued: false as const };

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { user: { select: { email: true } } },
        });
        const email = order?.user?.email;
        if (email) {
            const { sendReviewCouponEmail } = await import("@/lib/email/index");
            const result = await sendReviewCouponEmail(email, {
                customerName: reviewerName,
                couponCode: reward.code,
                reviewDate: reward.issuedAt,
                expiryDate: reward.expiresAt,
            });
            if (!result?.ok) console.error("[Review reward] Coupon email failed:", result?.error);
        }
        return { issued: true as const };
    } catch (error) {
        console.error("[Review reward] Failed:", error instanceof Error ? error.message : error);
        return { issued: false as const };
    }
}
