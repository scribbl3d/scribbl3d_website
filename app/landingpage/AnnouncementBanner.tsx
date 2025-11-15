"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Announcement {
  id: string;
  text: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements");
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        } else {
          console.error("Failed to fetch announcements");
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  const transitionToNext = useCallback(() => {
    if (announcements.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) =>
      prev === announcements.length - 1 ? 0 : prev + 1
    );
  }, [announcements.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(transitionToNext, 3000);
  }, [transitionToNext]);

  const transitionToPrevious = useCallback(() => {
    if (announcements.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? announcements.length - 1 : prev - 1
    );
    resetTimer();
  }, [announcements.length, resetTimer]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer]);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-[#1a1a1a] text-white h-12 overflow-hidden">
      <div className="flex items-center justify-center h-full px-4 sm:px-6 md:px-8 lg:px-[250px]">
        <div className="relative w-full h-full overflow-hidden">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`absolute w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 transform translate-y-0"
                  : index ===
                        (currentIndex - 1 + announcements.length) %
                          announcements.length && direction === -1
                    ? "opacity-0 transform translate-y-full"
                    : index === (currentIndex + 1) % announcements.length &&
                        direction === 1
                      ? "opacity-0 transform -translate-y-full"
                      : direction === -1
                        ? "opacity-0 transform -translate-y-full"
                        : "opacity-0 transform translate-y-full"
              }`}
            >
              <p className="text-sm font-medium tracking-wide uppercase whitespace-nowrap">
                {announcement.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={transitionToPrevious}
        className="absolute left-2 sm:left-4 md:left-6 lg:left-[250px] top-1/2 transform -translate-y-1/2 p-1 hover:opacity-75 transition-opacity"
        aria-label="Previous announcement"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={transitionToNext}
        className="absolute right-2 sm:right-4 md:right-6 lg:right-[250px] top-1/2 transform -translate-y-1/2 p-1 hover:opacity-75 transition-opacity"
        aria-label="Next announcement"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
