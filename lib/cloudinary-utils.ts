import { v2 as cloudinary } from "cloudinary";

export function extractPublicId(cloudinaryUrl: string): string | null {
    try {
        const parts = cloudinaryUrl.split("/");
        const uploadIndex = parts.findIndex((part) => part === "upload");

        if (uploadIndex === -1 || uploadIndex === parts.length - 1) {
            return null;
        }

        const pathParts = parts.slice(uploadIndex + 2);
        const publicIdWithExtension = pathParts.join("/");
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

        return publicId;
    } catch {
        return null;
    }
}

export async function deleteFromCloudinary(
    url: string | null,
    resourceType: "image" | "video" = "image",
): Promise<boolean> {
    if (!url) return false;

    try {
        const publicId = extractPublicId(url);
        if (!publicId) {
            console.warn("Could not extract public ID from URL:", url);
            return false;
        }

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return true;
    } catch (error) {
        console.warn("Cloudinary delete failed for URL:", url, error);
        return false;
    }
}

export async function deleteMultipleFromCloudinary(
    urls: (string | null)[],
    resourceType: "image" | "video" = "image",
): Promise<void> {
    await Promise.allSettled(
        urls.filter(Boolean).map((url) => deleteFromCloudinary(url!, resourceType))
    );
}
