"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

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
};

const FALLBACK: HeroData = {
    mediaUrl:
        "https://res.cloudinary.com/dlbrgchrh/image/upload/v1731671234/filaments-hero.jpg",
    mediaType: "image",
    headline: "Premium 3D Printing Materials",
    subtext: "Discover the perfect filament for your next masterpiece.",
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

export default function FilamentHero({ animate = true, activeMaterial, onMaterialSelect }: FilamentHeroProps) {
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

    return (
        <>
            {/* Background media */}
            <div className="relative h-[25vh] sm:h-[30vh] md:h-[35vh] w-full bg-white overflow-hidden mt-[72px]">
                {hero.mediaType === "video" ? (
                    <video
                        src={hero.mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <img
                        src={hero.mediaUrl}
                        alt={hero.headline || "Hero"}
                        className="w-full h-full object-cover opacity-80"
                    />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/20" />

                {/* Content */}
                {hasText && (
                    <div className="absolute inset-0 z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-16 max-w-[1400px] mx-auto text-center">
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
                                className="font-manrope text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tighter"
                            >
                                {hero.headline.split(" ").map((word, i) => (
                                    <motion.span
                                        key={i}
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
                                className="mt-3 sm:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-800 mx-auto max-w-2xl"
                            >
                                {hero.subtext}
                            </motion.p>
                        )}
                    </div>
                )}
            </div>

            {/* Horizontal Material Scroller */}
            <div className="w-full border-b border-gray-900 bg-black sticky top-[72px] z-40 overflow-hidden">
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
