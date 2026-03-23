"use client";

import { motion } from "framer-motion";

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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
        transition: { duration: 0.6, ease: "easeOut", delay: 1.2 },
    },
};

interface PrinterHeroProps {
    animate?: boolean;
}

export default function PrinterHero({ animate = true }: PrinterHeroProps) {
    const headline = "Discover Cutting-Edge 3D Printers";
    const subheading = "Explore our extensive selection of 3D printers.";

    return (
        <section className="relative w-full h-[70vh] sm:h-[85vh] lg:h-[100vh] min-h-[450px] max-h-[900px] overflow-hidden bg-[#0a0a0f]">
            {/* Background video */}
            <video
                src="https://res.cloudinary.com/dlbrgchrh/video/upload/v1767461878/printer-images/doef4s0pr9mzikpb6hzu.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/50 to-transparent sm:from-black sm:via-black/40 sm:to-[#4f46e5]/10" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 lg:px-16 pt-[80px] max-w-[1400px] mx-auto">
                {/* Headline — word-by-word spring wave, gated by animate prop */}
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
                    {headline.split(" ").map((word, i) => (
                        <motion.span
                            key={i}
                            variants={wordVariant}
                            className="inline-block mr-[0.25em]"
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subheading — fade up, gated by animate prop */}
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
                    {subheading}
                </motion.h3>
            </div>
        </section>
    );
}
