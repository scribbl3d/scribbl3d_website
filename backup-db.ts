import fs from "fs";

import { prisma } from "@/lib/prisma";

async function backup() {
    const data = {
        users: await prisma.user.findMany(),
        orders: await prisma.order.findMany(),
        carts: await prisma.cart.findMany(),
        cartItems: await prisma.cartItem.findMany(),
        wishlists: await prisma.wishlist.findMany(),
        wishlistItems: await prisma.wishlistItem.findMany(),
        reviews: await prisma.review.findMany(),
        addresses: await prisma.address.findMany(),
        filaments: await prisma.filament.findMany(),
        prebuiltProducts: await prisma.prebuiltProducts.findMany(),
        printers: await prisma.printer.findMany(),
        resins: await prisma.resin.findMany(),
    };

    fs.writeFileSync("db-backup.json", JSON.stringify(data, null, 2));
    console.log("✅ JSON Backup created: db-backup.json");
}

backup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
