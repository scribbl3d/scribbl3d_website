"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getLqipUrl } from "@/lib/cloudinary-url";

interface PdpImageProps {
    src: string;
    alt: string;
    className?: string;
    loading?: "eager" | "lazy";
}

/**
 * PDP image with smooth crossfade between sources + initial skeleton.
 *
 * - First load: shows a soft pulsing skeleton with shimmer sweep.
 * - Subsequent src changes (carousel navigation): crossfades from the
 *   previous image to the new one — no skeleton flash, no jerk.
 * - Preloads the new src in a hidden Image() so the swap is instant
 *   when the image is already cached.
 */
export function PdpImage({
    src,
    alt,
    className = "w-full h-full object-contain",
    loading = "eager",
}: PdpImageProps) {
    const [displaySrc, setDisplaySrc] = useState(src);
    const [nextSrc, setNextSrc] = useState<string | null>(null);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const loadedSrcs = useRef<Set<string>>(new Set());
    const lqip = getLqipUrl(src);

    // When src prop changes, handle crossfade
    useEffect(() => {
        if (src === displaySrc) return;

        // Already cached — swap instantly
        if (loadedSrcs.current.has(src)) {
            setDisplaySrc(src);
            return;
        }

        // Preload in background, then crossfade
        setNextSrc(src);
        setTransitioning(true);
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedSrcs.current.add(src);
            setDisplaySrc(src);
            setNextSrc(null);
            // Small delay so the CSS transition can run
            setTimeout(() => setTransitioning(false), 50);
        };
        img.onerror = () => {
            setDisplaySrc(src);
            setNextSrc(null);
            setTransitioning(false);
        };
    }, [src, displaySrc]);

    const onLoad = useCallback(() => {
        loadedSrcs.current.add(displaySrc);
        setInitialLoaded(true);
    }, [displaySrc]);

    const showSkeleton = !initialLoaded;

    return (
        <>
            {/* Skeleton — only on very first load */}
            {showSkeleton && (
                <div className="absolute inset-0 z-10">
                    {/* Soft pulsing base */}
                    <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />

                    {/* Shimmer sweep */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background:
                                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                            backgroundSize: "250% 100%",
                            animation: "shimmer 2s ease-in-out infinite",
                        }}
                    />

                    {/* Image icon hint */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 sm:w-14 sm:h-14 text-gray-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>

                    {/* LQIP blur preview */}
                    {lqip && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={lqip}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-contain scale-105 blur-lg opacity-50"
                        />
                    )}
                </div>
            )}

            {/* Current displayed image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={displaySrc}
                alt={alt}
                className={`${className} transition-opacity duration-500 ease-in-out ${initialLoaded ? "opacity-100" : "opacity-0"} ${transitioning ? "opacity-70" : ""}`}
                loading={loading}
                onLoad={onLoad}
            />

            {/* Hidden next image for crossfade preload (renders off-screen) */}
            {nextSrc && nextSrc !== displaySrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={nextSrc}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-contain opacity-0 pointer-events-none"
                />
            )}
        </>
    );
}
