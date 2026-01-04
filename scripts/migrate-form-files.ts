import { PrismaClient } from "@prisma/client";
import path from "path";
import cloudinary from "../lib/cloudinary";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function uploadRaw(relativePath: string, folder: string) {
    const localPath = path.join(PUBLIC_DIR, relativePath);

    console.log("⬆️ Uploading", relativePath);

    const uploaded = await cloudinary.uploader.upload(localPath, {
        folder,
        resource_type: "raw",
    });

    return uploaded.secure_url;
}

async function migrateFormResponse() {
    const rows = await prisma.formResponse.findMany({
        where: { prototype: { startsWith: "/" } },
    });

    for (const r of rows) {
        const url = await uploadRaw(r.prototype, "form-uploads/prototype");

        await prisma.formResponse.update({
            where: { id: r.id },
            data: { prototype: url },
        });

        console.log(`✅ FormResponse ${r.id}`);
    }
}

async function migrateSmallBatch() {
    const rows = await prisma.smallBatchManufacturingResponse.findMany({
        where: { designFile: { startsWith: "/" } },
    });

    for (const r of rows) {
        const url = await uploadRaw(r.designFile!, "form-uploads/small-batch");

        await prisma.smallBatchManufacturingResponse.update({
            where: { id: r.id },
            data: { designFile: url },
        });

        console.log(`✅ SmallBatch ${r.id}`);
    }
}

async function migratePrototyping() {
    const rows = await prisma.prototypingRequest.findMany({
        where: { designFile: { startsWith: "/" } },
    });

    for (const r of rows) {
        const url = await uploadRaw(r.designFile!, "form-uploads/prototyping");

        await prisma.prototypingRequest.update({
            where: { id: r.id },
            data: { designFile: url },
        });

        console.log(`✅ Prototyping ${r.id}`);
    }
}

async function migrateForm3D() {
    const rows = await prisma.form3DResponse.findMany({
        where: {
            OR: [
                { fileReference: { startsWith: "/" } },
                { additionalFile: { startsWith: "/" } },
            ],
        },
    });

    for (const r of rows) {
        const data: any = {};

        if (r.fileReference?.startsWith("/")) {
            data.fileReference = await uploadRaw(
                r.fileReference,
                "form-uploads/3d/fileReference"
            );
        }

        if (r.additionalFile?.startsWith("/")) {
            data.additionalFile = await uploadRaw(
                r.additionalFile,
                "form-uploads/3d/additionalFile"
            );
        }

        await prisma.form3DResponse.update({
            where: { id: r.id },
            data,
        });

        console.log(`✅ Form3D ${r.id}`);
    }
}

async function main() {
    console.log("🚀 Migrating form uploads");

    await migrateFormResponse();
    await migrateSmallBatch();
    await migratePrototyping();
    await migrateForm3D();

    console.log("🎉 Form file migration completed");
    process.exit();
}

main();
