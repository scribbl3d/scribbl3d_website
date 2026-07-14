"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

const CATEGORIES = [
    {
        name: "Filaments",
        description: "Materials built for consistent, high-quality prints.",
        image: "/landing/ecosystem/filament.webp",
        href: "/filament",
        buttonText: "Explore Materials",
        type: "hero", // large card — col-span-2, row-span-2
    },
    {
        name: "Printers",
        description: "",
        image: "/landing/ecosystem/printer.webp",
        href: "/printers",
        type: "small", // small card — centered text
    },
    {
        name: "Resins",
        description: "",
        image: "/landing/ecosystem/resin.webp",
        href: "/resins",
        type: "small",
    },
    {
        name: "Prebuilt Products",
        description: "Beautifully printed designs, ready to own.",
        image: "/landing/ecosystem/prebuilt.webp",
        href: "/prebuilt-products",
        buttonText: "Discover Collection ",
        type: "wide", // wide card — col-span-2, left-aligned text
    },
];

export default function BrowseByEcosystem() {
    return (
        <section
            id="ecosystem"
            className="w-full bg-[#f5f5f5] py-10 sm:py-16 lg:py-24 px-4 sm:px-10 lg:px-16"
        >
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-6 sm:mb-10 lg:mb-12">
                    <div>
                        <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                            Browse by Ecosystem
                        </SplitText>
                        <AnimatedSubtext className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-500">
                            Printers, materials, and products — all in one
                            place.
                        </AnimatedSubtext>
                    </div>
                </div>

                {/* Bento grid — mobile: 2 cols; desktop: 4 cols, 2 rows */}
                <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 sm:gap-5 md:h-[650px] lg:h-[700px]">
                    {CATEGORIES.map((cat) => {
                        // Grid span classes
                        // Mobile: hero = full width (col-span-2), small = 1 col each, wide = full width (col-span-2)
                        // Desktop: hero = 2×2, wide = 2×1, small = 1×1
                        const spanClass =
                            cat.type === "hero"
                                ? "col-span-2 md:row-span-2"
                                : cat.type === "wide"
                                  ? "col-span-2"
                                  : "";

                        // Mobile heights: hero taller, small square-ish, wide shorter
                        const heightClass =
                            cat.type === "hero"
                                ? "min-h-[240px] sm:min-h-[280px] md:min-h-0"
                                : cat.type === "wide"
                                  ? "min-h-[160px] sm:min-h-[200px] md:min-h-0"
                                  : "min-h-[160px] sm:min-h-[200px] md:min-h-0";

                        return (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className={`relative group overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-sm ${spanClass} ${heightClass}`}
                            >
                                {/* Image */}
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay — different per card type */}
                                {cat.type === "hero" ? (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                ) : cat.type === "wide" ? (
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                                ) : (
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                                )}

                                {/* Content */}
                                {cat.type === "hero" ? (
                                    /* Hero card — bottom-left, large text */
                                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 lg:p-10">
                                        <h3 className="text-white text-xl sm:text-3xl lg:text-4xl font-extrabold mb-1 sm:mb-3">
                                            {cat.name}
                                        </h3>
                                        {cat.description && (
                                            <p className="text-white/80 text-xs sm:text-base lg:text-lg mb-3 sm:mb-5 max-w-sm whitespace-pre-line hidden sm:block">
                                                {cat.description}
                                            </p>
                                        )}
                                        {cat.buttonText && (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-white bg-[#4f46e5] rounded-lg sm:rounded-xl hover:bg-[#4338ca] transition-colors">
                                                {cat.buttonText}{" "}
                                                <ArrowRight
                                                    size={16}
                                                    className="sm:w-5 sm:h-5"
                                                />
                                            </span>
                                        )}
                                    </div>
                                ) : cat.type === "wide" ? (
                                    /* Wide card — left-aligned, vertically centered */
                                    <div className="absolute inset-y-0 left-0 p-4 sm:p-8 lg:p-10 flex flex-col justify-center">
                                        <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-extrabold mb-1 sm:mb-2">
                                            {cat.name}
                                        </h3>
                                        {cat.description && (
                                            <p className="text-white/80 text-[11px] sm:text-sm mb-2 sm:mb-3 max-w-[200px] sm:max-w-xs">
                                                {cat.description}
                                            </p>
                                        )}
                                        {cat.buttonText && (
                                            <span className="text-[#a5b4fc] font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                                                {cat.buttonText} →
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    /* Small cards — centered text */
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <h3 className="text-white text-base sm:text-xl lg:text-2xl font-bold">
                                            {cat.name}
                                        </h3>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
