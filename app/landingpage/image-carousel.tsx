"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CarouselItem {
    id: string;
    type: "image" | "video";
    src: string;
}

const SLIDE_INTERVAL = 5000; // 5 seconds

export default function ImageCarousel() {
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [index, setIndex] = useState(0);

    // Fetch carousel items (SAFE)
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/carousel");
                const data = await res.json();

                if (Array.isArray(data)) {
                    setItems(data);
                } else {
                    console.error("Carousel API returned non-array:", data);
                    setItems([]);
                }
            } catch (err) {
                console.error("Failed to load carousel:", err);
                setItems([]);
            }
        };

        load();
    }, []);

    // Auto slide (stable, no reset on click)
    useEffect(() => {
        if (items.length <= 1) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length);
        }, SLIDE_INTERVAL);

        return () => clearInterval(interval);
    }, [items.length]);

    // Guards
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const prevSlide = () => {
        setIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const nextSlide = () => {
        setIndex((prev) => (prev + 1) % items.length);
    };

    return (
        <div className="relative w-full aspect-[2/1] overflow-hidden">
            {/* Slides */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="w-full h-full flex-shrink-0 relative"
                    >
                        {item.type === "video" ? (
                            <video
                                src={item.src}
                                className="w-full h-full object-cover"
                                muted
                                autoPlay
                                loop
                                playsInline
                            />
                        ) : (
                            <Image
                                src={item.src}
                                alt="Carousel slide"
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2
                   bg-black/40 hover:bg-black/60 text-white
                   p-2 rounded-full transition"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Right Arrow */}
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2
                   bg-black/40 hover:bg-black/60 text-white
                   p-2 rounded-full transition"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                            i === index ? "bg-white" : "bg-white/50"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
