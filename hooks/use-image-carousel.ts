"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseImageCarouselOptions {
    autoPlayInterval?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
}

export function useImageCarousel(
    images: string[], 
    options: UseImageCarouselOptions = {}
) {
    const {
        autoPlayInterval = 3000,
        pauseOnHover = true,
        loop = true,
    } = options;

    const [current, setCurrent] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isTouching, setIsTouching] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const totalImages = images.length;

    const next = useCallback(() => {
        setCurrent(c => loop ? (c + 1) % totalImages : Math.min(c + 1, totalImages - 1));
    }, [totalImages, loop]);

    const prev = useCallback(() => {
        setCurrent(c => loop ? (c === 0 ? totalImages - 1 : c - 1) : Math.max(c - 1, 0));
    }, [totalImages, loop]);

    const goTo = useCallback((index: number) => {
        if (index >= 0 && index < totalImages) {
            setCurrent(index);
        }
    }, [totalImages]);

    // Auto-play
    useEffect(() => {
        if (!autoPlayInterval || totalImages <= 1) return;
        if ((pauseOnHover && isHovering) || isTouching) return;

        const interval = setInterval(next, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlayInterval, totalImages, isHovering, isTouching, pauseOnHover, next]);

    // Touch handlers
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        setIsTouching(true);
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        const threshold = 50;
        
        if (diff > threshold) next();
        else if (diff < -threshold) prev();
        
        touchStartX.current = null;
        setIsTouching(false);
    }, [next, prev]);

    return {
        current,
        next,
        prev,
        goTo,
        isHovering,
        setIsHovering,
        isTouching,
        totalImages,
        canGoNext: loop || current < totalImages - 1,
        canGoPrev: loop || current > 0,
        touchHandlers: {
            onTouchStart,
            onTouchEnd,
        },
    };
}
