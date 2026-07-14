import { prisma } from "@/lib/prisma";
import LandingContent from "./landingpage/components/LandingContent";

async function getLandingData() {
    const [
        heroBanners,
        latestPrinter,
        latestFilament,
        latestResin,
        latestPrebuilt,
        blogs,
        communityImages,
        testimonials,
        bestSellers,
    ] = await Promise.all([
        prisma.heroBanner.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
        }),

        // 1 latest printer
        prisma.printer.findFirst({
            where: { inStock: true },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                shortDescription: true,
                images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true },
                },
                updatedAt: true,
            },
        }),

        // 1 latest filament
        prisma.product.findFirst({
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                images: true,
                category: true,
                color: true,
                updatedAt: true,
            },
        }),

        // 1 latest resin — fetch cardImageUrl + all images from first colour as fallback
        prisma.resin.findFirst({
            where: { inStock: true },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                cardImageUrl: true,
                images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true },
                },
                colours: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: {
                        images: {
                            orderBy: { sortOrder: "asc" },
                            take: 1,
                            select: { url: true },
                        },
                    },
                },
                weights: {
                    where: { inStock: true },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { price: true, originalPrice: true },
                },
                updatedAt: true,
            },
        }),

        // 1 latest prebuilt
        prisma.prebuiltProducts.findFirst({
            where: { inStock: true },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                images: {
                    orderBy: [{ isMain: "desc" }, { position: "asc" }],
                    take: 1,
                    select: { url: true },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { price: "asc" },
                    take: 1,
                    select: { price: true, originalPrice: true },
                },
                updatedAt: true,
            },
        }),

        // Blogs
        prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
                id: true,
                title: true,
                description: true,
                keywords: true,
                thumbnailImage: true,
                createdAt: true,
            },
        }),

        // Community Showcase images
        prisma.communityImage.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                imageUrl: true,
                altText: true,
                linkPath: true,
            },
        }),

        // Customer Testimonials
        prisma.customerTestimonial.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                quote: true,
                name: true,
                role: true,
                initials: true,
                rating: true,
            },
        }),

        // Best Sellers
        prisma.bestSeller.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                name: true,
                variant: true,
                price: true,
                image: true,
                href: true,
                description: true,
                specs: true,
                isHero: true,
            },
        }),
    ]);

    // Build new arrivals — 1 from each type
    const newArrivals: any[] = [];

    if (latestPrinter) {
        newArrivals.push({
            id: latestPrinter.id,
            name: latestPrinter.name,
            price: latestPrinter.price,
            originalPrice: latestPrinter.originalPrice,
            description: latestPrinter.shortDescription,
            image: latestPrinter.images[0]?.url || null,
            type: "printer",
            updatedAt: latestPrinter.updatedAt,
            href: `/printers/${latestPrinter.slug}`,
        });
    }

    if (latestFilament) {
        newArrivals.push({
            id: latestFilament.id,
            name: latestFilament.name,
            price: latestFilament.price,
            originalPrice: latestFilament.originalPrice,
            description: `${latestFilament.category} · ${latestFilament.color}`,
            image: latestFilament.images?.[0] || null,
            type: "filament",
            updatedAt: latestFilament.updatedAt,
            href: `/filament`,
        });
    }

    if (latestResin) {
        // Fallback chain: cardImageUrl → resin-level images → first colour's image → null
        const resinImage =
            latestResin.cardImageUrl ||
            latestResin.images?.[0]?.url ||
            latestResin.colours?.[0]?.images?.[0]?.url ||
            null;

        newArrivals.push({
            id: latestResin.id,
            name: latestResin.name,
            price: latestResin.weights[0]?.price || 0,
            originalPrice: latestResin.weights[0]?.originalPrice || null,
            description: latestResin.shortDescription,
            image: resinImage,
            type: "resin",
            updatedAt: latestResin.updatedAt,
            href: `/resins/${latestResin.slug}`,
        });
    }

    if (latestPrebuilt) {
        newArrivals.push({
            id: latestPrebuilt.id,
            name: latestPrebuilt.name,
            price: latestPrebuilt.variants[0]?.price || 0,
            originalPrice: latestPrebuilt.variants[0]?.originalPrice || null,
            description: latestPrebuilt.shortDescription,
            image: latestPrebuilt.images[0]?.url || null,
            type: "prebuilt",
            updatedAt: latestPrebuilt.updatedAt,
            href: `/prebuilt-products/${latestPrebuilt.slug}`,
        });
    }

    newArrivals.sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return {
        heroBanners: JSON.parse(JSON.stringify(heroBanners)),
        newArrivals: JSON.parse(JSON.stringify(newArrivals)),
        blogs: JSON.parse(JSON.stringify(blogs)),
        communityImages: JSON.parse(JSON.stringify(communityImages)),
        testimonials: JSON.parse(JSON.stringify(testimonials)),
        bestSellers: JSON.parse(JSON.stringify(bestSellers)),
    };
}

export default async function Home() {
    const {
        heroBanners,
        newArrivals,
        blogs,
        communityImages,
        testimonials,
        bestSellers,
    } = await getLandingData();

    return (
        <main className="w-full">
            <LandingContent
                heroBanners={heroBanners}
                newArrivals={newArrivals}
                blogs={blogs}
                communityImages={communityImages}
                testimonials={testimonials}
                bestSellers={bestSellers}
            />
        </main>
    );
}
