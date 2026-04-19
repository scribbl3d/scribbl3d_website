"use client";

import { ReactNode, useState } from "react";
import {
    AnimatedSubtext,
    SplitText,
} from "../../landingpage/components/SplitText";
import { MARKETPLACES } from "./constants";

const LOGOS: Record<string, ReactNode> = {
    amazon: (
        <img
            src="/about/amazon.png"
            alt="Amazon"
            className="w-[90%] h-[90%] object-contain"
        />
    ),
    flipkart: (
        <img
            src="/about/flipkart.png"
            alt="Flipkart"
            className="w-[60%] h-[60%] object-contain"
        />
    ),
    indiamart: (
        <img
            src="/about/mart.png"
            alt="IndiaMart"
            className="w-full h-full object-contain scale-[1.3]"
        />
    ),
    etsy: (
        <img
            src="/about/etsy.png"
            alt="Etsy"
            className="w-[80%] h-[80%] object-contain"
        />
    ),
};

const LINKS: Record<string, string> = {
    amazon: "https://www.amazon.in/stores/Scribbl3d/page/9311E60A-3B9C-451E-9F0D-3DE38D818BEC?lp_asin=B0D9GY5KMT&ref_=ast_bln",
    indiamart: "https://www.indiamart.com/scribbl3d/profile.html",
    flipkart: "#", // Add your Flipkart link here
    etsy: "#", // Add your Etsy link here
};

export default function GlobalPresenceSection() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <section className="bg-white px-4 py-10 sm:px-6 sm:py-16 lg:py-[120px]">
            <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-24 items-center lg:items-start">
                {/* ── Left text column ── */}
                <div className="w-full lg:w-[578px] flex-shrink-0">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-700 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6">
                        <svg
                            className="w-3 h-3 sm:w-[14px] sm:h-[14px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        Global Presence
                    </span>

                    {/* Headline */}
                    <div className="mb-4 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        <SplitText className="text-gray-900 inline-block mr-2">
                            Beyond Our Platform:
                        </SplitText>
                        <br className="hidden sm:block" />
                        <SplitText className="text-blue-600 inline-block">
                            Find Us Everywhere
                        </SplitText>
                    </div>

                    {/* Paragraph */}
                    <AnimatedSubtext className="text-sm sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                        While our direct platform offers the best technical
                        support and exclusive B2B pricing, Scribbl3D is also
                        available across leading global and local marketplaces —
                        ensuring you can connect, explore, and purchase through
                        the platform you trust.
                    </AnimatedSubtext>

                    {/* Verified Badge Card */}
                    <div className="w-full flex items-center gap-3 sm:gap-4 bg-gray-50 border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5">
                        <div className="flex items-center justify-center shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 text-white shadow-[0_10px_15px_-3px_rgba(37,99,235,0.2),0_4px_6px_-4px_rgba(37,99,235,0.2)]">
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
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
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs sm:text-sm font-bold text-gray-900">
                                Verified Merchant
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                                Official storefront across all major platforms
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Marketplace cards grid ── */}
                <div className="w-full lg:flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 place-items-center sm:place-items-stretch mt-6 sm:mt-8 lg:mt-0">
                    {MARKETPLACES.map((m) => {
                        const isHovered = hoveredCard === m.name;

                        return (
                            <a
                                key={m.name}
                                href={LINKS[m.name.toLowerCase()] || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center bg-white relative transition-all duration-300 w-full max-w-[130px] sm:max-w-[150px] h-[220px] sm:h-[286px] rounded-2xl sm:rounded-[32px] pt-6 sm:pt-[34px] pb-4 sm:pb-6 px-2 sm:px-3"
                                style={{
                                    border: isHovered
                                        ? `2px solid ${m.bg}`
                                        : "2px solid #F3F4F6",
                                    transform: isHovered
                                        ? "translateY(-8px)"
                                        : "translateY(0)",
                                    boxShadow: isHovered
                                        ? `0 12px 30px ${m.bg}25`
                                        : "0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px -1px rgba(0,0,0,0.10)",
                                }}
                                onMouseEnter={() => setHoveredCard(m.name)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Top Logo Container */}
                                <div className="flex items-center justify-center shrink-0 overflow-hidden w-14 h-14 sm:w-20 sm:h-20 rounded-lg">
                                    {LOGOS[m.logo]}
                                </div>

                                {/* Middle Text Area */}
                                <div className="text-center w-full mt-3 sm:mt-5">
                                    <h4 className="text-base sm:text-xl font-black tracking-tight text-gray-900 mb-1">
                                        {m.name}
                                    </h4>
                                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mx-auto max-w-[70px] sm:max-w-[85px] leading-tight">
                                        {m.sub ? m.sub.split(" ")[0] : ""}
                                        <br />
                                        {m.sub
                                            ? m.sub
                                                  .split(" ")
                                                  .slice(1)
                                                  .join(" ")
                                            : ""}
                                    </p>
                                </div>

                                {/* Bottom External Link Icon */}
                                <div
                                    className="mt-auto transition-colors duration-300"
                                    style={{
                                        color: isHovered ? m.bg : "#D1D5DB",
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line
                                            x1="10"
                                            y1="14"
                                            x2="21"
                                            y2="3"
                                        ></line>
                                    </svg>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
