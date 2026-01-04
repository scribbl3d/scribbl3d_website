import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import cloudinary from "../lib/cloudinary";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

function isBrokenCloudinaryUrl(url: string) {
    return (
        url.includes("res.cloudinary.com") && !url.includes("/image/upload/")
    );
}

async function reupload(localPath: string, folder: string) {
    const result = await cloudinary.uploader.upload(localPath, {
        folder,
        resource_type: "image",
    });
    return result.secure_url;
}

async function fixPrebuiltProducts() {
    const products = await prisma.prebuiltProduct.findMany();

    for (const product of products) {
        let changed = false;
        const fixedImages: string[] = [];

        for (const img of product.images) {
            if (!isBrokenCloudinaryUrl(img)) {
                fixedImages.push(img);
                continue;
            }

            // extract original public path from DB url
            const relativePath = img.replace(
                /^https:\/\/res\.cloudinary\.com\/[^/]+/,
                ""
            );

            const localPath = path.join(PUBLIC_DIR, relativePath);

            if (!fs.existsSync(localPath)) {
                console.warn("❌ Local file missing:", relativePath);
                continue;
            }

            console.log("🔁 Re-uploading", relativePath);

            const secureUrl = await reupload(
                localPath,
                path.dirname(relativePath).slice(1)
            );

            fixedImages.push(secureUrl);
            changed = true;
        }

        if (changed) {
            await prisma.prebuiltProduct.update({
                where: { id: product.id },
                data: { images: fixedImages },
            });

            console.log(`✅ Fixed PrebuiltProduct ${product.id}`);
        }
    }
}

async function main() {
    console.log("🚀 Fixing broken Cloudinary URLs");

    await fixPrebuiltProducts();

    console.log("🎉 Broken Cloudinary URLs fixed");
    process.exit(0);
}

main().catch(console.error);
