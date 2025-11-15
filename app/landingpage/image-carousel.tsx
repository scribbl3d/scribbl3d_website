"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: string;
  type: "image" | "video";
  src: string;
  duration: number;
}

export default function ImageCarousel() {
  const [media, setMedia] = useState<CarouselItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch("/api/admin/carousel");
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      } else {
        console.error("Failed to fetch carousel items");
      }
    } catch (error) {
      console.error("Error fetching carousel items:", error);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
  }, [media.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + media.length) % media.length
    );
  }, [media.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isPlaying && media.length > 0) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, media[currentIndex].duration);
    }
  }, [isPlaying, media, currentIndex, nextSlide]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPlaying, resetTimer]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    resetTimer();
  };

  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  const getItemStyle = (index: number) => {
    const totalItems = media.length;
    let translateX = (index - currentIndex) * 100;

    if (currentIndex === 0 && index === totalItems - 1) {
      translateX = -100;
    } else if (currentIndex === totalItems - 1 && index === 0) {
      translateX = 100;
    }

    return {
      transform: `translateX(${translateX}%)`,
      transition: "transform 500ms ease-in-out",
      width: "100%",
      flexShrink: 0,
    };
  };

  if (media.length === 0) {
    return (
      <div className="w-full aspect-[2/1] bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className="relative w-full aspect-[2/1] max-h-screen overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="absolute top-0 left-0 w-full h-full"
            style={getItemStyle(index)}
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              <Image
                src={item.src}
                alt={`Carousel image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                priority={
                  index === currentIndex ||
                  index === (currentIndex + 1) % media.length
                }
                unoptimized={true} // Key prop
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          prevSlide();
          resetTimer();
        }}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-30 transition-opacity duration-300 hover:bg-black/70"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => {
          nextSlide();
          resetTimer();
        }}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-30 transition-opacity duration-300 hover:bg-black/70"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {media.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex
                ? "bg-white"
                : "bg-gray-400 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
