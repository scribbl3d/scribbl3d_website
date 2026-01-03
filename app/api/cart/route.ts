import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =========================
   ADD TO CART
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

        const body = await req.json();
        const {
            productId,
            prebuiltProductId,
            printerId,
            productSizeId,
            productColorId,
            quantity = 1,
        } = body;

        if (!productId && !prebuiltProductId && !printerId) {
            return NextResponse.json(
                { error: "Invalid cart item" },
                { status: 400 }
            );
        }

        /* ---------- FK VALIDATION ---------- */
        if (productId) {
            const exists = await prisma.product.findUnique({
                where: { id: productId },
                select: { id: true },
            });
            if (!exists) {
                return NextResponse.json(
                    { error: "Invalid productId" },
                    { status: 400 }
                );
            }
        }

        if (prebuiltProductId) {
            const exists = await prisma.prebuiltProduct.findUnique({
                where: { id: prebuiltProductId },
                select: { id: true },
            });
            if (!exists) {
                return NextResponse.json(
                    { error: "Invalid prebuiltProductId" },
                    { status: 400 }
                );
            }
        }

        if (printerId) {
            const exists = await prisma.printer.findUnique({
                where: { id: printerId },
                select: { id: true },
            });
            if (!exists) {
                return NextResponse.json(
                    { error: "Invalid printerId" },
                    { status: 400 }
                );
            }
        }

        /* ---------- GET OR CREATE CART ---------- */
        let cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
            });
        }

        /* ---------- BUILD WHERE CLAUSE ---------- */
        const whereClause: any = {
            cartId: cart.id,
            productSizeId: productSizeId ?? null,
            productColorId: productColorId ?? null,
        };

        if (productId) whereClause.productId = productId;
        if (prebuiltProductId)
            whereClause.prebuiltProductId = prebuiltProductId;
        if (printerId) whereClause.printerId = printerId;

        const existingItem = await prisma.cartItem.findFirst({
            where: whereClause,
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                },
            });
        } else {
            const createData: any = {
                cartId: cart.id,
                quantity,
                productSizeId: productSizeId ?? null,
                productColorId: productColorId ?? null,
            };

            if (productId) createData.productId = productId;
            if (prebuiltProductId)
                createData.prebuiltProductId = prebuiltProductId;
            if (printerId) createData.printerId = printerId;

            await prisma.cartItem.create({
                data: createData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/cart error:", error);
        return NextResponse.json(
            { error: "Failed to add to cart" },
            { status: 500 }
        );
    }
}

/* =========================
   GET CART (FINAL & NORMALIZED)
========================= */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    try {
        const cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                        prebuiltProduct: true,
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

        if (!cart) {
            return NextResponse.json({ items: [] });
        }

        const items = cart.items.map((item) => {
            /* ---------- PRINTER ---------- */
            if (item.printer) {
                return {
                    id: item.id,
                    itemType: "printer",
                    name: item.printer.name,
                    price: item.printer.price,
                    quantity: item.quantity,
                    images: item.printer.images.map((i) => i.url),
                };
            }

            /* ---------- PREBUILT PRODUCT ---------- */
            if (item.prebuiltProduct) {
                return {
                    id: item.id,
                    itemType: "prebuilt",
                    name: item.prebuiltProduct.name,
                    price:
                        item.productSize?.price ?? item.prebuiltProduct.price,
                    quantity: item.quantity,
                    images: item.prebuiltProduct.images ?? [],
                    size: item.productSize?.name ?? null,
                    color: item.productColor?.name ?? null,
                };
            }

            /* ---------- NORMAL PRODUCT ---------- */
            if (item.product) {
                return {
                    id: item.id,
                    itemType: "product",
                    name: item.product.name,
                    price: item.productSize?.price ?? item.product.price,
                    quantity: item.quantity,
                    images: item.product.images ?? [],
                    size: item.productSize?.name ?? null,
                    color: item.productColor?.name ?? null,
                };
            }

            /* ---------- SAFETY FALLBACK ---------- */
            return {
                id: item.id,
                itemType: "unknown",
                name: "Unknown item",
                price: 0,
                quantity: item.quantity,
                images: [],
            };
        });

        // 🔥 IMPORTANT: unified response shape
        return NextResponse.json({ items });
    } catch (error) {
        console.error("GET /api/cart error:", error);
        return NextResponse.json({ items: [] });
    }
}
