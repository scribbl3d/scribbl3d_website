import { CheckoutPricingError, priceCheckout } from "@/lib/checkout/pricing";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

// PhonePe merchantTransactionId: letters, digits, _ and -, at most 35 characters
const TRANSACTION_ID = /^[A-Za-z0-9_-]{8,35}$/;

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
        try {
            pricing = await priceCheckout({
                userId: session.user.id,
                shippingMode,
                destinationPincode: shippingAddress.pincode,
                discountCode: discountCode ? String(discountCode) : null,
            });
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

        let orderItems: any[] = [];

        {
            /* =====================================================
               CART FLOW
            ===================================================== */
            const cart: any = await prisma.cart.findFirst({
                where: { userId: session.user.id },
                include: {
                    items: {
                        include: {
                            /* ── Filament ── */
                            filament: true,
                            filamentVariant: true,

                            /* ── Printer ── */
                            printer: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },

                            /* ── Prebuilt ── */
                            prebuiltProduct: {
                                include: {
                                    images: {
                                        where: { isMain: true },
                                        take: 1,
                                    },
                                },
                            },
                            prebuiltVariant: true,

                            /* ── Resin ── */
                            resin: true,
                            resinWeight: true,
                            resinColour: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },
                        },
                    },
                },
            });

            if (!cart || cart.items.length === 0) {
                return NextResponse.json(
                    { error: "Cart is empty" },
                    { status: 400 },
                );
            }

            orderItems = cart.items.map((item) => {
                /* ── Resin ── */
                if (item.resin) {
                    return {
                        itemType: "resin",
                        productId: item.resin.id,
                        variantId: item.resinWeightId ?? null,
                        colourId: item.resinColourId ?? null,
                        name: item.resin.name,
                        quantity: item.quantity,
                        price: item.resinWeight?.price ?? 0,
                        image: item.resinColour?.images?.[0]?.url ?? null,
                        size: item.resinWeight
                            ? `${item.resinWeight.weightInGrams}g`
                            : null,
                        color: item.resinColour?.name ?? null,
                    };
                }

                /* ── Printer ── */
                if (item.printer) {
                    return {
                        itemType: "printer",
                        productId: item.printer.id,
                        name: item.printer.name,
                        quantity: item.quantity,
                        price: item.printer.price,
                        image: item.printer.images?.[0]?.url ?? null,
                    };
                }

                /* ── Prebuilt ── */
                if (item.prebuiltProduct) {
                    return {
                        itemType: "prebuilt",
                        productId: item.prebuiltProduct.id,
                        variantId: item.prebuiltVariantId ?? null,
                        name: item.prebuiltProduct.name,
                        quantity: item.quantity,
                        price: item.prebuiltVariant?.price ?? 0,
                        color: item.prebuiltVariant?.colorName ?? null,
                        colorHex: item.prebuiltVariant?.colorHex ?? null,
                        size: item.prebuiltVariant?.sizeName ?? null,
                        image: item.prebuiltProduct.images?.[0]?.url ?? null,
                    };
                }

                /* ── Filament ── */
                if (item.filament) {
                    return {
                        itemType: "filament",
                        productId: item.filament.id,
                        variantId: item.filamentVariantId ?? null,
                        name: item.filament.name,
                        quantity: item.quantity,
                        price: item.filamentVariant?.price ?? 0,
                        size: item.filamentVariant
                            ? `${item.filamentVariant.diameter} - ${item.filamentVariant.spoolWeight}`
                            : null,
                        color: item.filament.colorName ?? null,
                        image: item.filament.images?.[0] ?? null,
                    };
                }

                /* ── Fallback ── */
                throw new Error(`Invalid cart item ${item.id}`);
            });
        }

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
