import { prisma } from "@/lib/prisma";

async function main() {
    // Get all valid PrebuiltProduct IDs
    const validProducts = await prisma.prebuiltProducts.findMany({
        select: { id: true },
    });
    const validIds = validProducts.map((p) => p.id);

    // Delete WishlistItems with orphaned prebuiltProductId
    const deleted = await prisma.wishlistItem.deleteMany({
        where: {
            prebuiltProductId: { not: null },
            NOT: { prebuiltProductId: { in: validIds } },
        },
    });

    console.log(`Deleted ${deleted.count} orphaned wishlist items`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
