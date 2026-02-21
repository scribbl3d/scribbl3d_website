import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { calculateExpressShipping } from "@/app/checkout/components/expressShipping";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =========================
   CREATE ORDER
========================= */
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
            items,

            subtotal,
            discountAmount = 0,
            discountCode = null,
            shippingPrice = 0,
            tax = 0,

            totalAmount,
            shippingMode, // "Surface" | "Express"

            shippingAddress,
            billingAddress,
            paymentMethod,
            transactionId,
        } = await req.json();

        /* ---------- PRICING VALIDATION ---------- */
        if (subtotal == null || totalAmount == null) {
            return NextResponse.json(
                { error: "Pricing data missing" },
                { status: 400 },
            );
        }

        if (discountAmount < 0) {
            return NextResponse.json(
                { error: "Invalid discount amount" },
                { status: 400 },
            );
        }

        if (shippingPrice < 0) {
            return NextResponse.json(
                { error: "Invalid shipping price" },
                { status: 400 },
            );
        }

        if (tax < 0) {
            return NextResponse.json(
                { error: "Invalid tax amount" },
                { status: 400 },
            );
        }

        /* ---------- MODE NORMALIZATION ---------- */
        const normalizedMode =
            mode === "buynow" || mode === "cart" ? mode : "cart";

        /* ---------- SHIPPING MODE VALIDATION ---------- */
        if (shippingMode !== "Surface" && shippingMode !== "Express") {
            return NextResponse.json(
                { error: "Invalid shipping mode" },
                { status: 400 },
            );
        }

        /* ---------- IDEMPOTENCY ---------- */
        const existingOrder = await prisma.order.findUnique({
            where: { transactionId },
        });

        if (existingOrder) {
            return NextResponse.json({
                orderId: existingOrder.id,
                status: existingOrder.status,
            });
        }

        let orderItems: any[] = [];
        let cartIdToClear: string | null = null;

        /* =====================================================
           BUY NOW FLOW
        ===================================================== */
        if (normalizedMode === "buynow") {
            if (!Array.isArray(items) || items.length !== 1) {
                return NextResponse.json(
                    { error: "Buy Now must contain exactly one item" },
                    { status: 400 },
                );
            }

            const item = items[0];

            orderItems = [
                {
                    itemType: item.itemType,
                    name: item.name,
                    quantity: 1,
                    price: item.price,
                    image: item.images?.[0] ?? null,
                    size: item.size ?? null,
                    color: item.color ?? null,
                },
            ];
        } else {
            /* =====================================================
           CART FLOW
        ===================================================== */
            const cart = await prisma.cart.findFirst({
                where: { userId: session.user.id },
                include: {
                    items: {
                        include: {
                            product: true,
                            printer: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },
                            prebuiltProduct: true,
                            resin: true,
                            resinWeight: true,
                            resinColour: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },
                            productSize: true,
                            productColor: true,
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

            cartIdToClear = cart.id;

            orderItems = cart.items.map((item) => {
                if (item.resin) {
                    return {
                        itemType: "resin",
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

                if (item.printer) {
                    return {
                        itemType: "printer",
                        name: item.printer.name,
                        quantity: item.quantity,
                        price: item.printer.price,
                        image: item.printer.images?.[0]?.url ?? null,
                    };
                }

                if (item.prebuiltProduct) {
                    return {
                        itemType: "prebuilt",
                        name: item.prebuiltProduct.name,
                        quantity: item.quantity,
                        price:
                            item.productSize?.price ??
                            item.prebuiltProduct.price,
                        size: item.productSize?.name ?? null,
                        color: item.productColor?.name ?? null,
                        image: item.prebuiltProduct.images?.[0] ?? null,
                    };
                }

                if (item.product) {
                    return {
                        itemType: "product",
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.productSize?.price ?? item.product.price,
                        size: item.productSize?.name ?? null,
                        color: item.productColor?.name ?? null,
                        image: item.product.images?.[0] ?? null,
                    };
                }

                throw new Error(`Invalid cart item ${item.id}`);
            });
        }

        /* ---------- EXPRESS SHIPPING BACKEND CHECK ---------- */
        if (shippingMode === "Express") {
            const expressCheck = calculateExpressShipping(orderItems);
            if (!expressCheck.allowed) {
                return NextResponse.json(
                    { error: "Express shipping not allowed for this order" },
                    { status: 400 },
                );
            }
        }

        /* ---------- CLEAR CART ---------- */
        if (cartIdToClear) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cartIdToClear },
            });
        }

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,

                items: orderItems,

                subtotal,
                discountAmount,
                discountCode,
                tax,
                shippingPrice,

                totalAmount,
                shippingMode,

                shippingAddress,
                billingAddress,
                paymentMethod,

                status: "payment_pending",
                transactionId,
            },
        });

        return NextResponse.json({
            orderId: order.id,
            status: order.status,
        });
    } catch (error) {
        console.error("[Create Order] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to create order",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
