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
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "#EFF6FF",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: 12,
                }}
            >
                {icon}
            </div>

            {/* Number */}
            <div
                style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1,
                    marginBottom: 6,
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {count}
                {suffix}
            </div>

            {/* Label */}
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#64748B",
                    textAlign: "center",
                }}
            >
                {label}
            </div>
        </>
    );
}

export default function StatsSection() {
    const ref = useRef<HTMLElement>(null);
    const [active, setActive] = useState(false);

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
            <div
                style={{
                    maxWidth: 1080,
                    margin: "0 auto",
                    padding: "24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)", // ✅ mobile bento grid
                    gap: "16px",
                }}
            >
                {STATS.map((s) => (
                    <div
                        key={s.label}
                        style={{
                            background: "#F8FAFC",
                            borderRadius: 16,
                            padding: "24px 16px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 140,
                        }}
                    >
                        <StatCard {...s} active={active} />
                    </div>
                ))}
            </div>

            {/* Desktop layout */}
            <style jsx>{`
                @media (min-width: 768px) {
                    div {
                        grid-template-columns: repeat(4, 1fr) !important;
                        gap: 24px !important;
                        padding: 40px 24px !important;
                    }
                }
            `}</style>
        </section>
    );
}
