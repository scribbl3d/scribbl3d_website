"use client";

import { BRAND } from "./constants";

const CHECKS = [
    "Official OEM Partners",
    "PAN-India Service Support",
    "In-house Quality Control",
    "Custom Training Programs",
];

export default function OurStorySection() {
    return (
        <section className="bg-white px-6 py-10 lg:py-16">
            <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-[96px]">
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
                            marginBottom: 24,
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
                        Our Story
                    </span>

                    {/* Headline */}
                    <h2
                        style={{
                            fontSize: "clamp(36px, 8vw, 48px)",
                            fontWeight: 800,
                            lineHeight: 1.25,
                            color: "#101828",
                            margin: "0 0 24px",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.35px",
                        }}
                    >
                        From a small workshop
                        <br className="hidden lg:block" /> to an{" "}
                        <span
                            style={{ color: BRAND.blue, whiteSpace: "nowrap" }}
                        >
                            Industry Leader.
                        </span>
                    </h2>

                    {/* Paragraphs */}
                    <p
                        style={{
                            fontSize: 18,
                            color: "#4A5565",
                            lineHeight: "29.25px",
                            margin: "0 0 24px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            letterSpacing: "-0.44px",
                        }}
                    >
                        Founded in 2014, Scribbl3D began with a simple mission:
                        to make industrial-grade 3D printing accessible to
                        Indian enterprises and engineers. We saw the potential
                        of additive manufacturing to bypass traditional
                        manufacturing constraints.
                    </p>

                    <p
                        style={{
                            fontSize: 18,
                            color: "#4A5565",
                            lineHeight: "29.25px",
                            margin: "0 0 40px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            letterSpacing: "-0.44px",
                        }}
                    >
                        Today, we are more than just an e-commerce platform. We
                        are a comprehensive 3D ecosystem, partnering with global
                        leaders like Bambu Lab, Elegoo, and Formlabs to bring
                        the latest technology to your factory floor.
                    </p>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 lg:mb-0 mb-4">
                        {CHECKS.map((c) => (
                            <div
                                key={c}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    fontSize: 16,
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
                                        width: 20,
                                        height: 20,
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg
                                        width="20"
                                        height="20"
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
