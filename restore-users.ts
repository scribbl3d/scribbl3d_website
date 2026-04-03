// restore-users.ts
import crypto from "crypto";
import fs from "fs";

import { prisma } from "@/lib/prisma";

function randomPasswordHash() {
    // Create a random string to satisfy non-null password columns.
    // You can later force-reset these users' passwords in your app if needed.
    return crypto.randomBytes(32).toString("hex");
}

async function restoreUsers() {
    const raw = fs.readFileSync("db-backup.json", "utf-8");
    const data = JSON.parse(raw);

    if (!data.users || !Array.isArray(data.users)) {
        console.error("❌ No users in backup");
        process.exit(1);
    }

    console.log("📦 Users to restore:", data.users.length);

    for (const user of data.users) {
        try {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    email: user.email ?? undefined,
                    name: user.name ?? undefined,
                    googleId: user.googleId ?? undefined,
                    // add any other updatable fields here if you want
                },
                create: {
                    id: user.id,
                    email: user.email ?? null,
                    name: user.name ?? null,
                    googleId: user.googleId ?? null,
                    // Ensure required password exists — we generate a random hex string
                    password: user.password ?? randomPasswordHash(),
                    // include createdAt if present in backup
                    ...(user.createdAt
                        ? { createdAt: new Date(user.createdAt) }
                        : {}),
                    // add other required fields here if your User model requires them:
                    // example: role: user.role ?? "USER"
                },
            });
        } catch (err) {
            console.error("❌ Failed to upsert user:", user.id, err);
            // continue with next user instead of aborting everything
        }
    }

    console.log("✅ Users restored (attempted).");
}

restoreUsers()
    .catch((e) => {
        console.error("❌ Users restore failed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
