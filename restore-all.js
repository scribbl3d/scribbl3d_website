// restore-all.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

import { prisma } from "@/lib/prisma";

function toDate(v) {
    if (!v) return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
}
function toNumber(v) {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
}
function clean(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const out = {};
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v === undefined) continue;
        // keep null (explicit)
        out[k] = v;
    }
    return out;
}

async function upsertMany(prismaModelName, items) {
    if (!Array.isArray(items) || items.length === 0) {
        console.log(`⤷ No items for ${prismaModelName}`);
        return;
    }
    console.log(`🔁 Restoring ${items.length} rows into ${prismaModelName}...`);
    for (const item of items) {
        try {
            if (!item.id) {
                console.warn(
                    `⚠️ Skipping ${prismaModelName} row without id:`,
                    item,
                );
                continue;
            }

            // Basic coercions for common fields
            const create = { ...item };
            const update = { ...item };

            if (create.createdAt) create.createdAt = toDate(create.createdAt);
            if (create.updatedAt) create.updatedAt = toDate(create.updatedAt);
            if (update.createdAt) update.createdAt = toDate(update.createdAt);
            if (update.updatedAt) update.updatedAt = toDate(update.updatedAt);

            if ("price" in create) create.price = toNumber(create.price);
            if ("price" in update) update.price = toNumber(update.price);
            if ("totalAmount" in create)
                create.totalAmount = toNumber(create.totalAmount);
            if ("totalAmount" in update)
                update.totalAmount = toNumber(update.totalAmount);

            // Remove undefined values
            const cleanCreate = clean(create);
            const cleanUpdate = clean(update);

            await prisma[prismaModelName].upsert({
                where: { id: item.id },
                create: cleanCreate,
                update: cleanUpdate,
            });
        } catch (err) {
            console.error(
                `❌ ${prismaModelName} id=${item.id} failed:`,
                err.message || err,
            );
        }
    }
    console.log(`✅ Finished ${prismaModelName}`);
}

async function main() {
    const raw = fs.readFileSync("db-backup.json", "utf8");
    const data = JSON.parse(raw);

    // Restore order (parents first)
    // 1) users, addresses
    await upsertMany("user", data.users || []);
    await upsertMany("address", data.addresses || []);

    // 2) products (your JSON key is "products")
    await upsertMany("product", data.products || []);

    // If product rows embed colors/sizes arrays and you want them extracted,
    // we can parse them after inspecting a sample — see note below.

    // 3) reviews (likely reference users and products)
    await upsertMany("review", data.reviews || []);

    // 4) orders (depends on users)
    await upsertMany("order", data.orders || []);

    // 5) carts and cartItems
    await upsertMany("cart", data.carts || []);
    await upsertMany("cartItem", data.cartItems || []);

    // 6) wishlists
    await upsertMany("wishlist", data.wishlists || []);
    await upsertMany("wishlistItem", data.wishlistItems || []);

    console.log("🎉 Restore run complete. Disconnecting...");
}

main()
    .catch((e) => {
        console.error("Fatal error:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
