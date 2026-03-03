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
                    prebuiltProduct: true,
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
                    cartPayload: { printerId: item.printer.id },
                };
            }
            /*
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
                    resinColours: item.resin.colours.map((c) => ({
                        id: c.id,
                        name: c.name,
                        hex: c.hexCode ?? null,
                        image: c.images[0]?.url ?? null,
                    })),

                    resinWeights: item.resin.weights.map((w) => ({
                        id: w.id,
                        label: w.weightInGrams,
                        price: w.price ?? 0,
                        originalPrice: w.originalPrice ?? 0,
                    })),
                    cartPayload: { resinId: item.resin.id },
                };
            }

            /* ================= PREBUILT ================= */
            // if (item.prebuiltProduct) {
            //     return {
            //         id: item.id,
            //         itemType: "prebuilt",
            //         title: item.prebuiltProduct.name,
            //         image: item.prebuiltProduct.images?.[0] ?? null,
            //         badge: item.prebuiltProduct.category ?? null,
            //         price: item.prebuiltProduct.price,
            //         originalPrice: item.prebuiltProduct.originalPrice ?? null,
            //         requiresOptions: true,
            //         availableColours: item.prebuiltProduct.availableColors.map(
            //             (color) => ({
            //                 label: color,
            //             })
            //         ),

            //         availableSizes: item.prebuiltProduct.availableSizes.map(
            //             (size) => ({
            //                 label: size,
            //             })
            //         ),
            //         cartPayload: { prebuiltProductId: item.prebuiltProduct.id },
            //     };
            // }

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
                    cartPayload: { productId: item.product.id },
                };
            }

            return null;
        })
        .filter(Boolean);

    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
        productId,
        prebuiltProductId,
        printerId,
        resinId,

        productSizeId,
        productColorId,
        resinColourId,
        resinWeightId,
        prebuiltColor,
        prebuiltSize,
    } = body;

    /* ---------- ENSURE EXACTLY ONE TYPE ---------- */
    const types = {
        productId,
        prebuiltProductId,
        printerId,
        resinId,
    };

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

    /* ---------- GET OR CREATE WISHLIST ---------- */
    const wishlist =
        (await prisma.wishlist.findUnique({
            where: { userId: session.user.id },
        })) ??
        (await prisma.wishlist.create({
            data: { userId: session.user.id },
        }));

    /* ---------- CHECK EXISTING (TYPE SAFE) ---------- */
    const existingItem = await prisma.wishlistItem.findFirst({
        where: {
            wishlistId: wishlist.id,
            [typeKey]: typeValue,
        },
    });

    /* ---------- TOGGLE OFF ---------- */
    if (existingItem) {
        await prisma.wishlistItem.delete({
            where: { id: existingItem.id },
        });

        return NextResponse.json({ removed: true });
    }

    /* ---------- TOGGLE ON ---------- */
    await prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,

            productId: productId ?? null,
            prebuiltProductId: prebuiltProductId ?? null,
            printerId: printerId ?? null,
            resinId: resinId ?? null,

            // productSizeId: productSizeId ?? null,
            // productColorId: productColorId ?? null,

            resinColourId: resinColourId ?? null,
            resinWeightId: resinWeightId ?? null,

            // prebuiltColor: prebuiltColor ?? null,
            // prebuiltSize: prebuiltSize ?? null,
        },
    });

    return NextResponse.json({ added: true });
}
