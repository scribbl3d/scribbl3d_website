import {
    CheckoutPricingError,
    priceCheckoutWithItems,
    type PricedCartItem,
} from "@/lib/checkout/pricing";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

// PhonePe merchantTransactionId: letters, digits, _ and -, at most 35 characters
const TRANSACTION_ID = /^[A-Za-z0-9_-]{8,35}$/;

/** Order snapshot line, built from the exact items that were priced */
function snapshotItem(item: PricedCartItem) {
    const base = {
        itemType: item.itemType,
        productId: item.sourceId,
        cartItemId: item.id, // lets payment confirmation clear only these cart rows
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0] ?? null,
    };
    switch (item.itemType) {
        case "resin":
            return { ...base, variantId: item.variantId ?? null, colourId: item.colourId ?? null, size: item.size ?? null, color: item.color ?? null };
        case "prebuilt":
            return { ...base, variantId: item.variantId ?? null, color: item.color ?? null, colorHex: item.colorHex ?? null, size: item.size ?? null };
        case "filament":
            return { ...base, variantId: item.variantId ?? null, size: item.size ?? null, color: item.color ?? null };
        default:
            return base;
    }
}

/* =========================
   CREATE ORDER
========================= */
// Every money value (subtotal, discount, GST, shipping, total) is calculated
// here from the database (lib/checkout/pricing.ts). The total the customer
// saw is only compared: if it differs, the order is not created and the
// up-to-date prices are returned so checkout can show them.
export async function POST(req: Request) {
    try {
        /* ---------- AUTH ---------- */
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        /* ---------- REQUEST BODY ---------- */
        const {
            mode = "cart",
            discountCode = null,
            totalAmount,
            shippingMode, // "Surface" | "Express"
            shippingAddress,
            billingAddress,
            paymentMethod,
            transactionId,
        } = await req.json();

        /* ---------- INPUT VALIDATION ---------- */
        if (mode === "buynow") {
            // Buy-now items came from the browser and cannot be priced safely; no page uses it
            return NextResponse.json(
                { error: "Please add this item to your cart to check out." },
                { status: 400 },
            );
        }
        if (shippingMode !== "Surface" && shippingMode !== "Express") {
            return NextResponse.json(
                { error: "Invalid shipping mode" },
                { status: 400 },
            );
        }
        if (
            typeof transactionId !== "string" ||
            !TRANSACTION_ID.test(transactionId)
        ) {
            return NextResponse.json(
                { error: "Invalid transaction" },
                { status: 400 },
            );
        }
        if (!shippingAddress || typeof shippingAddress !== "object") {
            return NextResponse.json(
                { error: "Shipping address missing" },
                { status: 400 },
            );
        }
        if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount)) {
            return NextResponse.json(
                { error: "Pricing data missing" },
                { status: 400 },
            );
        }

        /* ---------- IDEMPOTENCY ---------- */
        const existingOrder = await prisma.order.findUnique({
            where: { transactionId },
        });
        if (existingOrder) {
            if (existingOrder.userId !== session.user.id) {
                return NextResponse.json(
                    { error: "Invalid transaction" },
                    { status: 409 },
                );
            }
            return NextResponse.json({
                orderId: existingOrder.id,
                status: existingOrder.status,
            });
        }

        /* ---------- SERVER PRICING ---------- */
        let pricing;
        let pricedItems: PricedCartItem[];
        try {
            ({ pricing, items: pricedItems } = await priceCheckoutWithItems({
                userId: session.user.id,
                shippingMode,
                destinationPincode: shippingAddress.pincode,
                discountCode: discountCode ? String(discountCode) : null,
            }));
        } catch (error) {
            if (error instanceof CheckoutPricingError) {
                return NextResponse.json(
                    { error: error.message, code: error.code },
                    { status: 400 },
                );
            }
            throw error;
        }

        if (Math.abs(totalAmount - pricing.totalAmount) > 0.01) {
            return NextResponse.json(
                {
                    error:
                        pricing.shippingPrice > 0
                            ? "Prices have been updated (shipping or discount changed). Please review the new total before paying."
                            : "Prices have been updated. Please review the new total before paying.",
                    code: "PRICE_CHANGED",
                    pricing,
                },
                { status: 409 },
            );
        }

        // Same rows and quantities that were priced and will be charged
        const orderItems = pricedItems.map(snapshotItem);

        /* ---------- CREATE ORDER ---------- */
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                items: orderItems,
                subtotal: pricing.subtotal,
                discountAmount: pricing.discountAmount,
                discountCode: pricing.discountCode,
                tax: pricing.tax,
                shippingPrice: pricing.shippingPrice,
                totalAmount: pricing.totalAmount,
                shippingMode,
                shippingAddress,
                billingAddress,
                paymentMethod,
                status: "payment_pending",
                transactionId,
            },
        });

        return NextResponse.json({ orderId: order.id, status: order.status });
    } catch (error) {
        console.error("[Create Order] Error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 },
        );
    }
}
