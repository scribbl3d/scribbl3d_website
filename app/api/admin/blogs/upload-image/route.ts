import { mkdir, readdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        console.log("🔥 ADMIN BLOG IMAGE UPLOAD HIT");

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

        // ✅ SLUGIFY (MUST MATCH DB)
        const folderName = blogTitle
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        // ✅ ABSOLUTE PATH (CRITICAL FOR PROD)
        const uploadDir = join(
            "/var/www/website_with_payment",
            "public",
            "blog-images",
            folderName
        );

        await mkdir(uploadDir, { recursive: true });

        const files = await readdir(uploadDir);
        const sameTypeFiles = files.filter((f) => f.startsWith(type));
        const nextNumber = sameTypeFiles.length + 1;

        const ext = file.name.split(".").pop();
        const fileName = `${type}-${nextNumber}.${ext}`;
        const filePath = join(uploadDir, fileName);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        const imageUrl = `/blog-images/${folderName}/${fileName}`;

        console.log("✅ IMAGE SAVED AT:", filePath);

        return NextResponse.json({ imageUrl });
    } catch (err) {
        console.error("❌ Upload failed:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
