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

    const [img0, img1, img2, img3, img4, img5, img6, img7] = sorted;

    return (
        <section className="w-full bg-white pt-6 sm:pt-8 lg:pt-10 pb-2 sm:pb-4 lg:pb-6 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 justify-center">
                        Printed by You.
                    </SplitText>
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 justify-center">
                        Powered by Scribbl3D.
                    </SplitText>
                    <AnimatedSubtext className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-500 max-w-xs sm:max-w-lg mx-auto">
                        Join thousands of makers worldwide pushing the limits of
                        desktop manufacturing.
                    </AnimatedSubtext>
                </div>

                {/* Grid */}
                <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-3 sm:gap-5 lg:gap-5 md:h-[600px] lg:h-[650px]">
                    {img0 && (
                        <ImageCard
                            img={img0}
                            className="col-span-2 row-span-2"
                        />
                    )}
                    {img1 && <ImageCard img={img1} />}
                    {img3 && <ImageCard img={img3} className="row-span-2" />}
                    {img2 && <ImageCard img={img2} />}
                    {img4 && <ImageCard img={img4} />}
                    {img5 && <ImageCard img={img5} />}
                    {img6 && <ImageCard img={img6} />}
                    {img7 && <ImageCard img={img7} />}
                </div>
            </div>
        </section>
    );
}
