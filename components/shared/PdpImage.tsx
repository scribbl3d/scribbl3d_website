"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
    const loadedSrcs = useRef<Set<string>>(new Set());

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
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedSrcs.current.add(src);
            setDisplaySrc(src);
            setNextSrc(null);
        };
        img.onerror = () => {
            setDisplaySrc(src);
            setNextSrc(null);
        };
    }, [src, displaySrc]);

    const onLoad = useCallback(() => {
        loadedSrcs.current.add(displaySrc);
        setInitialLoaded(true);
    }, [displaySrc]);

    return (
        <>
            {/* Current displayed image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={displaySrc}
                alt={alt}
                className={`${className} transition-opacity duration-300 ease-in-out ${initialLoaded ? "opacity-100" : "opacity-0"}`}
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
