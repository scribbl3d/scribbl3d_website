"use client";

import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface BestSellerProduct {
    name: string;
    variant?: string | null;
    price: string;
    image: string;
    href: string;
    description?: string | null;
    specs?: { label: string; value: string }[] | null;
    isHero?: boolean;
}

interface BestSellersProps {
    items: BestSellerProduct[];
}

function formatPrice(price: string) {
    const cleaned = price.replace(/[₹,$\s]/g, "");
    const num = Number(cleaned);
    if (isNaN(num)) return price.startsWith("₹") ? price : `₹${price}`;
    return `₹${num.toLocaleString("en-IN")}`;
}

/* ── Small product card ── */
function SmallCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="bg-[#f3f4f6] rounded-xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col h-full"
        >
            {/* Image area — takes remaining space, shrinks to fit */}
            <div className="p-2 pb-0 flex-1 min-h-0">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </div>
            {/* Text area — fixed, never clipped */}
            <div className="px-2.5 pt-1.5 pb-2 flex-shrink-0">
                <h3 className="text-[11px] font-semibold text-gray-900 truncate">
                    {product.name}
                </h3>
                {product.variant && (
                    <p className="text-[9px] text-gray-400 tracking-wide uppercase mt-0.5">
                        {product.variant}
                    </p>
                )}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-[#4f46e5]">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ── Hero card ── */
function HeroCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="relative rounded-xl overflow-hidden group bg-[#0a0a0f] block w-full h-full"
        >
            <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white bg-[#4f46e5] rounded z-10">
                #1 BEST SELLER
            </span>

            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="text-sm lg:text-base font-bold text-white">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="mt-0.5 text-[10px] text-gray-300 max-w-xs leading-relaxed line-clamp-2">
                        {product.description}
                    </p>
                )}

                {product.specs && product.specs.length > 0 && (
                    <div className="flex items-center gap-3 mt-1.5">
                        {product.specs.map((spec) => (
                            <div key={spec.label}>
                                <p className="text-[7px] font-medium text-gray-400 tracking-wider uppercase">
                                    {spec.label}
                                </p>
                                <p className="text-[9px] font-mono font-bold text-white">
                                    {spec.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm lg:text-base font-bold text-[#4f46e5]">
                        {formatPrice(product.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-medium text-white border border-white/30 rounded-md bg-white/5 backdrop-blur-sm">
                        Add to Cart <ShoppingCart className="w-2.5 h-2.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function BestSellers({ items }: BestSellersProps) {
    if (!items?.length) return null;

    const hero = items.find((p) => p.isHero);
    const others = items.filter((p) => !p.isHero);

    return (
        <section className="w-full bg-white py-8 sm:py-12 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div>
                        <SplitText className="text-lg sm:text-xl font-bold text-gray-900">
                            Best Sellers
                        </SplitText>
                        <AnimatedSubtext className="mt-0.5 text-xs text-gray-500">
                            The most trusted tools in the industry.
                        </AnimatedSubtext>
                    </div>
                    <Link
                        href="/best-sellers"
                        className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#4f46e5] hover:underline"
                    >
                        View All Best Sellers{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* ── Desktop: hero left, 2×2 grid right ── */}
                <div
                    className="hidden md:flex md:gap-3"
                    style={{ height: "460px" }}
                >
                    {hero && (
                        <div className="w-[42%] flex-shrink-0 h-full">
                            <HeroCard product={hero} />
                        </div>
                    )}
                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 h-full">
                        {others.slice(0, 4).map((product) => (
                            <SmallCard key={product.name} product={product} />
                        ))}
                    </div>
                </div>

                {/* ── Mobile: hero on top + horizontal scroll ── */}
                <div className="md:hidden space-y-4">
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
                            <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white bg-[#4f46e5] rounded-md z-10">
                                #1 BEST SELLER
                            </span>
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
                                        {formatPrice(hero.price)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white border border-white/30 rounded-lg">
                                        Add to Cart{" "}
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

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
