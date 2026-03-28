"use client";

import { ECOSYSTEM_CARDS } from "./constants";

export default function EcosystemSection() {
    return (
        <section
            id="ecosystem"
            className="px-6 py-16 lg:py-[120px]"
            style={{ backgroundColor: "#0B1120" }} // Matches the deep dark background
        >
            <div className="max-w-[1240px] mx-auto">
                {/* ── Header ── */}
                <div className="mb-12 lg:mb-[64px]">
                    <h2
                        className="text-white font-['Inter'] mb-[16px]"
                        style={{
                            fontSize: "clamp(28px, 5vw, 36px)",
                            fontWeight: 900, // Black
                            lineHeight: "clamp(34px, 5vw, 40px)",
                            letterSpacing: "0.37px",
                        }}
                    >
                        Our Full-Stack 3D Ecosystem
                    </h2>
                    <p
                        className="font-['Inter'] max-w-[718px]"
                        style={{
                            fontSize: "clamp(16px, 3vw, 20px)",
                            fontWeight: 400,
                            lineHeight: "clamp(24px, 4vw, 28px)",
                            letterSpacing: "-0.45px",
                            color: "#99A1AF",
                        }}
                    >
                        We provide everything you need to transition from
                        digital design to industrial-scale physical production.
                    </p>
                </div>

                {/* ── Cards grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                    {ECOSYSTEM_CARDS.map((c) => (
                        <div
                            key={c.title}
                            className="group relative flex flex-col justify-between overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: "rgba(255, 255, 255, 0.05)", // 5% White background
                                border: "1px solid rgba(255, 255, 255, 0.10)", // 10% White border
                                borderRadius: "32px",
                                padding: "32px",
                            }}
                        >
                            {/* Subtle hover border effect matching the blue theme */}
                            <div className="absolute inset-0 border border-[#2563EB] opacity-0 rounded-[32px] transition-opacity duration-300 group-hover:opacity-50 pointer-events-none"></div>

                            {/* Icon + Tag Row */}
                            <div className="flex justify-between items-start mb-[40px]">
                                {/* Icon Container - 56x56 */}
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "16px",
                                        background: "rgba(37, 99, 235, 0.20)", // 20% blue fill
                                        color: "#60A5FA", // Lighter blue for the SVG stroke
                                    }}
                                >
                                    {/* Wraps the SVG to force 28x28 bounds and apply stroke color */}
                                    <span className="flex items-center justify-center w-[28px] h-[28px] [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                        {c.icon}
                                    </span>
                                </div>

                                {/* Tag / Pill */}
                                <span
                                    className="font-['Inter'] uppercase"
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 800,
                                        letterSpacing: "0.1em",
                                        color: "#60A5FA",
                                        background: "rgba(37, 99, 235, 0.15)",
                                        borderRadius: "20px",
                                        padding: "6px 14px",
                                    }}
                                >
                                    {c.tag}
                                </span>
                            </div>

                            {/* Text Content */}
                            <div>
                                <h3
                                    className="text-white font-['Inter'] mb-[8px]"
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 700,
                                        lineHeight: "28px",
                                        letterSpacing: "-0.45px",
                                    }}
                                >
                                    {c.title}
                                </h3>
                                <p
                                    className="font-['Inter'] m-0"
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 400,
                                        lineHeight: "22.75px",
                                        letterSpacing: "-0.15px",
                                        color: "#99A1AF",
                                    }}
                                >
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
