"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const HEADER_H = 80;   // px — keep in sync with your navbar
const DOTS_ZONE = 56;  // px — reserved so indicators never overlap text
const MIN_H = 320;     // px — floor for very wide/short banners

interface HeroBannerSlide {
  id: string;
  headline?: string | null;
  headlineAccent?: string | null;
  subtext?: string | null;
  mediaUrl: string;
  mediaType: string;
  altText?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  duration: number;
  buttonGradientFrom?: string | null;
  buttonGradientTo?: string | null;
  textColor?: string | null;
  showGradient?: boolean;
  /** CSS object-position, e.g. "center top" — only matters if a slide must crop */
  focalPoint?: string | null;
}

interface HeroBannerProps {
  slides: HeroBannerSlide[];
  animate?: boolean;
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const wordVariant = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 100 } },
};
const accentVariant = {
  hidden: { x: -60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 18, stiffness: 80, delay: 0.45 } },
};
const subtextVariant = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.55, ease: "easeOut", delay: 0.7 } },
};
const ctaVariant = {
  hidden: { x: -40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 18, stiffness: 90, delay: 0.9 } },
};

function SplitHeadline({
  text,
  animate,
  color,
}: {
  text: string;
  animate: boolean;
  color: string;
}) {
  return (
    <motion.h1
      variants={staggerContainer}
      initial="hidden"
      {...(animate ? { whileInView: "visible", viewport: { margin: "-50px" } } : {})}
      className="font-manrope font-extrabold leading-[0.92] tracking-tighter text-[clamp(1.6rem,6.2vw,5rem)]"
      style={{ color }}
    >
      {text.split("\n").map((line, li) => (
        <span key={li} className="block overflow-hidden">
          {line.split(" ").map((word, wi) => (
            <motion.span
              key={`${li}-${wi}`}
              variants={wordVariant}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

export default function HeroBanner({ slides, animate = true }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasAnimatedFirst, setHasAnimatedFirst] = useState(false);

  // natural w/h per slide index — drives the section height so nothing letterboxes
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [boxW, setBoxW] = useState(0);
  const [viewportH, setViewportH] = useState(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const registerRatio = useCallback((i: number, w: number, h: number) => {
    if (!w || !h) return;
    setRatios((prev) => (prev[i] ? prev : { ...prev, [i]: w / h }));
  }, []);

  // measure container width
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    setBoxW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setBoxW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // measure usable viewport height (svh-equivalent, updates on mobile chrome resize)
  useEffect(() => {
    const read = () =>
      setViewportH(window.visualViewport?.height ?? window.innerHeight);
    read();
    window.addEventListener("resize", read);
    window.visualViewport?.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("resize", read);
    };
  }, []);

  useEffect(() => {
    if (animate && !hasAnimatedFirst) setHasAnimatedFirst(true);
  }, [animate, hasAnimatedFirst]);
  const shouldAnimate = hasAnimatedFirst || animate;

  const next = useCallback(
    () => setCurrent((p) => (p + 1) % slides.length),
    [slides.length]
  );

  // autoplay / video advance
  useEffect(() => {
    const slide = slides[current];
    if (!slide || slides.length <= 1 || !shouldAnimate) return;

    if (slide.mediaType === "video") {
      const v = videoRefs.current.get(current);
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      return;
    }

    if (isPaused) return;
    const t = setTimeout(next, slide.duration || 5000);
    return () => clearTimeout(t);
  }, [current, isPaused, next, slides, shouldAnimate]);

  // pause off-screen videos
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (i !== current) {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [current]);

  if (!slides.length) return null;

  const slide = slides[current];
  const textColor = slide.textColor || "#ffffff";
  const gradFrom = slide.buttonGradientFrom || "#4f46e5";
  const gradTo = slide.buttonGradientTo || "#7c3aed";

  const ratio = ratios[current] ?? 16 / 9;
  const maxH = viewportH ? viewportH - HEADER_H : 0;
  const boxH =
    boxW && maxH ? Math.max(MIN_H, Math.min(boxW / ratio, maxH)) : undefined;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0a0a0f] transition-[height] duration-500 ease-out"
      style={{
        marginTop: HEADER_H,
        height: boxH,
        minHeight: MIN_H,
        // pre-hydration / pre-measure fallback so there's no layout jump
        aspectRatio: boxH ? undefined : "16 / 9",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Media */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {s.mediaType === "video" ? (
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(i, el);
              }}
              src={s.mediaUrl}
              muted
              playsInline
              onEnded={next}
              onLoadedMetadata={(e) =>
                registerRatio(i, e.currentTarget.videoWidth, e.currentTarget.videoHeight)
              }
              className="h-full w-full object-cover"
              style={{ objectPosition: s.focalPoint || "center" }}
            />
          ) : (
            <Image
              src={s.mediaUrl}
              alt={s.altText || s.headline || "Hero banner"}
              fill
              priority={i === 0}
              quality={85}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: s.focalPoint || "center" }}
              onLoad={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                registerRatio(i, img.naturalWidth, img.naturalHeight);
              }}
            />
          )}

          {s.showGradient !== false && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:bg-gradient-to-r sm:from-black/85 sm:via-black/35 sm:to-transparent" />
          )}
        </div>
      ))}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 sm:justify-center sm:px-10 lg:px-16"
          style={{ paddingBottom: DOTS_ZONE }}
        >
          {slide.headline && (
            <SplitHeadline
              text={slide.headline}
              animate={shouldAnimate}
              color={textColor}
            />
          )}

          {slide.headlineAccent && (
            <motion.h2
              variants={accentVariant}
              initial="hidden"
              {...(shouldAnimate
                ? { whileInView: "visible", viewport: { margin: "-50px" } }
                : {})}
              className="font-manrope mt-1 font-extrabold leading-[0.92] tracking-tighter text-[#c4b5fd] text-[clamp(1.6rem,6.2vw,5rem)]"
            >
              {slide.headlineAccent.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </motion.h2>
          )}

          {slide.subtext && (
            <motion.p
              variants={subtextVariant}
              initial="hidden"
              {...(shouldAnimate
                ? { whileInView: "visible", viewport: { margin: "-50px" } }
                : {})}
              className="mt-3 line-clamp-3 max-w-xs font-light leading-relaxed text-[clamp(0.85rem,1.5vw,1.4rem)] sm:mt-6 sm:max-w-md lg:max-w-xl"
              style={{ color: `${textColor}cc` }}
            >
              {slide.subtext}
            </motion.p>
          )}

          {slide.buttonText && slide.buttonLink && (
            <motion.div
              variants={ctaVariant}
              initial="hidden"
              {...(shouldAnimate
                ? { whileInView: "visible", viewport: { margin: "-50px" } }
                : {})}
              className="mt-5 sm:mt-8"
            >
              <Link
                href={slide.buttonLink}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] sm:gap-3 sm:px-8 sm:py-4 sm:text-base"
                style={{
                  background: `linear-gradient(to right, ${gradFrom}, ${gradTo})`,
                  boxShadow: `0 10px 25px ${gradFrom}33`,
                }}
              >
                {slide.buttonText}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 13 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect
                    x="0.38"
                    y="0.99"
                    width="12.03"
                    height="12.03"
                    rx="6.01"
                    stroke="currentColor"
                    strokeWidth="0.76"
                  />
                  <path
                    d="M4 9.39L8.79 4.6M8.79 4.6H4.48M8.79 4.6V8.92"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Indicators — always within the first screen */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 w-8 rounded-full transition-all duration-300 sm:w-12 ${
                i === current ? "bg-white" : "bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>
      )}
    </section>
  );
}