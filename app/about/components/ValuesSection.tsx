"use client";

import { SplitText } from "../../landingpage/components/SplitText"; // Adjust import path if needed
import { VALUES } from "./constants";

export default function ValuesSection() {
    return (
        <section className="px-6 py-10 lg:py-16 bg-slate-50">
            <div className="max-w-[1240px] mx-auto">
                {/* ── Animated Header ── */}
                <div className="text-center mb-8 lg:mb-12">
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                        The Values that Drive Us
                    </SplitText>
                </div>

                {/* ── Cards Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {VALUES.map((v) => (
                        <div
                            key={v.title}
                            className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Icon Container */}
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 mb-8">
                                <span className="flex items-center justify-center w-7 h-7 text-white [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current">
                                    {v.icon}
                                </span>
                            </div>

                            {/* Text Content */}
                            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-3">
                                {v.title}
                            </h3>

                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                                {v.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
