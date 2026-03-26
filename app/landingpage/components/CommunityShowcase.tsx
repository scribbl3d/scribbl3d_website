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

function ImageCard({
    img,
    className,
}: {
    img: CommunityImageItem;
    className?: string;
}) {
    const inner = (
        <div
            className={`overflow-hidden rounded-2xl bg-gray-200 cursor-pointer ${className || ""}`}
        >
            <img
                src={img.imageUrl}
                alt={img.altText || "Community print"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
        </div>
    );

    return img.linkPath ? <Link href={img.linkPath}>{inner}</Link> : inner;
}

export default function CommunityShowcase({ images }: CommunityShowcaseProps) {
    if (!images?.length) return null;

    // Sort by sortOrder — index 0 is hero (large), rest fill the grid
    const sorted = [...images].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );

    // Desktop needs 8 images, mobile needs 3
    const img0 = sorted[0]; // Hero — large (col-span-2, row-span-2)
    const img1 = sorted[1]; // Top-right small
    const img2 = sorted[2]; // Mid-right
    const img3 = sorted[3]; // Top-far-right
    const img4 = sorted[4]; // Bottom row
    const img5 = sorted[5];
    const img6 = sorted[6];
    const img7 = sorted[7];

    return (
        <section className="w-full bg-white pt-10 sm:pt-16 pb-6 sm:pb-10 overflow-hidden">
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

                {/* ── Desktop: Bento Grid ── */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 lg:gap-4 h-[500px] lg:h-[600px]">
                    {/* Row 1 */}
                    {img0 && (
                        <div className="col-span-2 row-span-2">
                            <ImageCard img={img0} className="w-full h-full" />
                        </div>
                    )}
                    {img1 && <ImageCard img={img1} className="w-full h-full" />}
                    {img3 && <ImageCard img={img3} className="w-full h-full" />}

                    {/* Row 2 */}
                    {img2 && <ImageCard img={img2} className="w-full h-full" />}
                    {/* Position 3 already in row-span-2, so skip to next */}
                </div>

                {/* Bottom row — 4 equal columns */}
                <div className="hidden md:grid grid-cols-4 gap-3 lg:gap-4 mt-3 lg:mt-4 h-[200px] lg:h-[240px]">
                    {img4 && <ImageCard img={img4} className="w-full h-full" />}
                    {img5 && <ImageCard img={img5} className="w-full h-full" />}
                    {img6 && <ImageCard img={img6} className="w-full h-full" />}
                    {img7 && <ImageCard img={img7} className="w-full h-full" />}
                </div>

                {/* ── Mobile: 3 images — hero on top, 2 below ── */}
                <div className="md:hidden">
                    {img0 && (
                        <div className="mb-2">
                            <ImageCard
                                img={img0}
                                className="w-full aspect-[16/10]"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {img1 && (
                            <ImageCard
                                img={img1}
                                className="w-full aspect-square"
                            />
                        )}
                        {img2 && (
                            <ImageCard
                                img={img2}
                                className="w-full aspect-square"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
