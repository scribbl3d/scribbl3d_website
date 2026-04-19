"use client";

import { useEffect, useRef, useState } from "react";
import { STATS } from "./constants";
import { useCountUp } from "./useCountUp";

interface StatCardProps {
    icon: React.ReactNode;
    value: number;
    suffix: string;
    label: string;
    active: boolean;
}

function StatCard({ icon, value, suffix, label, active }: StatCardProps) {
    const count = useCountUp(value, 1600, active);

    return (
        <>
            {/* Icon */}
            <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[14px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-lg sm:text-[22px] mb-2 sm:mb-3">
                {icon}
            </div>

            {/* Number */}
            <div className="text-xl sm:text-[26px] font-extrabold text-[#0F172A] leading-none mb-1 sm:mb-1.5">
                {count}
                {suffix}
            </div>

            {/* Label */}
            <div className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-[#64748B] text-center">
                {label}
            </div>
        </>
    );
}

export default function StatsSection() {
    const ref = useRef<HTMLElement>(null);
    const [active, setActive] = useState(false);

    // Calculate dynamic years of experience
    const currentYear = new Date().getFullYear();
    const baseYear = 2022;
    const dynamicYearsOfExperience = currentYear - baseYear;

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => {
                setActive(entry.isIntersecting);
            },
            { threshold: 0.4 },
        );

        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section
            ref={ref}
            style={{
                background: "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
            }}
        >
            <div className="max-w-[1080px] mx-auto px-4 py-4 sm:py-6 grid grid-cols-2 gap-3 sm:gap-4">
                {STATS.map((s) => {
                    // ✅ Looks for "experience" to match your constants.ts file
                    const isExperienceStat = s.label
                        .toLowerCase()
                        .includes("experience");
                    const displayValue = isExperienceStat
                        ? dynamicYearsOfExperience
                        : s.value;

                    // ✅ Forces the text shown on screen to be "Years of Experience"
                    const displayLabel = isExperienceStat
                        ? "Years of Experience"
                        : s.label;

                    return (
                        <div
                            key={s.label}
                            className="bg-[#F8FAFC] rounded-2xl sm:rounded-[16px] py-4 px-3 sm:py-6 sm:px-4 flex flex-col items-center justify-center min-h-[110px] sm:min-h-[140px]"
                        >
                            <StatCard
                                icon={s.icon}
                                value={displayValue}
                                suffix={s.suffix}
                                label={displayLabel}
                                active={active}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Desktop layout */}
            <style jsx>{`
                @media (min-width: 768px) {
                    .max-w-[1080px] {
                        grid-template-columns: repeat(4, 1fr) !important;
                        gap: 24px !important;
                        padding: 40px 24px !important;
                    }
                }
            `}</style>
        </section>
    );
}
