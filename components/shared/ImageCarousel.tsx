"use client";

import { imageLoader } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

interface ImageCarouselProps {
    images: string[];
    name: string;
    width?: number;
    height?: number;
    className?: string;
}

/**
 * ImageCarousel Component
 * Displays a swipeable carousel of product images with touch support
 * Includes navigation dots and handles empty states
 */
export function ImageCarousel({
    images,
    name,
    width = 270,
    height = 270,
    className = "",
}: ImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Add swipe support while keeping the original click handlers
    const handlers = useSwipeable({
        onSwipedLeft: () =>
            setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % images.length
            ),
        onSwipedRight: () =>
            setCurrentImageIndex(
                (prevIndex) => (prevIndex - 1 + images.length) % images.length
            ),
        trackMouse: true,
    });

    if (!images || images.length === 0) {
        return (
            <div
                className={`relative bg-gray-200 flex items-center justify-center rounded-2xl ${className}`}
                style={{ width: `${width}px`, height: `${height}px` }}
            >
                <span className="text-gray-500">No image available</span>
            </div>
        );
    }

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(
            (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ width: `${width}px`, height: `${height}px` }}
            {...handlers}
        >
            <div className="w-full h-full overflow-hidden rounded-2xl">
                <Image
                    loader={imageLoader}
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${name} - Image ${currentImageIndex + 1}`}
                    width={width}
                    height={height}
                    quality={85}
                    priority={currentImageIndex === 0}
                    loading={currentImageIndex === 0 ? "eager" : "lazy"}
                    className="rounded-2xl object-cover"
                    unoptimized={true}
                />
            </div>
            {images.length > 1 && (
                <>
                    <button
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full bg-white p-2 touch-manipulation"
                        onClick={prevImage}
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full bg-white p-2 touch-manipulation"
                        onClick={nextImage}
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                    {/* Add dots for mobile */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                    index === currentImageIndex
                                        ? "bg-white"
                                        : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
