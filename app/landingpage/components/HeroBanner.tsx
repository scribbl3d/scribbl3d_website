"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface HeroBannerSlide {
    id: string;
    headline: string;
    headlineAccent?: string | null;
    subtext?: string | null;
    mediaUrl: string;
    mediaType: string;
    altText?: string | null;
    buttonText?: string | null;
    buttonLink?: string | null;
    duration: number;
}

interface HeroBannerProps {
    slides: HeroBannerSlide[];
    animate?: boolean; // controlled by parent — true once loader is done
}

// ── Animation variants ──────────────────────────────────────────

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
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

// ── SplitText ───────────────────────────────────────────────────

function SplitHeadline({ text, animate }: { text: string; animate: boolean }) {
    const lines = text.split("\n");

    return (
        <motion.h1
            variants={staggerContainer}
            initial="hidden"
            {...(animate
                ? { whileInView: "visible", viewport: { margin: "-50px" } }
                : {})}
            className="font-manrope text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[0.9] tracking-tighter"
        >
            {lines.map((line, lineIndex) => (
                <span key={lineIndex} className="block overflow-hidden">
                    {line.split(" ").map((word, wordIndex) => (
                        <motion.span
                            key={`${lineIndex}-${wordIndex}`}
                            variants={wordVariant}
                            className="inline-block mr-[0.25em]"
                        >
                            {word}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.h1>
    );
}

// ── Main component ──────────────────────────────────────────────

export default function HeroBanner({
    slides,
    animate = true,
}: HeroBannerProps) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

    // Track if it's the first slide (initial load) — needs to wait for `animate` prop.
    // Subsequent slides (carousel advance) should animate immediately.
    const [hasAnimatedFirst, setHasAnimatedFirst] = useState(false);

    // Once parent says animate, mark first slide as ready
    useEffect(() => {
        if (animate && !hasAnimatedFirst) {
            setHasAnimatedFirst(true);
        }
    }, [animate, hasAnimatedFirst]);

    // Should the current slide animate?
    // First slide: only when `animate` is true (loader done)
    // Subsequent slides: always true (carousel is already visible)
    const shouldAnimate = hasAnimatedFirst || animate;

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    // Auto-advance: only start timer after animations are ready
    useEffect(() => {
        const slide = slides[current];
        if (!slide || slides.length <= 1 || !shouldAnimate) return;

        if (slide.mediaType === "video") {
            const video = videoRefs.current.get(current);
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }
            return;
        }

        if (isPaused) return;
        const timer = setTimeout(next, slide.duration || 5000);
        return () => clearTimeout(timer);
    }, [current, isPaused, next, slides, shouldAnimate]);

    // Pause non-current videos
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (index !== current) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, [current]);

    if (!slides.length) return null;

    const slide = slides[current];

    return (
        <section
            className="relative w-full h-[70vh] sm:h-[85vh] lg:h-[100vh] min-h-[450px] max-h-[900px] overflow-hidden bg-[#0a0a0f]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background media */}
            {slides.map((s, i) => (
                <div
                    key={s.id}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: i === current ? 1 : 0 }}
                >
                    {s.mediaType === "video" ? (
                        <video
                            ref={(el) => {
                                if (el) videoRefs.current.set(i, el);
                            }}
                            src={s.mediaUrl}
                            muted
                            playsInline
                            onEnded={next}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={s.mediaUrl}
                            alt={s.altText || s.headline}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/50 to-transparent sm:from-black sm:via-black/40 sm:to-[#4f46e5]/20" />
                </div>
            ))}

            {/* Animated content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    className="relative z-10 h-full flex flex-col justify-end pb-12 sm:pb-0 sm:justify-center px-5 sm:px-10 lg:px-16 pt-[80px] max-w-[1400px] mx-auto"
                >
                    {/* Headline — word-by-word wave */}
                    <SplitHeadline
                        text={slide.headline}
                        animate={shouldAnimate}
                    />

                    {/* Accent headline — slides from left */}
                    {slide.headlineAccent && (
                        <motion.h2
                            variants={accentVariant}
                            initial="hidden"
                            {...(shouldAnimate
                                ? {
                                      whileInView: "visible",
                                      viewport: { margin: "-50px" },
                                  }
                                : {})}
                            className="font-manrope text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-[#c4b5fd] leading-[0.9] tracking-tighter mt-1"
                        >
                            {slide.headlineAccent.split("\n").map((line, i) => (
                                <span key={i} className="block">
                                    {line}
                                </span>
                            ))}
                        </motion.h2>
                    )}

                    {/* Subtext — fades up */}
                    {slide.subtext && (
                        <motion.p
                            variants={subtextVariant}
                            initial="hidden"
                            {...(shouldAnimate
                                ? {
                                      whileInView: "visible",
                                      viewport: { margin: "-50px" },
                                  }
                                : {})}
                            className="mt-4 sm:mt-8 text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-xs sm:max-w-md lg:max-w-xl font-light leading-relaxed"
                        >
                            {slide.subtext}
                        </motion.p>
                    )}

                    {/* CTA — slides from left */}
                    {slide.buttonText && slide.buttonLink && (
                        <motion.div
                            variants={ctaVariant}
                            initial="hidden"
                            {...(shouldAnimate
                                ? {
                                      whileInView: "visible",
                                      viewport: { margin: "-50px" },
                                  }
                                : {})}
                            className="mt-6 sm:mt-10"
                        >
                            <Link
                                href={slide.buttonLink}
                                className="inline-flex items-center gap-2 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-xl shadow-lg shadow-[#4f46e5]/20 hover:scale-[1.02] transition-transform"
                            >
                                {slide.buttonText}
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 13 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
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
                </motion.div>
            </AnimatePresence>

            {/* Slide indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:bottom-8 sm:right-12 lg:right-16 flex items-center gap-2 sm:gap-3 z-10">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                i === current
                                    ? "w-8 sm:w-12 bg-white"
                                    : "w-8 sm:w-12 bg-white/30 hover:bg-white/50"
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
