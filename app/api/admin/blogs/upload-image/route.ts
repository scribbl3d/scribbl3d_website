import { mkdir, readdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;
        const blogTitle = formData.get("blogTitle") as string;

        if (!file || !type || !blogTitle) {
            return NextResponse.json(
                { error: "File, type, and blog title are required" },
                { status: 400 }
            );
        }

        // ✅ CORRECT SLUGIFY
        const folderName = blogTitle
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const uploadDir = join(
            process.cwd(),
            "public",
            "blog-images",
            folderName
        );

        // ✅ ENSURE FOLDER EXISTS
        await mkdir(uploadDir, { recursive: true });

        const files = await readdir(uploadDir);
        const sameTypeFiles = files.filter((f) => f.startsWith(type));
        const nextNumber = sameTypeFiles.length + 1;

        const fileExt = file.name.split(".").pop();
        const newFileName = `${type}-${nextNumber}.${fileExt}`;
        const filePath = join(uploadDir, newFileName);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        const imageUrl = `/blog-images/${folderName}/${newFileName}`;

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
