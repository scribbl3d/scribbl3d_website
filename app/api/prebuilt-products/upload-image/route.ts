import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir } from "fs/promises";
import { join } from "path";
import {
  ASSET_PATHS,
  // URL_PATHS,
  ensureAssetDirectory,
  assetPathToUrl,
} from "@/lib/asset-paths";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productName = formData.get("productName") as string;

    if (!file || !productName) {
      return NextResponse.json(
        { error: "File and product name are required" },
        { status: 400 }
      );
    }

    // Convert product name to lowercase and remove spaces
    const folderName = productName.toLowerCase().replace(/\s+/g, "");
    const uploadDir = join(ASSET_PATHS.PREBUILT_PRODUCT_IMAGES, folderName);

    // Create directory if it doesn't exist
    await ensureAssetDirectory(uploadDir);

    // Read existing files to determine the next number
    const files = await readdir(uploadDir);
    const nextNumber = files.length + 1;

    // Get file extension
    const fileExt = file.name.split(".").pop();
    const newFileName = `${nextNumber}.${fileExt}`;
    const filePath = join(uploadDir, newFileName);

    // Convert file to buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Verify file exists after writing
    const savedFiles = await readdir(uploadDir);
    const fileSaved = savedFiles.includes(newFileName);
    if (!fileSaved) {
      console.error(`File was not saved: ${filePath}`);
      return NextResponse.json(
        { error: "File was not saved after upload." },
        { status: 500 }
      );
    }

    // Log the file path and URL for debugging
    console.log(`Image uploaded: ${filePath}`);
    const imageUrl = assetPathToUrl(filePath);
    console.log(`Image URL: ${imageUrl}`);

    // Return the new image URL and the list of files for debugging
    return NextResponse.json({ imageUrl, files: savedFiles });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
