//app/api/wishlist/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =====================================================
   GET → FETCH WISHLIST (NORMALIZED FOR GRID)
===================================================== */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    const wishlist = await prisma.wishlist.findFirst({
        where: { userId: session.user.id },
        include: {
            items: {
                orderBy: { createdAt: "desc" },
                include: {
                    product: true,
                    prebuiltProduct: {
                        include: {
                            images: {
                                where: { isMain: true },
                                take: 1,
                            },
                            variants: {
                                where: { isActive: true },
                                orderBy: { createdAt: "asc" },
                            },
                        },
                    },
                    printer: {
                        include: {
                            images: { orderBy: { sortOrder: "asc" } },
                        },
                    },
                    resin: {
                        include: {
                            colours: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },
                            weights: true,
                        },
                    },
                },
            },
        },
    });

    if (!wishlist) {
        return NextResponse.json({ items: [] });
    }

    const items = wishlist.items
        .map((item) => {
            /* ================= PRINTER ================= */
            if (item.printer) {
                return {
                    id: item.id,
                    itemType: "printer",
                    title: item.printer.name,
                    image: item.printer.images[0]?.url ?? null,
                    badge: item.printer.technology ?? "FDM / FFF",
                    price: item.printer.price,
                    originalPrice: item.printer.originalPrice ?? null,
                    requiresOptions: false,
                    slug: item.printer.slug,
                    inStock: item.printer.inStock ?? true,
                    cartPayload: { printerId: item.printer.id },
                };
            }

            /* ================= RESIN ================= */
            if (item.resin) {
                return {
                    id: item.id,
                    itemType: "resin",
                    title: item.resin.name,
                    image: item.resin.cardImageUrl ?? null,
                    badge: item.resin.technology ?? "Resin",
                    price: item.resin.weights[0]?.price ?? 0,
                    originalPrice: item.resin.weights[0]?.originalPrice ?? 0,
                    requiresOptions: true,
                    slug: item.resin.slug,
                    inStock: item.resin.inStock ?? true,
                    resinColours: item.resin.colours.map((c) => ({
                        id: c.id,
                        name: c.name,
                        hex: c.hexCode ?? null,
                        image: c.images[0]?.url ?? null,
                        inStock: c.inStock ?? true,
                    })),
                    resinWeights: item.resin.weights.map((w) => ({
                        id: w.id,
                        label:
                            w.weightInGrams >= 1000
                                ? `${w.weightInGrams / 1000} kg`
                                : `${w.weightInGrams} g`,
                        price: w.price ?? 0,
                        originalPrice: w.originalPrice ?? 0,
                        inStock: w.inStock ?? true,
                    })),
                    cartPayload: { resinId: item.resin.id },
                };
            }

            /* ================= PREBUILT ================= */
            if (item.prebuiltProduct) {
                const variants = item.prebuiltProduct.variants ?? [];

                const cheapest = variants.reduce(
                    (min: any, v: any) =>
                        !min || v.price < min.price ? v : min,
                    null as any,
                );

                // Product is OOS if product-level flag is false,
                // OR if all active variants are individually OOS
                const allVariantsOOS =
                    variants.length > 0 &&
                    variants.every((v: any) => v.inStock === false);

                return {
                    id: item.id,
                    itemType: "prebuilt",
                    title: item.prebuiltProduct.name,
                    image: item.prebuiltProduct.images?.[0]?.url ?? null,
                    badge: item.prebuiltProduct.category ?? null,
                    price: cheapest?.price ?? 0,
                    originalPrice: cheapest?.originalPrice ?? null,
                    requiresOptions: variants.length > 0,
                    slug: item.prebuiltProduct.slug ?? null,
                    inStock:
                        item.prebuiltProduct.inStock !== false &&
                        !allVariantsOOS,
                    availableVariants: variants.map((v: any) => ({
                        id: v.id,
                        colorName: v.colorName ?? null,
                        colorHex: v.colorHex ?? null,
                        sizeName: v.sizeName ?? null,
                        price: v.price,
                        originalPrice: v.originalPrice ?? 0,
                        isActive: v.isActive,
                        inStock: v.inStock ?? true, // ← ADDED
                    })),
                    cartPayload: { prebuiltProductId: item.prebuiltProduct.id },
                };
            }

            /* ================= PRODUCT (FILAMENT) ================= */
            if (item.product) {
                return {
                    id: item.id,
                    itemType: "product",
                    title: item.product.name,
                    image: item.product.images?.[0] ?? null,
                    badge: item.product.category ?? null,
                    price: item.product.price,
                    originalPrice: item.product.originalPrice ?? null,
                    requiresOptions: false,
                    slug: null,
                    inStock: true,
                    cartPayload: { productId: item.product.id },
                };
            }

            return null;
        })
        .filter(Boolean);

    return NextResponse.json({ items });
}

/* =====================================================
   POST → TOGGLE WISHLIST ITEM
===================================================== */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, prebuiltProductId, printerId, resinId } = body;

    const types = { productId, prebuiltProductId, printerId, resinId };
    const activeType = Object.entries(types).filter(
        ([_, v]) => typeof v === "string",
    );

    if (activeType.length !== 1) {
        return NextResponse.json(
            { error: "Exactly one wishlist item type is required" },
            { status: 400 },
        );
    }

    const [typeKey, typeValue] = activeType[0];

    const wishlist =
        (await prisma.wishlist.findUnique({
            where: { userId: session.user.id },
        })) ??
        (await prisma.wishlist.create({ data: { userId: session.user.id } }));

    const existingItem = await prisma.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, [typeKey]: typeValue },
    });

    if (existingItem) {
        await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
        return NextResponse.json({ removed: true });
    }

    await prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            productId: productId ?? null,
            prebuiltProductId: prebuiltProductId ?? null,
            printerId: printerId ?? null,
            resinId: resinId ?? null,
        },
    });

    return NextResponse.json({ added: true });
}
