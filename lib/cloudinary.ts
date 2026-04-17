import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

/**
 * Optimizes Cloudinary image URLs for better performance
 * Adds automatic format, quality, and sizing transformations
 * 
 * @param url - Cloudinary image URL
 * @param width - Optional max width (default: 1200)
 * @returns Optimized URL with transformations
 * 
 * @example
 * // For large images (hero banners, etc)
 * optimizeCloudinaryUrl(imageUrl) // Max 1200px
 * 
 * @example
 * // For product images
 * optimizeCloudinaryUrl(imageUrl, 800)
 * 
 * @example
 * // For thumbnails
 * optimizeCloudinaryUrl(imageUrl, 400)
 */
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Don't re-optimize if already optimized
  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }

  // Build transformations
  const transformations = [
    'f_auto',           // Auto format (WebP/AVIF based on browser support)
    'q_auto:good',      // Auto quality optimization
    width ? `w_${width}` : 'w_1200',  // Max width
    'c_limit',          // Don't upscale small images
  ].join(',');

  // Insert transformations after '/upload/'
  return url.replace('/upload/', `/upload/${transformations}/`);
}
