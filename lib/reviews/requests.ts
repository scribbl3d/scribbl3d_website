import { prisma } from "@/lib/prisma";
import { isPreLaunchOrder, reviewLinkUrl } from "./link";
import { loadReviewContext } from "./reviewableItems";

/**
 * Review requests: how the review link reached the customer (delivered
 * email, admin shares) and the review status shown on the Delivered tab.
 */

export type AdminReviewStatus =
    | "not_eligible" // not delivered, or refunded/returned
    | "expired" // post-launch order, 30-day link window over
    | "not_shared" // never emailed or shared
    | "shared" // emailed or shared, nothing reviewed yet
    | "partial" // some (not all) reviews submitted
    | "reviewed"; // order-level review and every product reviewed

export type AdminReviewInfo = {
    status: AdminReviewStatus;
    canShare: boolean;
    emailSentAt: string | null;
    firstSharedAt: string | null;
    lastSharedAt: string | null;
    shareCount: number;
};

export async function getAdminReviewInfo(orderId: string, now = new Date()): Promise<AdminReviewInfo> {
    const [context, request] = await Promise.all([
        loadReviewContext(orderId, now),
        prisma.reviewRequest.findUnique({ where: { orderId } }),
    ]);

    let status: AdminReviewStatus;
    if (context.state === "open") {
        const started = context.orderReviewed || context.items.some((item) => item.reviewed);
        if (started) status = "partial";
        else status = request && (request.shareCount > 0 || request.emailSentAt) ? "shared" : "not_shared";
    } else if (context.state === "completed") {
        status = "reviewed";
    } else if (context.state === "expired") {
        status = "expired";
    } else {
        status = "not_eligible";
    }

    return {
        status,
        canShare: context.state === "open",
        emailSentAt: request?.emailSentAt?.toISOString() ?? null,
        firstSharedAt: request?.firstSharedAt?.toISOString() ?? null,
        lastSharedAt: request?.lastSharedAt?.toISOString() ?? null,
        shareCount: request?.shareCount ?? 0,
    };
}

/**
 * Record an admin share. Pre-launch orders start their 15-day coupon
 * window at the first share; post-launch orders use the delivery date.
 */
export async function recordReviewShare(orderId: string, deliveredAt: Date | null, now = new Date()) {
    const windowStart = isPreLaunchOrder(deliveredAt) ? now : deliveredAt;
    const existing = await prisma.reviewRequest.findUnique({ where: { orderId } });

    if (!existing) {
        return prisma.reviewRequest.create({
            data: { orderId, firstSharedAt: now, lastSharedAt: now, shareCount: 1, couponWindowStartsAt: windowStart },
        });
    }
    return prisma.reviewRequest.update({
        where: { orderId },
        data: {
            firstSharedAt: existing.firstSharedAt ?? now,
            lastSharedAt: now,
            shareCount: { increment: 1 },
            couponWindowStartsAt: existing.couponWindowStartsAt ?? windowStart,
        },
    });
}

/** Record that the delivered email (with the review link) was sent */
export async function recordReviewEmailSent(orderId: string, now = new Date()) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { deliveredAt: true } });
    const windowStart = order && !isPreLaunchOrder(order.deliveredAt) ? order.deliveredAt : null;

    return prisma.reviewRequest.upsert({
        where: { orderId },
        create: { orderId, emailSentAt: now, couponWindowStartsAt: windowStart },
        update: { emailSentAt: now },
    });
}

/** WhatsApp/share message (wording supplied by the user) */
export function buildReviewShareMessage(customerName: string | null | undefined, orderId: string): string {
    const firstName = customerName?.trim().split(/\s+/)[0] || "there";
    return [
        `Hi ${firstName},`,
        "How was your SCRIBBL3D experience?",
        "We’d love to hear your feedback. Leave a review and get a discount coupon for your next purchase.",
        `👉 ${reviewLinkUrl(orderId)}`,
        "It only takes a minute. Thank you for choosing SCRIBBL3D!",
    ].join("\n");
}
