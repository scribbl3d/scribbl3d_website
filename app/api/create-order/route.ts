import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =========================
   CREATE ORDER (CART + BUY NOW)
========================= */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            mode = "cart",
            items,
            totalAmount,
            shippingAddress,
            billingAddress,
            paymentMethod,
            transactionId,
        } = await req.json();

        // ✅ Normalize mode
        const normalizedMode =
            mode === "buynow" || mode === "cart" ? mode : "cart";

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

        /* =====================================================
       BUY NOW FLOW (NO CART EVER)
    ===================================================== */
        if (normalizedMode === "buynow") {
            if (!Array.isArray(items) || items.length !== 1) {
                return NextResponse.json(
                    { error: "Buy Now must contain exactly one item" },
                    { status: 400 }
                );
            }

            const item = items[0];

            orderItems = [
                {
                    name: item.name,
                    quantity: 1, // 🔒 FORCE 1
                    price: item.price,
                    image: item.images?.[0] ?? null,
                    size: item.size ?? null,
                    color: item.color ?? null,
                },
            ];
        } else {

        /* =====================================================
       CART FLOW (DEFAULT)
    ===================================================== */
            const cart = await prisma.cart.findFirst({
                where: { userId: session.user.id },
                include: {
                    items: {
                        include: {
                            product: true,
                            prebuiltProduct: {
                                include: { sizes: true, colors: true },
                            },
                            printer: {
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
                    { status: 400 }
                );
            }

            orderItems = cart.items.map((item) => {
                if (item.printer) {
                    return {
                        name: item.printer.name,
                        quantity: item.quantity,
                        price: item.printer.price,
                        image: item.printer.images?.[0]?.url || null,
                    };
                }

                if (item.prebuiltProduct) {
                    return {
                        name: item.prebuiltProduct.name,
                        quantity: item.quantity,
                        price:
                            item.productSize?.price ??
                            item.prebuiltProduct.price,
                        size: item.productSize?.name ?? null,
                        color: item.productColor?.name ?? null,
                        image: item.prebuiltProduct.images?.[0] || null,
                    };
                }

                if (item.product) {
                    return {
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.productSize?.price ?? item.product.price,
                        size: item.productSize?.name ?? null,
                        color: item.productColor?.name ?? null,
                        image: item.product.images?.[0] || null,
                    };
                }

                throw new Error(`Invalid cart item: ${item.id}`);
            });

            // ✅ Clear cart ONLY for cart checkout
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        /* =====================================================
       CREATE ORDER
    ===================================================== */
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                items: JSON.stringify(orderItems),
                totalAmount,
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
            { status: 500 }
        );
    }
}
