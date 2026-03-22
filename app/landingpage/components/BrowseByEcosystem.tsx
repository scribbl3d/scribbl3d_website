"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

const CATEGORIES = [
    {
        name: "Filaments",
        description:
            "Over 400+ colors and 12 materials in stock.\nShips within 24 hours.",
        image: "/landing/ecosystem/filament.png",
        href: "/filaments",
        buttonText: "Explore Materials",
        type: "hero", // large card — col-span-2, row-span-2
    },
    {
        name: "Printers",
        description: "Explore our extensive selection of 3D printers.",
        image: "/landing/ecosystem/printer.png",
        href: "/printers",
        type: "small", // small card — centered text
    },
    {
        name: "Resins",
        description: "Explore our extensive selection of resins",
        image: "/landing/ecosystem/resin.png",
        href: "/resins",
        type: "small",
    },
    {
        name: "Prebuilt Products",
        description: "Custom on-demand printing for professionals.",
        image: "/landing/ecosystem/prebuilt.png",
        href: "/prebuilt-products",
        buttonText: "LEARN MORE",
        type: "wide", // wide card — col-span-2, left-aligned text
    },
];

export default function BrowseByEcosystem() {
    return (
        <section className="w-full bg-[#f5f5f5] py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-10 sm:mb-12">
                    <div>
                        <SplitText className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                            Browse by Ecosystem
                        </SplitText>
                        <AnimatedSubtext className="mt-2 text-sm sm:text-base text-gray-500">
                            Everything you need from spool to final prototype.
                        </AnimatedSubtext>
                    </div>
                </div>

                {/* Bento grid — matching reference: 4 cols, 2 rows, fixed height */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 md:h-[650px] lg:h-[700px]">
                    {CATEGORIES.map((cat) => {
                        // Grid span classes
                        const spanClass =
                            cat.type === "hero"
                                ? "md:col-span-2 md:row-span-2"
                                : cat.type === "wide"
                                  ? "md:col-span-2"
                                  : "";

                        return (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className={`relative group overflow-hidden rounded-3xl bg-white shadow-sm min-h-[200px] ${spanClass}`}
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
                                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 lg:p-10">
                                        <h3 className="text-white text-3xl sm:text-4xl font-extrabold mb-3">
                                            {cat.name}
                                        </h3>
                                        {cat.description && (
                                            <p className="text-white/80 text-base sm:text-lg mb-5 max-w-sm whitespace-pre-line">
                                                {cat.description}
                                            </p>
                                        )}
                                        {cat.buttonText && (
                                            <span className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#4f46e5] rounded-xl hover:bg-[#4338ca] transition-colors">
                                                {cat.buttonText}{" "}
                                                <ArrowRight size={20} />
                                            </span>
                                        )}
                                    </div>
                                ) : cat.type === "wide" ? (
                                    /* Wide card — left-aligned, vertically centered */
                                    <div className="absolute inset-y-0 left-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                                        <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-2">
                                            {cat.name}
                                        </h3>
                                        {cat.description && (
                                            <p className="text-white/80 text-sm mb-3 max-w-xs">
                                                {cat.description}
                                            </p>
                                        )}
                                        {cat.buttonText && (
                                            <span className="text-[#a5b4fc] font-bold text-xs uppercase tracking-wider">
                                                {cat.buttonText} →
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    /* Small cards — centered text */
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <h3 className="text-white text-xl sm:text-2xl font-bold">
                                            {cat.name}
                                        </h3>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile link */}
            </div>
        </section>
    );
}
