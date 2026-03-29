"use client";

import { BRAND } from "./constants";

const CHECKS = [
    "OEM Partnerships",
    "PAN-India Support",
    "End-to-End Solutions",
    "After-Sales Excellence",
];

export default function OurStorySection() {
    return (
        <section className="bg-white px-6 py-10 lg:py-16">
            {/* Reduced lg:gap-[96px] to lg:gap-[64px] to give text more horizontal room */}
            <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-[64px]">
                {/* ── Text column ── */}
                <div className="w-full lg:flex-1 lg:min-w-[500px]">
                    {/* Badge */}
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 32,
                            padding: "6px 14px",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: BRAND.blue,
                            marginBottom: 16, // Reduced from 24px
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        OUR STORY
                    </span>

                    {/* Headline */}
                    <h2
                        style={{
                            fontSize: "clamp(32px, 6vw, 44px)", // Slightly reduced max size
                            fontWeight: 800,
                            lineHeight: 1.2,
                            color: "#101828",
                            margin: "0 0 16px", // Reduced from 24px
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.35px",
                        }}
                    >
                        From a Small Office
                        <br className="hidden lg:block" /> to Powering Modern
                        Manufacturing{" "}
                        <span
                            style={{ color: BRAND.blue, whiteSpace: "nowrap" }}
                        >
                            Across India.
                        </span>
                    </h2>

                    {/* Paragraphs - Reduced font size to 16px and tightened line height/margins */}
                    <p
                        style={{
                            fontSize: 16,
                            color: "#4A5565",
                            lineHeight: "26px",
                            margin: "0 0 16px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            letterSpacing: "-0.2px",
                        }}
                    >
                        Scribbl3D started as a small office with a clear vision
                        — to make industrial-grade 3D printing accessible in
                        India. Founded with a hands-on, problem-solving
                        approach, we set out to bridge the gap between advanced
                        manufacturing technology and real-world application.
                    </p>

                    <p
                        style={{
                            fontSize: 16,
                            color: "#4A5565",
                            lineHeight: "26px",
                            margin: "0 0 16px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            letterSpacing: "-0.2px",
                        }}
                    >
                        Today, we serve 500+ customers across industries,
                        working closely with manufacturers and educational
                        institutions to deliver reliable, production-ready
                        solutions. From high-performance 3D printers to complete
                        end-to-end manufacturing workflows, we enable faster,
                        smarter execution from idea to production.
                    </p>

                    <p
                        style={{
                            fontSize: 16,
                            color: "#4A5565",
                            lineHeight: "26px",
                            margin: "0 0 28px", // Reduced from 40px
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            letterSpacing: "-0.2px",
                        }}
                    >
                        With a strong nationwide presence and partnerships with
                        global leaders, Scribbl3D continues to scale additive
                        manufacturing across India.
                    </p>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 lg:mb-0 mb-4">
                        {CHECKS.map((c) => (
                            <div
                                key={c}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontSize: 15, // Slightly scaled down checklist text
                                    fontWeight: 700,
                                    lineHeight: "24px",
                                    color: "#101828",
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: "-0.31px",
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#059669",
                                        width: 18,
                                        height: 18,
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="16 10 11 15 8 12"></polyline>
                                    </svg>
                                </span>
                                {c}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Image column ── */}
                <div className="w-full lg:flex-1 lg:max-w-[540px] rounded-[32px] overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
                    <img
                        src="/about/story.jpg"
                        alt="Scribbl3D workspace"
                        className="w-full h-full object-cover aspect-[4/5] lg:aspect-[4/3] block"
                    />
                </div>
            </div>
        </section>
    );
}
