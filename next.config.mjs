/** @type {import('next').NextConfig} */
const nextConfig = {
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
        port: "", // Optional if standard https port 443
        pathname: "/**", // Optional if you want to allow any path
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // <<< REMOVE THIS LINE
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Default values, can be kept or removed if defaults are fine
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Default values, can be kept or removed if defaults are fine
    formats: ["image/webp"], // Default value, can be kept or removed
  },
  // If you want to add CSP later, it would go here, for example:
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*', // Apply to all routes
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           // Define your policy carefully, e.g.:
  //           value: "default-src 'self'; img-src 'self' data: blob: images.unsplash.com i.pravatar.cc *.public.blob.vercel-storage.com picsum.photos; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
