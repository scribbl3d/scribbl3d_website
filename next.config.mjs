/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    compiler: {
        styledComponents: true,
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        middlewareClientMaxBodySize: '50mb',
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    compress: true,
    poweredByHeader: false,

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
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60,
        unoptimized: false,
    },
    
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow',
                    },
                ],
            },
        ];
    },

    trailingSlash: false,

    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
