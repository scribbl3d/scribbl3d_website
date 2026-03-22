"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SplitText } from "./SplitText";

const BRANDS = [
    {
        name: "Anycubic",
        slug: "Anycubic",
        logo: "/landing/brands/anycubic.png",
    },
    {
        name: "Bambu Lab",
        slug: "Bambu Lab",
        logo: "/landing/brands/bambuLab.png",
    },
    {
        name: "Creality",
        slug: "Creality",
        logo: "/landing/brands/creality.png",
    },
    { name: "Elegoo", slug: "Elegoo", logo: "/landing/brands/egelo.png" },
    { name: "Phrozen", slug: "Phrozen", logo: "/landing/brands/phrozen.png" },
    { name: "Jamghe", slug: "jamghe", logo: "/landing/brands/jamghe.png" },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const logoVariant = {
    hidden: { opacity: 0, y: "100%" },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            type: "tween",
            ease: "easeOut",
        },
    },
};

interface BrowseByBrandProps {
    animate?: boolean;
}

export default function BrowseByBrand({ animate = true }: BrowseByBrandProps) {
    return (
        <section className="w-full bg-white border-y border-gray-100 py-8 sm:py-10 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                <SplitText
                    as="p"
                    className="text-sm sm:text-base font-semibold tracking-[0.3em] text-[#4f46e5] mb-2 uppercase justify-center text-center"
                    animate={animate}
                >
                    Browse by Brand
                </SplitText>
                <motion.div
                    className="flex items-center justify-between px-4 sm:px-8 lg:px-12"
                    initial="hidden"
                    {...(animate
                        ? {
                              whileInView: "visible",
                              viewport: { margin: "-50px" },
                          }
                        : {})}
                    variants={containerVariants}
                >
                    {BRANDS.map((brand) => (
                        <Link
                            key={brand.slug}
                            href={`/printers?brand=${encodeURIComponent(brand.slug)}`}
                            className="group flex-shrink-0 overflow-hidden"
                            title={brand.name}
                        >
                            <motion.img
                                variants={logoVariant}
                                src={brand.logo}
                                alt={brand.name}
                                className="h-20 sm:h-24 lg:h-[120px] w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
