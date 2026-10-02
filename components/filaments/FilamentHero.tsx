"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const wordVariant = {
    hidden: { y: 60, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", damping: 15, stiffness: 100 },
    },
};

const subtextVariant = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut", delay: 0.8 },
    },
};

type HeroData = {
    mediaUrl: string;
    mediaType: string;
    headline: string | null;
    subtext: string | null;
    showGradient?: boolean;
};

// Mirrors the currently admin-configured hero (GET /api/page-hero/filaments) so the
// first paint already matches what the fetch below will return — no flash/swap.
// If the admin changes the filament hero image, update this to match.
const FALLBACK: HeroData = {
    mediaUrl:
        "https://res.cloudinary.com/dlbrgchrh/image/upload/v1790676317/hero/filaments/wgjrydwonx7erxsn2sr3.jpg",
    mediaType: "image",
    headline: null,
    subtext: null,
    showGradient: false,
};

interface FilamentHeroProps {
    animate?: boolean;
    activeMaterial?: string;
    onMaterialSelect: (material: string) => void;
}

// Fallback materials in case API fails
const FALLBACK_MATERIALS = ["PLA+", "ABS", "PETG", "TPU", "PA"];

// Custom material order
const MATERIAL_ORDER = ["PLA+", "ABS", "PETG", "TPU", "PA"];

// Sort materials with custom order
const sortMaterials = (materials: string[]): string[] => {
    return materials.sort((a, b) => {
        const indexA = MATERIAL_ORDER.indexOf(a);
        const indexB = MATERIAL_ORDER.indexOf(b);
        
        // If both are in the custom order, sort by their position
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        
        // If only A is in custom order, it comes first
        if (indexA !== -1) return -1;
        
        // If only B is in custom order, it comes first
        if (indexB !== -1) return 1;
        
        // Otherwise, sort alphabetically
        return a.localeCompare(b);
    });
};

export default function FilamentHero({ animate = true, activeMaterial, onMaterialSelect }: Readonly<FilamentHeroProps>) {
    const [hero, setHero] = useState<HeroData>(FALLBACK);
    const [materials, setMaterials] = useState<string[]>(FALLBACK_MATERIALS);

    // Fetch hero data
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/page-hero/filaments");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.mediaUrl) {
                        setHero({
                            mediaUrl: data.mediaUrl,
                            mediaType: data.mediaType || "image",
                            headline: data.headline,
                            subtext: data.subtext,
                            showGradient: data.showGradient ?? true,
                        });
                    }
                }
            } catch {
                // Keep fallback
            }
        })();
    }, []);

    // Fetch materials from database
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/filaments/filters");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.materials && data.materials.length > 0) {
                        setMaterials(sortMaterials(data.materials));
                    }
                }
            } catch {
                // Keep fallback materials
            }
        })();
    }, []);

    const hasText = hero.headline || hero.subtext;
    const wordOccurrences = new Map<string, number>();
    const headlineWords = hero.headline?.split(" ").map((word) => {
        const occurrence = (wordOccurrences.get(word) ?? 0) + 1;
        wordOccurrences.set(word, occurrence);
        return { word, key: `${word}-${occurrence}` };
    });

    return (
        <>
            {/* Natural-height image/video layout — same pattern as printers/resins/prebuilt */}
            <section className="relative w-full overflow-hidden bg-[#f0f0f0] mt-[72px]">
                {hero.mediaType === "video" ? (
                    <video
                        src={hero.mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-auto block"
                    />
                ) : (
                    <img fetchPriority="high"
                        src={hero.mediaUrl}
                        alt={hero.headline || "Hero"}
                        className="w-full h-auto block"
                    />
                )}

                {hero.showGradient !== false && (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
                )}

                {hasText && (
                    <div className="absolute inset-0 z-10 flex flex-col pt-8 sm:pt-12 lg:pt-16 px-5 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
                        {hero.headline && (
                            <motion.h2
                                variants={staggerContainer}
                                initial="hidden"
                                {...(animate
                                    ? {
                                          whileInView: "visible",
                                          viewport: { once: false, amount: 0.2 },
                                      }
                                    : {})}
                                className="font-manrope text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[0.95] tracking-tighter"
                            >
                                {headlineWords?.map(({ word, key }) => (
                                    <motion.span
                                        key={key}
                                        variants={wordVariant}
                                        className="inline-block mr-[0.25em]"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </motion.h2>
                        )}

                        {hero.subtext && (
                            <motion.p
                                variants={subtextVariant}
                                initial="hidden"
                                {...(animate
                                    ? {
                                          whileInView: "visible",
                                          viewport: { once: false, amount: 0.2 },
                                      }
                                    : {})}
                                className="mt-2 sm:mt-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal text-white/90 leading-snug"
                            >
                                {hero.subtext}
                            </motion.p>
                        )}
                    </div>
                )}
            </section>

            {/* Horizontal Material Scroller */}
            <div className="w-full border-b border-gray-900 bg-black sticky top-[var(--site-header-height)] z-40 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-10 overflow-x-auto scrollbar-hide py-4">
                        {materials.map((material) => (
                            <button
                                key={material}
                                onClick={() => onMaterialSelect(material)}
                                className={`whitespace-nowrap text-base sm:text-lg font-bold transition-colors ${
                                    activeMaterial === material
                                        ? "text-white border-b-2 border-white pb-1"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {material}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}
