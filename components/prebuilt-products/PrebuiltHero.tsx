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

const FALLBACK: HeroData = {
    mediaUrl:
        "https://res.cloudinary.com/dlbrgchrh/video/upload/v1767461878/printer-images/doef4s0pr9mzikpb6hzu.mp4",
    mediaType: "video",
    headline: "Discover Cutting-Edge Prebuilt Products",
    subtext: "Explore our extensive selection of prebuilt 3D products.",
    showGradient: true,
};

interface PrebuiltHeroProps {
    animate?: boolean;
}

export default function PrebuiltHero({ animate = true }: PrebuiltHeroProps) {
    const [hero, setHero] = useState<HeroData>(FALLBACK);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/page-hero/prebuilt-products");
                const data = await res.json();
                if (data?.mediaUrl) {
                    setHero({
                        mediaUrl: data.mediaUrl,
                        mediaType: data.mediaType || "video",
                        headline: data.headline,
                        subtext: data.subtext,
                        showGradient: data.showGradient ?? true,
                    });
                }
            } catch {
                // Keep fallback
            }
        })();
    }, []);

    const hasText = hero.headline || hero.subtext;

    return (
        <section className="relative w-full overflow-hidden bg-[#f0f0f0] mt-[72px]">
            {/* Background media — full width, natural height */}
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
                <img
                    src={hero.mediaUrl}
                    alt={hero.headline || "Hero"}
                    className="w-full h-auto block"
                />
            )}

            {/* Gradient overlay */}
            {hero.showGradient !== false && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
            )}

            {/* Content — vertically centered, left-aligned */}
            {hasText && (
                <div className="absolute inset-0 z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
                    {hero.headline && (
                        <motion.h1
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
                            {hero.headline.split(" ").map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={wordVariant}
                                    className="inline-block mr-[0.25em]"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h1>
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
                            className="mt-3 sm:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white/80 max-w-xl leading-relaxed"
                        >
                            {hero.subtext}
                        </motion.p>
                    )}
                </div>
            )}
        </section>
    );
}
