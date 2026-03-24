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

/* ── Desktop small product card ── */
function DesktopSmallCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="relative group overflow-hidden rounded-[24px] bg-[#f8f9fa] border border-black/5 p-4 lg:p-5 flex flex-col shadow-sm hover:shadow-lg transition-all duration-500 h-full"
        >
            <div className="relative flex-1 w-full mb-4 lg:mb-5 overflow-hidden rounded-2xl bg-white flex items-center justify-center border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-h-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 lg:p-6 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                />
            </div>

            {/* Text Content */}
            <div className="flex flex-col shrink-0 px-1">
                <div className="flex flex-col">
                    <h4 className="font-bold text-gray-900 text-[14px] lg:text-[15px] line-clamp-2 leading-tight">
                        {product.name}
                    </h4>
                    {product.variant && (
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-0.5 leading-none">
                            {product.variant}
                        </p>
                    )}
                </div>

                {/* Changed items-center to items-start and heavily reduced margin to pull price flush with text */}
                <div className="flex justify-between items-start mt-1.5 lg:mt-2">
                    <span className="font-black text-[16px] lg:text-[18px] text-[#4f46e5] leading-none pt-1">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        className="p-2 lg:p-2.5 bg-[#4f46e5] text-white rounded-xl hover:bg-[#4338ca] transition-colors shadow-sm -mt-1"
                        onClick={(e) => e.preventDefault()}
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ── Mobile small product card (UNTOUCHED) ── */
function SmallCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="bg-[#f3f4f6] rounded-xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col h-full"
        >
            <div className="p-2 pb-0 flex-1 min-h-0">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </div>
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

/* ── Desktop hero card ── */
function HeroCard({ product }: { product: BestSellerProduct }) {
    return (
        <Link
            href={product.href}
            className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[32px] bg-[#0a0a0f] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 block h-full w-full"
        >
            <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-10">
                <span className="bg-[#4f46e5] text-white px-3.5 py-1.5 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-md">
                    #1 Best Seller
                </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 lg:p-8 xl:p-10 w-full z-10">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 lg:gap-6">
                    <div className="max-w-[18rem] lg:max-w-md">
                        <h3 className="text-white text-3xl lg:text-4xl font-black mb-2 lg:mb-3 leading-tight">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-white/70 text-sm lg:text-[15px] mb-4 xl:mb-6 line-clamp-2">
                                {product.description}
                            </p>
                        )}

                        {product.specs && product.specs.length > 0 && (
                            <div className="flex gap-6 lg:gap-8 mb-2 xl:mb-0">
                                {product.specs.map((spec) => (
                                    <div key={spec.label}>
                                        <p className="text-white/40 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest mb-1">
                                            {spec.label}
                                        </p>
                                        <p className="text-white font-mono text-base lg:text-xl font-bold">
                                            {spec.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-left xl:text-right shrink-0">
                        <p className="text-[#818cf8] text-2xl lg:text-3xl font-black mb-3 lg:mb-4">
                            {formatPrice(product.price)}
                        </p>
                        <button
                            className="bg-white text-gray-900 px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl"
                            onClick={(e) => e.preventDefault()}
                        >
                            Add to Cart <ShoppingCart size={18} />
                        </button>
                    </div>
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
        <section className="w-full bg-white py-8 sm:py-16 px-4 sm:px-10 lg:px-16 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-8 sm:mb-10 lg:mb-12">
                    <div>
                        <SplitText className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                            Best Sellers
                        </SplitText>
                        <AnimatedSubtext className="mt-2 text-sm sm:text-base text-gray-500">
                            The most trusted tools in the industry.
                        </AnimatedSubtext>
                    </div>
                    <Link
                        href="/best-sellers"
                        className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#4f46e5] group hover:underline"
                    >
                        View All Best Sellers{" "}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* ── Desktop: CSS Grid Layout ── */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-5 lg:gap-6 h-[580px] lg:h-[680px] xl:h-[740px]">
                    {hero && <HeroCard product={hero} />}
                    {others.slice(0, 4).map((product) => (
                        <DesktopSmallCard
                            key={product.name}
                            product={product}
                        />
                    ))}
                </div>

                {/* ── Mobile: hero on top + horizontal scroll (UNTOUCHED) ── */}
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
