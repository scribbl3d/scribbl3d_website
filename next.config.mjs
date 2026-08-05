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
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), usb=()'
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow',
                    },
                    // CSP - Start in report-only mode, then enforce after testing
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: https: res.cloudinary.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "connect-src 'self' https://api.cloudinary.com https://api.postalpincode.in",
                            "frame-src 'self' https://www.google.com",
                            "frame-ancestors 'none'",
                        ].join('; ')
                    }
                ],
            },
        ];
    },

    trailingSlash: false,

    async redirects() {
        return [
            // Home redirect
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            // Fix internal blog redirects
            {
                source: '/blog/monsgeeks-m1w-keychron-q5-pro',
                destination: '/blog/monsgeeks-m1w-keychron-q5-pro/',
                permanent: true,
            },
            {
                source: '/blog/redragon-k617-fizz-60-khytryn-q3-qk',
                destination: '/blog/redragon-k617-fizz-60-khytryn-q3-qk/',
                permanent: true,
            },
            // Moved categories (household-utilities and wall-decor)
            {
                source: '/household-utilities',
                destination: '/prebuilt-products/category/household-utilities',
                permanent: true,
            },
            {
                source: '/wall-decor',
                destination: '/prebuilt-products/category/wall-decor',
                permanent: true,
            },
            // Old removed pages - redirect to relevant pages
            {
                source: '/filaments',
                destination: '/filament',
                permanent: true,
            },
            {
                source: '/best-sellers',
                destination: '/prebuilt-products',
                permanent: true,
            },
            {
                source: '/contact',
                destination: '/',
                permanent: false, // Temporary until contact page is created
            },
            // Old resin test products - redirect to main resins page
            {
                source: '/resins/abs-like-resin',
                destination: '/resins',
                permanent: true,
            },
            {
                source: '/resins/resin-test',
                destination: '/resins',
                permanent: true,
            },
            {
                source: '/resins/elastic-resin',
                destination: '/resins',
                permanent: true,
            },
            // Old filament nylon - redirect to filaments
            {
                source: '/filaments/nylon',
                destination: '/filament',
                permanent: true,
            },
            // Invalid test URL
            {
                source: '/ddsd',
                destination: '/',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
