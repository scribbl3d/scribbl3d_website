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
        <section className="bg-white px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
            {/* Reduced lg:gap-[96px] to lg:gap-[64px] to give text more horizontal room */}
            <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-[64px]">
                {/* ── Text column ── */}
                <div className="w-full lg:flex-1 lg:min-w-[500px]">
                    {/* Badge */}
                    <span
                        className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase mb-3 sm:mb-4"
                        style={{
                            color: BRAND.blue,
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
                        className="text-[26px] sm:text-[32px] lg:text-[44px] font-extrabold leading-tight text-[#101828] mb-3 sm:mb-4"
                        style={{
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
                    <p className="text-sm sm:text-base text-[#4A5565] leading-relaxed mb-3 sm:mb-4" style={{
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "-0.2px",
                        }}
                    >
                        Scribbl3D started as a small office with a clear vision
                        — to make industrial-grade 3D printing accessible in
                        India. Founded with a hands-on, problem-solving
                        approach, we set out to bridge the gap between advanced
                        manufacturing technology and real-world application.
                    </p>

                    <p className="text-sm sm:text-base text-[#4A5565] leading-relaxed mb-3 sm:mb-4" style={{
                            fontFamily: "'Inter', sans-serif",
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

                    <p className="text-sm sm:text-base text-[#4A5565] leading-relaxed mb-5 sm:mb-7" style={{
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "-0.2px",
                        }}
                    >
                        With a strong nationwide presence and partnerships with
                        global leaders, Scribbl3D continues to scale additive
                        manufacturing across India.
                    </p>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-6 sm:gap-x-8 lg:mb-0 mb-4">
                        {CHECKS.map((c) => (
                            <div
                                key={c}
                                className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-[15px] font-bold leading-tight text-[#101828]"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: "-0.31px",
                                }}
                            >
                                <span className="flex items-center justify-center text-[#059669] w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0">
                                    <svg
                                        className="w-full h-full"
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
                <div className="w-full lg:flex-1 lg:max-w-[540px] rounded-2xl sm:rounded-[32px] overflow-hidden relative shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:shadow-[0_20px_40px_rgba(0,0,0,0.06)] bg-white">
                    <img
                        src="/about/story.jpg"
                        alt="Scribbl3D workspace"
                        className="w-full h-full object-contain sm:object-cover aspect-[4/3] sm:aspect-[4/5] lg:aspect-[4/3] block"
                    />
                </div>
            </div>
        </section>
    );
}
