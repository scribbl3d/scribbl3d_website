import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'thumbnail' or 'hero'
    const blogTitle = formData.get("blogTitle") as string;

    if (!file || !type || !blogTitle) {
      return NextResponse.json(
        { error: "File, type, and blog title are required" },
        { status: 400 }
      );
    }

    // Sanitize folder name: remove special characters, colons, and spaces
    const folderName = blogTitle
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "") // only allow a-z, 0-9, dash, underscore
      .replace(/\s+/g, "");
    const uploadDir = join(process.cwd(), "public", "blog-images", folderName);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Read existing files to determine the next number
    const files = await readdir(uploadDir);
    const nextNumber = files.length + 1;

    // Get file extension
    const fileExt = file.name.split(".").pop();
    const newFileName = `${type}-${nextNumber}.${fileExt}`;
    const filePath = join(uploadDir, newFileName);

    // Convert file to buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the new image URL
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
