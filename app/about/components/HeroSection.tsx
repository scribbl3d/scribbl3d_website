"use client";

import { motion } from "framer-motion";
import Link from "next/link"; // Added Next.js Link import
import { useEffect, useState } from "react";
import { BRAND } from "./constants";

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const wordVariant = {
    hidden: { y: 80, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", damping: 15, stiffness: 100 },
    },
};

const accentVariant = {
    hidden: { x: -60, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", damping: 18, stiffness: 80, delay: 0.5 },
    },
};

const subtextVariant = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut", delay: 0.8 },
    },
};

const ctaVariant = {
    hidden: { x: -40, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", damping: 18, stiffness: 90, delay: 1.0 },
    },
};

function SplitHeadline({ text }: { text: string }) {
    // Splitting by space handles natural line breaks responsively
    const words = text.split(" ");

    return (
        <motion.h1
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="font-manrope font-extrabold tracking-tight leading-[1.1] sm:leading-[0.95] text-white text-[28px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl flex flex-wrap"
        >
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    variants={wordVariant}
                    className="inline-block mr-[0.25em] overflow-visible"
                >
                    {word}
                </motion.span>
            ))}
        </motion.h1>
    );
}

// Define the interface based on the database schema
interface HeroData {
    headline: string;
    headlineAccent?: string | null;
    subtext?: string | null;
    mediaUrl: string;
    buttonText?: string | null;
    buttonLink?: string | null;
}

export default function HeroSection() {
    const [heroData, setHeroData] = useState<HeroData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const res = await fetch("/api/about-hero");
                if (res.ok) {
                    const data = await res.json();
                    // Ensure we don't set empty objects if DB is empty
                    if (data && data.headline) {
                        setHeroData(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHero();
    }, []);

    // Show a blank dark background while fetching to prevent flickering text
    if (isLoading) {
        return (
            <section className="w-full h-[70vh] sm:h-[85vh] lg:h-[100vh] min-h-[500px] bg-[#0a0a0f] animate-pulse" />
        );
    }

    // Apply fallbacks just in case the database is empty or a field is missing
    const headline =
        heroData?.headline || "Building the Future of Manufacturing";
    const headlineAccent = heroData?.headlineAccent || "Powered by 3D Printing";
    const subtext =
        heroData?.subtext ||
        "At Scribbl3D, we're on a mission to make advanced manufacturing accessible, scalable, and reliable.";
    const mediaUrl = heroData?.mediaUrl || "/about/hero.jpg";
    const buttonText = heroData?.buttonText || "Browse Catalog";
    const buttonLink = heroData?.buttonLink || "/#ecosystem"; // Defaults to the anchor link format

    return (
        <section className="relative w-full h-[60vh] sm:h-[75vh] lg:h-[100vh] min-h-[450px] overflow-hidden bg-[#0a0a0f]">
            {/* Background */}
            <img
                src={mediaUrl}
                alt="hero background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/60 to-transparent sm:from-black sm:via-black/50 sm:to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center px-4 sm:px-10 lg:px-16 pt-[80px] pb-10 sm:pb-0 max-w-[1400px] mx-auto">
                {/* Headline */}
                <SplitHeadline text={headline} />

                {/* Accent line (Conditionally Rendered) */}
                {headlineAccent && (
                    <motion.h2
                        variants={accentVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="font-manrope font-extrabold text-blue-500 leading-tight text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2 sm:mt-4"
                    >
                        {headlineAccent}
                    </motion.h2>
                )}

                {/* Subtext (Conditionally Rendered) */}
                {subtext && (
                    <motion.p
                        variants={subtextVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="mt-3 sm:mt-8 text-xs sm:text-lg md:text-xl lg:text-2xl max-w-[280px] sm:max-w-md lg:max-w-xl font-light leading-relaxed text-white/80"
                    >
                        {subtext}
                    </motion.p>
                )}

                {/* CTA (Conditionally Rendered if both text and link exist) */}
                {buttonText && buttonLink && (
                    <motion.div
                        variants={ctaVariant}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="mt-4 sm:mt-10"
                    >
                        {/* Changed <a> to Next.js <Link> */}
                        <Link
                            href={buttonLink}
                            className="inline-flex items-center gap-2 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                            style={{
                                background: BRAND.blue || "#2563EB",
                                boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
                            }}
                        >
                            {buttonText}
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 13 14"
                                fill="none"
                                className="w-4 h-4"
                            >
                                <rect
                                    x="0.38"
                                    y="0.99"
                                    width="12.03"
                                    height="12.03"
                                    rx="6.01"
                                    stroke="currentColor"
                                    strokeWidth="0.76"
                                />
                                <path
                                    d="M4 9.39L8.79 4.6M8.79 4.6H4.48M8.79 4.6V8.92"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
