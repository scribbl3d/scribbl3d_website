"use client";

import { useEffect, useState } from "react";

import {
    AnimatedSubtext,
    SplitText,
} from "../../landingpage/components/SplitText";

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

type Partner = {
    id: string;
    name: string;
    sub: string;
    image: string;
};

export default function TrustedBySection() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch("/api/partners");
                if (res.ok) {
                    const data = await res.json();
                    setPartners(data);
                }
            } catch (error) {
                console.error("Failed to fetch partners:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPartners();
    }, []);

    return (
        <section className="bg-white overflow-hidden py-8 sm:py-12 lg:pt-[48px] lg:pb-[100px]">
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
            <div className="max-w-[1240px] mx-auto flex flex-col items-center px-4 sm:px-6">
                {/* ── Header ── */}
                <div className="text-center w-full max-w-[762px] mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 bg-blue-50 text-blue-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        Trusted Network
                    </div>

                    {/* Fixed Typography Section */}
                    <div className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 sm:mb-4 flex flex-wrap justify-center gap-x-2">
                        <SplitText className="text-gray-900">
                            Trusted by
                        </SplitText>
                        <SplitText className="text-blue-600">
                            Industry Leaders
                        </SplitText>
                    </div>

                    <AnimatedSubtext className="mt-1 sm:mt-2 text-[11px] sm:text-sm lg:text-base text-gray-500">
                        Powering innovation across automotive, aerospace,
                        medical, and consumer product industries worldwide
                    </AnimatedSubtext>
                </div>

                {/* ── Carousel ── */}
                <div
                    className="w-full relative mb-10 sm:mb-16 overflow-hidden"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                    }}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[180px] sm:h-[246px] text-gray-400">
                            Loading partners...
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="flex justify-center items-center h-[180px] sm:h-[246px] text-gray-400">
                            No partners to display yet.
                        </div>
                    ) : (
                        <div className="animate-marquee">
                            {[1, 2].map((set) => (
                                <div key={set} className="flex gap-3 sm:gap-4 pr-3 sm:pr-4">
                                    {partners.map((ind) => (
                                        <div
                                            key={ind.id + "-" + set}
                                            className="bg-white flex flex-col items-center transition-all duration-300 hover:-translate-y-1 shrink-0 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 w-[160px] sm:w-[210px] h-[180px] sm:h-[246px] cursor-pointer"
                                            style={{
                                                boxShadow:
                                                    "0 4px 20px rgba(0,0,0,0.03)",
                                            }}
                                        >
                                            {/* Image */}
                                            <div className="shrink-0 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 w-[120px] sm:w-[160px] h-[90px] sm:h-[120px]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={ind.image}
                                                    alt={ind.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Text */}
                                            <div className="text-center w-full">
                                                <h3 className="text-xs sm:text-base font-extrabold text-gray-900 mb-0.5 sm:mb-1 w-full truncate">
                                                    {ind.name}
                                                </h3>
                                                <p className="text-[10px] sm:text-sm text-gray-500 w-full truncate">
                                                    {ind.sub}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex flex-col items-center">
                    <p className="text-xs sm:text-base text-gray-500 mb-4 sm:mb-6">
                        Join 50+ companies already using Scribbl3D technology
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                        {BADGES.map((b) => (
                            <div
                                key={b.text}
                                className="flex items-center gap-1.5 sm:gap-2"
                            >
                                <div className="flex items-center justify-center shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600">
                                    <span className="flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                        {b.icon}
                                    </span>
                                </div>

                                <span className="text-[10px] sm:text-sm font-bold text-gray-700">
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
