"use client";

import { ReactNode, useState } from "react";
import { MARKETPLACES } from "./constants";
const LOGOS: Record<string, ReactNode> = {
    amazon: (
        <img
            src="/about/amazon.png"
            alt="Amazon"
            // Bumped up to 90%
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
            // Using scale-[1.3] to magnify it by 30% and ignore the image's internal white borders
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

export default function GlobalPresenceSection() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <section className="bg-white px-6 py-16 lg:py-[120px]">
            <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row gap-[48px] lg:gap-[96px] items-center lg:items-start">
                {/* ── Left text column ── */}
                <div className="w-full lg:w-[578px] flex-shrink-0">
                    {/* Badge */}
                    <span
                        className="font-['Inter'] uppercase inline-flex items-center"
                        style={{
                            gap: "8px",
                            background: "#EFF6FF",
                            borderRadius: "9999px",
                            padding: "6px 14px",
                            fontSize: "10px",
                            fontWeight: 900,
                            letterSpacing: "1.12px",
                            color: "#1D4ED8",
                            marginBottom: "24px",
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
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        Global Presence
                    </span>

                    {/* Headline */}
                    <h2
                        className="font-['Inter'] m-0"
                        style={{
                            fontSize: "clamp(32px, 4vw, 36px)",
                            fontWeight: 800,
                            color: "#101828",
                            lineHeight: "45px",
                            letterSpacing: "0.37px",
                            marginBottom: "24px",
                        }}
                    >
                        Beyond Our Site: <br className="hidden sm:block" />
                        <span style={{ color: "#2563EB" }}>
                            Find Us <br className="hidden sm:block" />
                            Everywhere.
                        </span>
                    </h2>

                    {/* Paragraph */}
                    <p
                        className="font-['Inter'] m-0"
                        style={{
                            fontSize: "18px",
                            color: "#4A5565",
                            lineHeight: "29.25px",
                            fontWeight: 400,
                            letterSpacing: "-0.44px",
                            marginBottom: "32px",
                        }}
                    >
                        While our direct portal offers the best technical
                        support and exclusive B2B pricing, we maintain a strong
                        presence on major global and local marketplaces to
                        ensure you can reach us through your preferred platform.
                    </p>

                    {/* Verified Badge Card */}
                    <div
                        className="w-full flex items-center"
                        style={{
                            background: "#F9FAFB",
                            border: "1px solid #E5E7EB",
                            borderRadius: "24px",
                            padding: "20px",
                            gap: "16px",
                        }}
                    >
                        <div
                            className="flex items-center justify-center shrink-0"
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "#2563EB",
                                color: "white",
                                boxShadow:
                                    "0 10px 15px -3px rgba(37,99,235,0.2), 0 4px 6px -4px rgba(37,99,235,0.2)",
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
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

                        <div className="flex flex-col gap-[2px]">
                            <span
                                className="font-['Inter']"
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#101828",
                                    lineHeight: "20px",
                                    letterSpacing: "-0.15px",
                                }}
                            >
                                Verified Merchant
                            </span>
                            <span
                                className="font-['Inter']"
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    color: "#6A7282",
                                    lineHeight: "16px",
                                }}
                            >
                                Official Storefront on All Platforms
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Marketplace cards grid ── */}
                <div className="w-full lg:flex-1 grid grid-cols-2 lg:grid-cols-4 gap-[16px] place-items-center sm:place-items-stretch">
                    {MARKETPLACES.map((m) => {
                        const isHovered = hoveredCard === m.name;

                        return (
                            <div
                                key={m.name}
                                className="group flex flex-col items-center bg-white relative transition-all duration-300 w-full max-w-[150px]"
                                style={{
                                    height: "286px",
                                    borderRadius: "32px",
                                    padding: "34px 12px 24px 12px",
                                    cursor: "pointer",
                                    // CONDITIONAL STYLES:
                                    background: "#FFFFFF", // Always white
                                    border: isHovered
                                        ? `2px solid ${m.bg}`
                                        : "2px solid #F3F4F6", // Border changes to brand color
                                    transform: isHovered
                                        ? "translateY(-8px)"
                                        : "translateY(0)",
                                    boxShadow: isHovered
                                        ? `0 12px 30px ${m.bg}25` // Soft shadow tinted with brand color
                                        : "0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px -1px rgba(0,0,0,0.10)",
                                }}
                                onMouseEnter={() => setHoveredCard(m.name)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Top Logo Container */}
                                <div
                                    className="flex items-center justify-center shrink-0 overflow-hidden"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "8px", // Reduced rounding to match the images provided
                                    }}
                                >
                                    {LOGOS[m.logo]}
                                </div>

                                {/* Middle Text Area */}
                                <div className="text-center w-full mt-[20px]">
                                    <h4
                                        className="font-['Inter'] m-0"
                                        style={{
                                            fontSize: "20px",
                                            fontWeight: 900,
                                            lineHeight: "28px",
                                            letterSpacing: "-0.45px",
                                            color: "#101828", // Always dark
                                        }}
                                    >
                                        {m.name}
                                    </h4>
                                    <p
                                        className="font-['Inter'] uppercase mx-auto m-0 mt-[4px]"
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            letterSpacing: "1.12px",
                                            lineHeight: "15px",
                                            maxWidth: "85px",
                                            color: "#99A1AF", // Always grey
                                        }}
                                    >
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
                                        // CONDITIONAL STYLE: Icon takes brand color on hover
                                        color: isHovered ? m.bg : "#D1D5DB",
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
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
