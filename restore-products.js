// restore-products.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

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

async function upsertAll(modelName, items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log(`⤷ No items for ${modelName}`);
        return;
    }
    console.log(`🔁 Restoring ${items.length} rows into ${modelName}...`);
    for (const item of items) {
        try {
            // Prepare create & update payloads (coerce common fields)
            const create = { ...item };
            const update = { ...item };

            // Convert createdAt/updatedAt if present
            if (create.createdAt) create.createdAt = toDate(create.createdAt);
            if (create.updatedAt) create.updatedAt = toDate(create.updatedAt);
            if (update.createdAt) update.createdAt = toDate(update.createdAt);
            if (update.updatedAt) update.updatedAt = toDate(update.updatedAt);

            // If there's a price field, coerce to number (overwrite whatever is in DB)
            if ("price" in create) create.price = toNumber(create.price);
            if ("price" in update) update.price = toNumber(update.price);

            // Also coerce numeric fields commonly used
            if ("totalAmount" in create)
                create.totalAmount = toNumber(create.totalAmount);
            if ("totalAmount" in update)
                update.totalAmount = toNumber(update.totalAmount);

            // Ensure we don't send undefined to required fields accidentally:
            for (const k of Object.keys(create))
                if (create[k] === undefined) delete create[k];
            for (const k of Object.keys(update))
                if (update[k] === undefined) delete update[k];

            // Do upsert - requires `id` present in backup items
            if (!item.id) {
                console.warn(
                    `⚠️ Skipping item without id in ${modelName}:`,
                    item
                );
                continue;
            }

            await prisma[modelName].upsert({
                where: { id: item.id },
                create,
                update,
            });
        } catch (err) {
            console.error(
                `❌ Failed to upsert into ${modelName} id=${item.id}:`,
                err.message || err
            );
            // continue with next item
        }
    }
    console.log(`✅ Finished ${modelName}`);
}

async function main() {
    const raw = fs.readFileSync("db-backup.json", "utf8");
    const data = JSON.parse(raw);

    // Order matters: create parent products before children (colors/sizes)
    // Adjust keys according to your backup keys if they differ
    await upsertAll(
        "prebuiltProduct",
        data.prebuiltProduct || data.prebuiltProducts || []
    );
    await upsertAll("product", data.product || data.products || []);
    await upsertAll(
        "productColor",
        data.productColor || data.productColors || []
    );
    await upsertAll("productSize", data.productSize || data.productSizes || []);

    console.log("🎉 All done - closing prisma client");
}

main()
    .catch((e) => {
        console.error("Fatal restore error:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
