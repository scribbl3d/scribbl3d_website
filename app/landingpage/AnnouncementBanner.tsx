"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementContent } from "@/components/announcement-content";
import { announcementSchema, showStorefrontAnnouncement, type Announcement } from "@/lib/announcements";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const allowed = showStorefrontAnnouncement(pathname);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);
  const activeIndex = currentIndex % Math.max(announcements.length, 1);
  const entranceClass = reducedMotion ? "" : "motion-safe:animate-[announcement-drop_650ms_ease-out_both]";

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const response = await fetch("/api/announcements", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!Array.isArray(data)) return;
        const published = data.flatMap((item) => {
          if (!item || typeof item !== "object" || typeof item.id !== "string") return [];
          const { id, ...fields } = item;
          const parsed = announcementSchema.safeParse(fields);
          return parsed.success && parsed.data.isActive ? [{ id, ...parsed.data }] : [];
        });
        if (!controller.signal.aborted) setAnnouncements(published);
      } catch {
        return;
      } finally {
        pending = false;
      }
    };
    void refresh();
    const interval = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [allowed]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const updateHeight = () => {
      const height = allowed ? bannerRef.current?.getBoundingClientRect().height || 0 : 0;
      root.style.setProperty("--announcement-height", `${height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (bannerRef.current) observer.observe(bannerRef.current);
    return () => {
      observer.disconnect();
      root.style.setProperty("--announcement-height", "0px");
    };
  }, [allowed, announcements]);

  const next = useCallback(() => setCurrentIndex((index) => (index + 1) % Math.max(announcements.length, 1)), [announcements.length]);

  useEffect(() => {
    if (!allowed || announcements.length < 2 || hovered || focused || reducedMotion || !visible) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [allowed, announcements.length, hovered, focused, reducedMotion, visible, next]);

  if (!allowed || !announcements.length) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Store announcements"
      aria-roledescription={announcements.length > 1 ? "carousel" : undefined}
      aria-describedby={announcements.length > 1 ? "announcement-instructions" : undefined}
      tabIndex={announcements.length > 1 ? 0 : undefined}
      className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-white/10 bg-[#080e1c] font-manrope text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || announcements.length < 2) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCurrentIndex((index) => (index - 1 + announcements.length) % announcements.length);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {announcements.length > 1 && (
        <p id="announcement-instructions" className="sr-only">Announcements rotate every four seconds. Focus or hover over this bar to pause. Use the left and right arrow keys while the bar is focused to browse announcements.</p>
      )}
      <div className="relative mx-auto grid min-h-11 max-w-7xl items-center px-4 py-2 sm:min-h-12 sm:px-8" aria-live={focused || reducedMotion ? "polite" : "off"}>
        {announcements.map((announcement, index) => (
          <div key={announcement.id} role="group" aria-label={`${index + 1} of ${announcements.length}`} aria-hidden={index !== activeIndex} className={`min-w-0 [grid-area:1/1] ${index === activeIndex ? `visible ${entranceClass}` : "invisible"}`}>
            <AnnouncementContent announcement={announcement} interactive={index === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
