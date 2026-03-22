"use client";

import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface BestSellerProduct {
    name: string;
    variant?: string;
    price: string;
    image: string;
    href: string;
    badge?: string;
    description?: string;
    specs?: { label: string; value: string }[];
    isHero?: boolean;
}

// Update these with your actual product data and Cloudinary URLs
const BEST_SELLERS: BestSellerProduct[] = [
    {
        name: "Prism Ultra X1 Pro",
        description:
            "The gold standard for industrial-grade desktop 3D printing. Unmatched precision and speed.",
        price: "₹1,299.00",
        image: "/images/landing/prism-ultra-x1.jpg",
        href: "/printers/prism-ultra-x1-pro",
        badge: "#1 BEST SELLER",
        specs: [
            { label: "PRINT SPEED", value: "500mm/s" },
            { label: "PRECISION", value: "±0.01mm" },
        ],
        isHero: true,
    },
    {
        name: "Elite Matte PLA",
        variant: "SHADOW BLACK",
        price: "₹24.99",
        image: "/images/landing/elite-matte-pla.jpg",
        href: "/filaments/elite-matte-pla",
    },
    {
        name: "Carbon PETG",
        variant: "ICE BLUE",
        price: "₹32.00",
        image: "/images/landing/carbon-petg.jpg",
        href: "/filaments/carbon-petg",
    },
    {
        name: "Tough-HT ABS",
        variant: "CHALK WHITE",
        price: "₹29.50",
        image: "/images/landing/tough-ht-abs.jpg",
        href: "/filaments/tough-ht-abs",
    },
    {
        name: "UV Resin Pro",
        variant: "CLEAR AMBER",
        price: "₹45.00",
        image: "/images/landing/uv-resin-pro.jpg",
        href: "/resins/uv-resin-pro",
    },
];

function SmallCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
        >
            <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {product.name}
                </h3>
                {product.variant && (
                    <p className="text-xs text-gray-400 tracking-wide mt-0.5">
                        {product.variant}
                    </p>
                )}
                <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-[#4f46e5]">
                        {product.price}
                    </span>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#4f46e5] hover:border-[#4f46e5] transition-colors"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
}

function HeroCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="relative rounded-2xl overflow-hidden group row-span-2 bg-[#0a0a0f]"
        >
            {/* Image */}
            <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Badge */}
            {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold tracking-wide text-white bg-[#4f46e5] rounded-md z-10">
                    {product.badge}
                </span>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="mt-2 text-sm text-gray-300 max-w-sm leading-relaxed">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-4">
                    {product.specs?.map((spec) => (
                        <div key={spec.label}>
                            <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">
                                {spec.label}
                            </p>
                            <p className="text-sm font-mono font-bold text-white">
                                {spec.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-[#4f46e5]">
                        {product.price}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg">
                        Add to Cart <ShoppingCart className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function BestSellers() {
    const hero = BEST_SELLERS.find((p) => p.isHero);
    const others = BEST_SELLERS.filter((p) => !p.isHero);

    return (
        <section className="w-full bg-white py-16 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <SplitText className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Best Sellers
                        </SplitText>
                        <AnimatedSubtext className="mt-1 text-sm text-gray-500">
                            The most trusted tools in the industry.
                        </AnimatedSubtext>
                    </div>
                    <Link
                        href="/best-sellers"
                        className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#4f46e5] hover:underline"
                    >
                        View All Best Sellers <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Grid: hero left, 2x2 right */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]">
                    {hero && <HeroCard product={hero} />}
                    {others.map((product) => (
                        <SmallCard key={product.name} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
