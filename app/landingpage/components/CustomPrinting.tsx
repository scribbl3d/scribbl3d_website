"use client";

import { CheckCircle2, Upload } from "lucide-react";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

const FEATURES = [
    "Material Selection Guidance",
    "Post-Processing & Finishing",
    "Global Shipping & Fulfillment",
];

export default function CustomPrinting() {
    return (
        <section className="w-full bg-white py-10 sm:py-16 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
                    {/* Left: Images */}
                    <div className="relative flex gap-3 sm:gap-4 justify-center">
                        {/* Image 1 */}
                        <div className="w-[45%] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0a0f]">
                            <img
                                src="/images/landing/custom-heart.jpg"
                                alt="3D printed anatomical heart"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Image 2 + stat badge */}
                        <div className="w-[50%] flex flex-col gap-3 sm:gap-4">
                            <div className="flex-1 rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0a0f]">
                                <img
                                    src="/images/landing/custom-building.jpg"
                                    alt="3D printed architectural model"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Stat badge */}
                            <div className="bg-[#4f46e5] rounded-xl sm:rounded-2xl p-3 sm:p-5">
                                <p className="text-2xl sm:text-3xl font-bold text-white">
                                    24h
                                </p>
                                <p className="text-[11px] sm:text-sm text-blue-200 mt-0.5 sm:mt-1">
                                    Average quote time for industrial
                                    prototypes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                            <SplitText as="p" className="text-gray-900">
                                Your Digital Design,
                            </SplitText>
                            <SplitText as="p" className="text-[#4f46e5]">
                                Our Precision Hardware.
                            </SplitText>
                        </h2>

                        <AnimatedSubtext className="mt-3 sm:mt-5 text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed max-w-lg">
                            Upload your .STL or .OBJ files and let our
                            state-of-the-art print farm handle the rest. We
                            specialize in high-temp engineering plastics and
                            medical-grade resins.
                        </AnimatedSubtext>

                        {/* Feature list */}
                        <div className="flex flex-col gap-3 sm:gap-4 mt-5 sm:mt-8">
                            {FEATURES.map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-2 sm:gap-3"
                                >
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#4f46e5] flex-shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link
                            href="/personalise"
                            className="inline-flex items-center gap-2 mt-5 sm:mt-8 px-5 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] transition-colors"
                        >
                            Get an Instant Quote{" "}
                            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
