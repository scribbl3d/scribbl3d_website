import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function saveFileLocally(
    file: File,
    slug: string
): Promise<string> {
    // 1. Create a safe filename
    // Remove spaces and special chars from filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const filename = `${timestamp}-${originalName}`;

    // 2. Create the directory path: /public/printer_images/[slug]
    const relativeUploadDir = `/printer_images/${slug}`;
    const uploadDir = path.join(process.cwd(), "public", relativeUploadDir);

    try {
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Directory creation error (ignoring if exists)", e);
    }

    // 3. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Write file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 5. Return the public URL
    // This is what we save in the DB (e.g., /printer_images/my-printer/img.png)
    return `${relativeUploadDir}/${filename}`;
}
