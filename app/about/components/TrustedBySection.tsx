"use client";

import { INDUSTRIES } from "./constants";

const BADGES = [
    {
        text: "Enterprise Support",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),
    },
    {
        text: "Fast Deployment",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
    },
    {
        text: "Premium Quality",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
            </svg>
        ),
    },
];

export default function TrustedBySection() {
    return (
        <section className="bg-white overflow-hidden py-12 lg:pt-[48px] lg:pb-[100px]">
            {/* ── CSS for Auto-Scrolling Infinite Carousel ── */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `,
                }}
            />

            {/* ── Main Container ── */}
            <div className="max-w-[1240px] mx-auto flex flex-col items-center px-6">
                {/* ── Header ── */}
                <div className="text-center w-full max-w-[762px] mb-[48px]">
                    {/* 🔥 Upper Pill Added */}
                    <div
                        className="inline-flex items-center gap-2 mb-[12px]"
                        style={{
                            background: "#EEF2FF",
                            color: "#2563EB",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                        }}
                    >
                        <span className="w-[6px] h-[6px] rounded-full bg-[#2563EB]" />
                        TRUSTED NETWORK
                    </div>

                    <h2
                        className="font-['Inter'] m-0 mb-[16px]"
                        style={{
                            fontSize: "clamp(26px, 4vw, 30px)",
                            fontWeight: 800,
                            color: "#101828",
                            lineHeight: "36px",
                            letterSpacing: "0.4px",
                        }}
                    >
                        Trusted by{" "}
                        <span style={{ color: "#2563EB" }}>
                            Industry Leaders
                        </span>
                    </h2>

                    <p
                        className="font-['Inter'] m-0"
                        style={{
                            fontSize: "16px",
                            color: "#4A5565",
                            lineHeight: "24px",
                            fontWeight: 400,
                            letterSpacing: "-0.31px",
                        }}
                    >
                        Powering innovation across automotive, aerospace,
                        medical, and consumer product industries worldwide
                    </p>
                </div>

                {/* ── Carousel ── */}
                <div
                    className="w-full relative mb-[64px] overflow-hidden"
                    style={{
                        // ✅ LIGHTER FADE FIXED
                        maskImage:
                            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                    }}
                >
                    <div className="animate-marquee">
                        {[1, 2].map((set) => (
                            <div
                                key={set}
                                className="flex gap-[16px] pr-[16px]"
                            >
                                {INDUSTRIES.map((ind) => (
                                    <div
                                        key={ind.name + set}
                                        className="bg-white flex flex-col items-center transition-all duration-300 hover:-translate-y-1 shrink-0"
                                        style={{
                                            width: "210px",
                                            height: "246px",
                                            border: "1px solid #E5E7EB",
                                            borderRadius: "16px",
                                            padding: "25px",
                                            cursor: "pointer",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.03)",
                                        }}
                                    >
                                        {/* Image */}
                                        <div
                                            className="shrink-0"
                                            style={{
                                                width: "160px",
                                                height: "120px",
                                                borderRadius: "14px",
                                                overflow: "hidden",
                                                marginBottom: "16px",
                                                background: "#F3F4F6",
                                            }}
                                        >
                                            <img
                                                src={ind.image}
                                                alt={ind.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Text */}
                                        <div className="text-center w-full">
                                            <p
                                                className="font-['Inter'] m-0 mb-[4px] w-full truncate"
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    color: "#101828",
                                                    lineHeight: "20px",
                                                    letterSpacing: "-0.15px",
                                                }}
                                            >
                                                {ind.name}
                                            </p>
                                            <p
                                                className="font-['Inter'] m-0 w-full truncate"
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 400,
                                                    color: "#6A7282",
                                                    lineHeight: "16px",
                                                }}
                                            >
                                                {ind.sub}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex flex-col items-center">
                    <p
                        className="font-['Inter'] m-0 mb-[24px]"
                        style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "#6A7282",
                            lineHeight: "20px",
                        }}
                    >
                        Join 50+ companies already using Scribbl3D technology
                    </p>

                    <div className="flex flex-wrap justify-center gap-[24px]">
                        {BADGES.map((b) => (
                            <div
                                key={b.text}
                                className="flex items-center"
                                style={{ gap: "8px" }}
                            >
                                <div
                                    className="flex items-center justify-center shrink-0"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "100px",
                                        background: "#DBEAFE",
                                        color: "#2563EB",
                                    }}
                                >
                                    <span className="flex items-center justify-center w-[16px] h-[16px] [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                        {b.icon}
                                    </span>
                                </div>

                                <span
                                    className="font-['Inter'] m-0"
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: "#364153",
                                        lineHeight: "16px",
                                        letterSpacing: "0px",
                                    }}
                                >
                                    {b.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
