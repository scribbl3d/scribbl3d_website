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
    isFromAdmin: boolean;
};

const FALLBACK: HeroData = {
    mediaUrl:
        "https://res.cloudinary.com/dlbrgchrh/video/upload/v1767461878/printer-images/doef4s0pr9mzikpb6hzu.mp4",
    mediaType: "video",
    headline: "Discover Cutting-Edge 3D Printers",
    subtext: "Explore our extensive selection of 3D printers.",
    showGradient: true,
    isFromAdmin: false,
};

interface PrinterHeroProps {
    animate?: boolean;
}

export default function PrinterHero({ animate = true }: PrinterHeroProps) {
    const [hero, setHero] = useState<HeroData>(FALLBACK);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/page-hero/printers");
                const data = await res.json();
                if (data?.mediaUrl) {
                    setHero({
                        mediaUrl: data.mediaUrl,
                        mediaType: data.mediaType || "video",
                        headline: data.headline,
                        subtext: data.subtext,
                        showGradient: data.showGradient ?? true,
                        isFromAdmin: true,
                    });
                }
            } catch {
                // Keep fallback
            }
        })();
    }, []);

    const hasText = hero.headline || hero.subtext;

    // Fallback = old full-height video layout
    // Admin upload = natural-height image/video layout
    if (!hero.isFromAdmin) {
        return (
            <section className="relative w-full h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-[#0a0a0f]">
                <video
                    src={hero.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/50 to-transparent sm:from-black sm:via-black/40 sm:to-[#4f46e5]/10" />

                <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
                    <motion.h1
                        variants={staggerContainer}
                        initial="hidden"
                        {...(animate
                            ? {
                                  whileInView: "visible",
                                  viewport: { once: false, amount: 0.2 },
                              }
                            : {})}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                    >
                        {(hero.headline || "").split(" ").map((word, i) => (
                            <motion.span
                                key={i}
                                variants={wordVariant}
                                className="inline-block mr-[0.25em]"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.h1>

                    <motion.h3
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
                    </motion.h3>
                </div>
            </section>
        );
    }

    // Admin-uploaded hero — natural height layout
    return (
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
                <img
                    src={hero.mediaUrl}
                    alt={hero.headline || "Hero"}
                    className="w-full h-auto block"
                />
            )}

            {hero.showGradient !== false && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
            )}

            {hasText && (
                <div className="absolute inset-0 z-10 flex flex-col justify-center pb-[15%] px-5 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
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