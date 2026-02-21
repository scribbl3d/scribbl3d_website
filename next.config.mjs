/** @type {import('next').NextConfig} */
const nextConfig = {
    // 🔥 ADD THIS BLOCK
    eslint: {
        ignoreDuringBuilds: true,
    },
    compiler: {
        // This is the specific patch for Next.js production builds
        styledComponents: true,
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
            },
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
        dangerouslyAllowSVG: true,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ["image/webp"],
    },
};

export default nextConfig;
