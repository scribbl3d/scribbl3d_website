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
        image: "/landing/ecosystem/printer.png",
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
            <div className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {product.name}
                </h3>
                {product.variant && (
                    <p className="text-[10px] sm:text-xs text-gray-400 tracking-wide mt-0.5">
                        {product.variant}
                    </p>
                )}
                <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <span className="text-xs sm:text-sm font-bold text-[#4f46e5]">
                        {product.price}
                    </span>
                    <button
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#4f46e5] hover:border-[#4f46e5] transition-colors"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            className="relative rounded-2xl overflow-hidden group bg-[#0a0a0f] min-h-[280px] sm:min-h-[320px] md:min-h-0 md:row-span-2"
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
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide text-white bg-[#4f46e5] rounded-md z-10">
                    {product.badge}
                </span>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300 max-w-sm leading-relaxed line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-3 sm:mt-4">
                    {product.specs?.map((spec) => (
                        <div key={spec.label}>
                            <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 tracking-wider uppercase">
                                {spec.label}
                            </p>
                            <p className="text-xs sm:text-sm font-mono font-bold text-white">
                                {spec.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <span className="text-xl sm:text-2xl font-bold text-[#4f46e5]">
                        {product.price}
                    </span>
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white border border-white/30 rounded-lg">
                        Add to Cart{" "}
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <section className="w-full bg-white py-10 sm:py-16 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 sm:mb-8">
                    <div>
                        <SplitText className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Best Sellers
                        </SplitText>
                        <AnimatedSubtext className="mt-1 text-xs sm:text-sm text-gray-500">
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

                {/* ── Desktop: hero left + 2×2 grid right ── */}
                <div className="hidden md:grid md:grid-cols-3 gap-4 auto-rows-[240px]">
                    {hero && <HeroCard product={hero} />}
                    {others.map((product) => (
                        <SmallCard key={product.name} product={product} />
                    ))}
                </div>

                {/* ── Mobile: hero on top + horizontal scroll ── */}
                <div className="md:hidden space-y-4">
                    {/* Hero — full width, fixed height so absolute content fits */}
                    {hero && (
                        <Link
                            href={hero.href}
                            className="relative block rounded-2xl overflow-hidden bg-[#0a0a0f] h-[300px]"
                        >
                            <img
                                src={hero.image}
                                alt={hero.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            {hero.badge && (
                                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white bg-[#4f46e5] rounded-md z-10">
                                    {hero.badge}
                                </span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <h3 className="text-lg font-bold text-white">
                                    {hero.name}
                                </h3>
                                {hero.description && (
                                    <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                                        {hero.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-[#c4b5fd]">
                                        {hero.price}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white border border-white/30 rounded-lg">
                                        Add to Cart{" "}
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Small cards — horizontal scroll */}
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
                        {others.map((product) => (
                            <div
                                key={product.name}
                                className="flex-shrink-0 w-[45%] snap-start"
                            >
                                <SmallCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
