import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function restore() {
    console.log("🔗 DB:", process.env.DATABASE_URL);

    const raw = fs.readFileSync("db-backup.json", "utf-8");
    const data = JSON.parse(raw);

    if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error("❌ No orders array found in backup!");
    }

    console.log("📦 Orders found in backup:", data.orders.length);

    for (const order of data.orders) {
        await prisma.order.upsert({
            where: { id: order.id },
            update: {},
            create: {
                id: order.id,
                userId: order.userId,
                items: order.items,
                totalAmount: order.totalAmount,
                status: order.status,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                paymentMethod: order.paymentMethod,
                transactionId: order.transactionId ?? null,
                createdAt: new Date(order.createdAt),
                trackingInfo: order.trackingInfo ?? undefined,
            },
        });
    }

    console.log("✅ Orders restored successfully");
}

restore()
    .catch((e) => {
        console.error("❌ Restore failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
