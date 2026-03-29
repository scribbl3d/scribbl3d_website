"use client";

import { motion } from "framer-motion";
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
            className="font-manrope font-extrabold tracking-tight leading-[1.05] sm:leading-[0.95] text-white text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl flex flex-wrap"
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

export default function HeroSection() {
    return (
        <section className="relative w-full h-[70vh] sm:h-[85vh] lg:h-[100vh] min-h-[500px] overflow-hidden bg-[#0a0a0f]">
            {/* Background */}
            <img
                src="/about/hero.jpg"
                alt="hero"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/60 to-transparent sm:from-black sm:via-black/50 sm:to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end sm:justify-center px-5 sm:px-10 lg:px-16 pt-[90px] pb-16 sm:pb-0 max-w-[1400px] mx-auto">
                {/* Headline - Removed explicit \n to allow natural wrapping */}
                <SplitHeadline text="Building the Future of Manufacturing" />

                {/* Accent line */}
                <motion.h2
                    variants={accentVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="font-manrope font-extrabold text-blue-500 leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-3 sm:mt-4"
                >
                    Powered by 3D Printing
                </motion.h2>

                {/* Subtext */}
                <motion.p
                    variants={subtextVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-4 sm:mt-8 text-sm sm:text-lg md:text-xl lg:text-2xl max-w-xs sm:max-w-md lg:max-w-xl font-light leading-relaxed text-white/80"
                >
                    At Scribbl3D, we're on a mission to make advanced
                    manufacturing accessible, scalable, and reliable.
                </motion.p>

                {/* CTA */}
                <motion.div
                    variants={ctaVariant}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-6 sm:mt-10"
                >
                    <a
                        href="#ecosystem"
                        className="inline-flex items-center gap-2 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                        style={{
                            background: BRAND.blue,
                            boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
                        }}
                    >
                        Browse Catalog
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
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
