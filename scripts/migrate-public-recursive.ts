import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import cloudinary from "../lib/cloudinary";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

const ROOT_FOLDERS = ["filaments"];

// ✅ FIX 1: make walk async + await everything
async function walk(dir: string, cb: (file: string) => Promise<void>) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            await walk(full, cb);
        } else {
            await cb(full);
        }
    }
}

async function migrateFile(fullPath: string) {
    const relative = fullPath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");
    const folder = path.dirname(relative).slice(1);

    console.log("⬆️ Uploading", relative);

    const uploaded = await cloudinary.uploader.upload(fullPath, {
        folder,
        resource_type: "auto",
    });

    console.log("✅ Uploaded to:", uploaded.secure_url);

    const newUrl = uploaded.secure_url;

    // ---------- DB UPDATES ----------

    await prisma.blog.updateMany({
        where: {
            OR: [{ thumbnailImage: relative }, { heroImage: relative }],
        },
        data: {
            thumbnailImage: newUrl,
            heroImage: newUrl,
        },
    });

    await prisma.heroImage.updateMany({
        where: { imageUrl: relative },
        data: { imageUrl: newUrl },
    });

    await prisma.carouselItem.updateMany({
        where: { src: relative },
        data: { src: newUrl },
    });

    await prisma.printerImage.updateMany({
        where: { url: relative },
        data: { url: newUrl },
    });

    console.log("🔁 DB updated for", relative);
}

async function main() {
    console.log("🚀 Starting recursive migration");

    for (const root of ROOT_FOLDERS) {
        const rootPath = path.join(PUBLIC_DIR, root);
        if (!fs.existsSync(rootPath)) continue;

        // ✅ FIX 2: await walk
        await walk(rootPath, migrateFile);
    }

    console.log("🎉 Migration finished");

    // ✅ Clean shutdown
    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error("❌ Migration failed:", err);
    await prisma.$disconnect();
    process.exit(1);
});
