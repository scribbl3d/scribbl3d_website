import type { ReviewItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isReviewLinkOpen, verifyReviewToken } from "./link";

export type ReviewableItem = {
    index: number;
    itemType: ReviewItemType;
    productId: string;
    name: string;
    image: string | null;
    variantLabel: string | null;
    quantity: number;
    reviewed: boolean;
};

export type ReviewLinkContext =
    | { state: "invalid" | "ineligible" | "expired" | "completed" }
    | {
          state: "open";
          orderId: string;
          orderNumber: string;
          userId: string;
          reviewerName: string;
          orderReviewed: boolean;
          items: ReviewableItem[];
      };

const REVIEW_ITEM_TYPES: ReviewItemType[] = ["printer", "filament", "resin", "prebuilt"];

type SnapshotItem = {
    itemType?: string;
    productId?: string | null;
    name?: string;
    color?: string | null;
    size?: string | null;
    image?: string | null;
    quantity?: number;
};

function parseJson<T>(value: unknown, fallback: T): T {
    if (typeof value === "string") {
        try {
            return JSON.parse(value) as T;
        } catch {
            return fallback;
        }
    }
    return (value as T) ?? fallback;
}

/** E1, E4: fully delivered and not refunded/returned */
export function isOrderReviewable(order: {
    status: string;
    refundStatus: string | null;
    refundId: string | null;
}): boolean {
    return order.status === "delivered" && !order.refundStatus && !order.refundId;
}

export function variantLabelFor(item: SnapshotItem): string | null {
    const label = [item.color, item.size].filter(Boolean).join(" · ");
    return label || null;
}

/** Product field on ProductReview for each item type */
export const PRODUCT_FIELD: Record<ReviewItemType, "printerId" | "filamentId" | "resinId" | "prebuiltProductId"> = {
    printer: "printerId",
    filament: "filamentId",
    resin: "resinId",
    prebuilt: "prebuiltProductId",
};

/**
 * Match an order item to a current product. New orders carry productId;
 * older orders are matched by type + name (+ colour for filaments).
 * Ambiguous or missing matches return null and the item is hidden (R8).
 */
export async function resolveProductId(itemType: ReviewItemType, item: SnapshotItem): Promise<string | null> {
    const name = item.name?.trim();
    const byName = name ? { name: { equals: name, mode: "insensitive" as const } } : null;

    if (itemType === "printer") {
        if (item.productId) return (await prisma.printer.findUnique({ where: { id: item.productId }, select: { id: true } }))?.id ?? null;
        if (!byName) return null;
        const matches = await prisma.printer.findMany({ where: byName, select: { id: true }, take: 2 });
        return matches.length === 1 ? matches[0].id : null;
    }

    if (itemType === "resin") {
        if (item.productId) return (await prisma.resin.findUnique({ where: { id: item.productId }, select: { id: true } }))?.id ?? null;
        if (!byName) return null;
        const matches = await prisma.resin.findMany({ where: byName, select: { id: true }, take: 2 });
        return matches.length === 1 ? matches[0].id : null;
    }

    if (itemType === "prebuilt") {
        if (item.productId) return (await prisma.prebuiltProducts.findUnique({ where: { id: item.productId }, select: { id: true } }))?.id ?? null;
        if (!byName) return null;
        const matches = await prisma.prebuiltProducts.findMany({ where: byName, select: { id: true }, take: 2 });
        return matches.length === 1 ? matches[0].id : null;
    }

    if (item.productId) return (await prisma.filament.findUnique({ where: { id: item.productId }, select: { id: true } }))?.id ?? null;
    if (!byName) return null;
    const color = item.color?.trim();
    const matches = await prisma.filament.findMany({
        where: { ...byName, ...(color ? { colorName: { equals: color, mode: "insensitive" as const } } : {}) },
        select: { id: true },
        take: 2,
    });
    return matches.length === 1 ? matches[0].id : null;
}

export async function loadReviewLink(token: unknown, now = new Date()): Promise<ReviewLinkContext> {
    const orderId = verifyReviewToken(token);
    if (!orderId) return { state: "invalid" };
    return loadReviewContext(orderId, now);
}

/** Same rules as the review link, by order ID (admin share/status) */
export async function loadReviewContext(orderId: string, now = new Date()): Promise<ReviewLinkContext> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            userId: true,
            status: true,
            refundStatus: true,
            refundId: true,
            deliveredAt: true,
            items: true,
            shippingAddress: true,
            user: { select: { name: true } },
            reviews: { select: { orderItemIndex: true } },
            orderReview: { select: { id: true } },
        },
    });

    if (!order || !isOrderReviewable(order)) return { state: "ineligible" };
    if (!isReviewLinkOpen(order.deliveredAt, now)) return { state: "expired" };

    const snapshot = parseJson<SnapshotItem[]>(order.items, []);
    const reviewed = new Set(order.reviews.map((r) => r.orderItemIndex));
    const items: ReviewableItem[] = [];

    const snapshotItems = Array.isArray(snapshot) ? snapshot : [];
    for (let index = 0; index < snapshotItems.length; index++) {
        const item = snapshotItems[index];
        const itemType = item?.itemType?.toLowerCase() as ReviewItemType;
        if (!REVIEW_ITEM_TYPES.includes(itemType)) continue;

        const productId = await resolveProductId(itemType, item);
        if (!productId) continue;

        items.push({
            index,
            itemType,
            productId,
            name: item.name || "Product",
            image: item.image || null,
            variantLabel: variantLabelFor(item),
            quantity: item.quantity || 1,
            reviewed: reviewed.has(index),
        });
    }

    const orderReviewed = !!order.orderReview;
    if (orderReviewed && items.every((i) => i.reviewed)) return { state: "completed" };

    const address = parseJson<{ fullName?: string; name?: string }>(order.shippingAddress, {});
    const reviewerName =
        order.user?.name?.trim() || address.fullName?.trim() || address.name?.trim() || "Verified buyer";

    return {
        state: "open",
        orderId: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        userId: order.userId,
        reviewerName,
        orderReviewed,
        items,
    };
}
