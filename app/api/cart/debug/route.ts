// TEMPORARY FILE — place at: app/api/cart/debug/route.ts
// DELETE after debugging

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string };
    } | null;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
        include: { items: true }, // Raw items, no relation includes
    });

    if (!cart) return NextResponse.json({ cart: null, items: [] });

    // For each item, check if the stored FKs still exist
    const diagnostics = await Promise.all(
        cart.items.map(async (item) => {
            const checks: Record<string, any> = {
                cartItemId: item.id,
                storedFKs: {
                    resinId: item.resinId,
                    resinWeightId: item.resinWeightId,
                    resinColourId: item.resinColourId,
                    printerId: item.printerId,
                    prebuiltProductId: item.prebuiltProductId,
                    prebuiltVariantId: item.prebuiltVariantId,
                    filamentId: item.filamentId,
                    filamentVariantId: item.filamentVariantId,
                },
            };

            // Check if each FK still points to a valid record
            if (item.resinId) {
                const resin = await prisma.resin.findUnique({
                    where: { id: item.resinId },
                    select: { id: true, name: true },
                });
                checks.resinExists = resin;
            }

            if (item.resinWeightId) {
                const weight = await prisma.resinWeight.findUnique({
                    where: { id: item.resinWeightId },
                    select: { id: true, price: true, weightInGrams: true },
                });
                checks.weightExists = weight;

                // Also check: how many weights does this resin have now?
                if (item.resinId) {
                    const allWeights = await prisma.resinWeight.findMany({
                        where: { resinId: item.resinId },
                        select: {
                            id: true,
                            price: true,
                            weightInGrams: true,
                        },
                    });
                    checks.allWeightsForResin = allWeights;
                }
            }

            if (item.resinColourId) {
                const colour = await prisma.resinColour.findUnique({
                    where: { id: item.resinColourId },
                    select: { id: true, name: true, hexCode: true },
                });
                checks.colourExists = colour;

                // Also check: how many colours does this resin have now?
                if (item.resinId) {
                    const allColours = await prisma.resinColour.findMany({
                        where: { resinId: item.resinId },
                        select: { id: true, name: true },
                    });
                    checks.allColoursForResin = allColours;
                }
            }

            return checks;
        }),
    );

    return NextResponse.json({ diagnostics }, { status: 200 });
}

// DELETE broken filament items (null variantId)
export async function DELETE() {
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string };
    } | null;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
        where: { userId: session.user.id },
    });

    if (!cart) {
        return NextResponse.json({ message: "No cart found" });
    }

    // Delete filament items with null variant IDs
    const result = await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
            filamentId: { not: null },
            filamentVariantId: null,
        },
    });

    return NextResponse.json({ 
        message: "Deleted broken filament items",
        deletedCount: result.count 
    });
}
