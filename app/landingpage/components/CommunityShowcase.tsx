"use client";

import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface CommunityImageItem {
    id: string;
    imageUrl: string;
    altText?: string | null;
    linkPath?: string | null;
    sortOrder?: number;
}

interface CommunityShowcaseProps {
    images: CommunityImageItem[];
}

// 1. Refactored ImageCard to properly apply Grid/Bento sizing classes
function ImageCard({
    img,
    className = "",
}: {
    img: CommunityImageItem;
    className?: string;
}) {
    const content = (
        <img
            src={img.imageUrl}
            alt={img.altText || "Community print"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
    );

    // Common classes: group ensures hover works, overflow-hidden ensures corners stay perfectly round
    const baseClasses = `group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100 ${className}`;

    if (img.linkPath) {
        return (
            <Link href={img.linkPath} className={`block ${baseClasses}`}>
                {content}
            </Link>
        );
    }

    return <div className={baseClasses}>{content}</div>;
}

export default function CommunityShowcase({ images }: CommunityShowcaseProps) {
    if (!images?.length) return null;

    const sorted = [...images].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );

    // Safely assign sorted images
    const [img0, img1, img2, img3, img4, img5, img6, img7] = sorted;

    return (
        <section className="w-full bg-white py-10 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16">
                {/* Header */}
                <div className="text-center mb-10">
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

                {/* ── Desktop: Single Edge-to-Edge Bento Grid ── */}
                {/* A 4-column, 3-row grid. Auto-placement puts everything in the exact right spot. */}
                <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-3 lg:gap-4 h-[600px] xl:h-[750px]">
                    {/* Top Left (Huge 2x2 Square) */}
                    {img0 && (
                        <ImageCard
                            img={img0}
                            className="col-span-2 row-span-2"
                        />
                    )}

                    {/* Top Middle (Small 1x1) */}
                    {img1 && (
                        <ImageCard
                            img={img1}
                            className="col-span-1 row-span-1"
                        />
                    )}

                    {/* Top Right (Tall 1x2 Rectangle) */}
                    {img3 && (
                        <ImageCard
                            img={img3}
                            className="col-span-1 row-span-2"
                        />
                    )}

                    {/* Middle Middle (Small 1x1, naturally drops under img1) */}
                    {img2 && (
                        <ImageCard
                            img={img2}
                            className="col-span-1 row-span-1"
                        />
                    )}

                    {/* Bottom Row (Four 1x1 Squares) */}
                    {img4 && (
                        <ImageCard
                            img={img4}
                            className="col-span-1 row-span-1"
                        />
                    )}
                    {img5 && (
                        <ImageCard
                            img={img5}
                            className="col-span-1 row-span-1"
                        />
                    )}
                    {img6 && (
                        <ImageCard
                            img={img6}
                            className="col-span-1 row-span-1"
                        />
                    )}
                    {img7 && (
                        <ImageCard
                            img={img7}
                            className="col-span-1 row-span-1"
                        />
                    )}
                </div>

                {/* ── Mobile Layout ── */}
                <div className="flex flex-col gap-3 md:hidden">
                    {img0 && (
                        <ImageCard img={img0} className="w-full aspect-[4/3]" />
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        {img1 && (
                            <ImageCard img={img1} className="aspect-square" />
                        )}
                        {img2 && (
                            <ImageCard img={img2} className="aspect-square" />
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {img3 && (
                            <ImageCard img={img4} className="aspect-square" />
                        )}
                        {img4 && (
                            <ImageCard img={img5} className="aspect-square" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
