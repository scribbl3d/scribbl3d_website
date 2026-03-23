"use client";

import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface CommunityImageItem {
    id: string;
    imageUrl: string;
    altText?: string | null;
    linkPath?: string | null;
}

interface CommunityShowcaseProps {
    images: CommunityImageItem[];
}

export default function CommunityShowcase({ images }: CommunityShowcaseProps) {
    if (!images?.length) return null;

    return (
        <section className="w-full bg-white pt-10 sm:pt-16 pb-6 sm:pb-8 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-10">
                    <SplitText className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 justify-center">
                        Printed by You.
                    </SplitText>
                    <SplitText className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 justify-center">
                        Powered by Scribbl3D.
                    </SplitText>
                    <AnimatedSubtext className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 max-w-xs sm:max-w-lg mx-auto">
                        Join thousands of makers worldwide pushing the limits of
                        desktop manufacturing.
                    </AnimatedSubtext>
                </div>
            </div>

            {/* Marquee — full width */}
            <div className="group relative">
                <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
                    {[...images, ...images, ...images].map((img, index) => {
                        const card = (
                            <div className="flex-shrink-0 w-[140px] sm:w-[200px] lg:w-[260px] aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 cursor-pointer">
                                <img
                                    src={img.imageUrl}
                                    alt={img.altText || "Community print"}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        );

                        return (
                            <div
                                key={`${img.id}-${index}`}
                                className="flex-shrink-0 px-1.5 sm:px-2"
                            >
                                {img.linkPath ? (
                                    <Link href={img.linkPath}>{card}</Link>
                                ) : (
                                    card
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
