"use client";

import {
    AnimatedSubtext,
    SplitText,
} from "../../landingpage/components/SplitText"; // Adjust import path if needed
import { ECOSYSTEM_CARDS } from "./constants";

export default function EcosystemSection() {
    return (
        <section
            id="ecosystem"
            className="px-4 py-10 sm:px-6 sm:py-16 lg:py-[120px] bg-[#0B1120]"
        >
            <div className="max-w-[1240px] mx-auto">
                {/* ── Animated Header ── */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <SplitText className="text-white text-xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 sm:mb-4">
                        Our Full-Stack 3D Ecosystem
                    </SplitText>
                    <AnimatedSubtext className="text-gray-400 text-xs sm:text-base lg:text-lg max-w-[718px]">
                        We provide everything you need to transition from
                        digital design to industrial-scale physical production.
                    </AnimatedSubtext>
                </div>

                {/* ── Cards grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {ECOSYSTEM_CARDS.map((c) => (
                        <div
                            key={c.title}
                            className="group relative flex flex-col justify-between overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 p-6 sm:p-8 rounded-2xl sm:rounded-[32px] bg-white/5 border border-white/10"
                        >
                            {/* Subtle hover border effect matching the blue theme */}
                            <div className="absolute inset-0 border border-blue-600 opacity-0 rounded-2xl sm:rounded-[32px] transition-opacity duration-300 group-hover:opacity-50 pointer-events-none"></div>

                            {/* Icon + Tag Row */}
                            <div className="flex justify-between items-start mb-6 sm:mb-10">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/20 text-blue-400">
                                    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                        {c.icon}
                                    </span>
                                </div>

                                {/* Tag / Pill */}
                                <span className="text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-600/15 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full">
                                    {c.tag}
                                </span>
                            </div>

                            {/* Text Content */}
                            <div>
                                <h3 className="text-white text-base sm:text-xl font-extrabold mb-2">
                                    {c.title}
                                </h3>
                                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                                    {c.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
