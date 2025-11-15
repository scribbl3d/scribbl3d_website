import path from "path";

// Base path for storing assets during local development
// Maps to: <project-root>/public
const ASSET_BASE_PATH = path.join(process.cwd(), "public");

// Filesystem paths (LOCAL)
export const ASSET_PATHS = {
    PRODUCT_IMAGES: path.join(ASSET_BASE_PATH, "product-images"),
    PREBUILT_PRODUCT_IMAGES: path.join(ASSET_BASE_PATH, "prodimages"),
    BLOG_IMAGES: path.join(ASSET_BASE_PATH, "blog-images"),
    HERO_IMAGES: path.join(ASSET_BASE_PATH, "hero-images"),
    FILAMENT_IMAGES: path.join(ASSET_BASE_PATH, "filaments", "product_images"),
} as const;

// URL paths (What your DATABASE stores)
export const URL_PATHS = {
    PRODUCT_IMAGES: "/product-images",
    PREBUILT_PRODUCT_IMAGES: "/prodimages",
    BLOG_IMAGES: "/blog-images",
    HERO_IMAGES: "/hero-images",
    FILAMENT_IMAGES: "/filaments/product_images",
} as const;

// convert filesystem → URL
export function assetPathToUrl(assetPath: string): string {
    const relativePath = path.relative(ASSET_BASE_PATH, assetPath);
    return "/" + relativePath.replace(/\\/g, "/");
}

// convert URL → filesystem path
export function urlToAssetPath(urlPath: string): string {
    const cleanPath = urlPath.replace(/^\//, ""); // remove leading slash
    return path.join(ASSET_BASE_PATH, cleanPath);
}

// make folder if it doesn't exist
export async function ensureAssetDirectory(dirPath: string): Promise<void> {
    const fs = await import("fs/promises");
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}
