"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ComponentProps {
  videoSrc?: string;
}

export default function Component({
  videoSrc = "/videos/hero.mp4",
}: ComponentProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 1.0;
      video.addEventListener("loadeddata", () => setIsVideoLoaded(true));
    }

    const ctx = gsap.context(() => {
      gsap.to(sectionRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      video?.removeEventListener("loadeddata", () => setIsVideoLoaded(true));
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden opacity-0 aspect-video "
    >
      {!isVideoLoaded && <div className="absolute inset-0 animate-pulse" />}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload={isMobile ? "metadata" : "auto"}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-16 ">
          <div className="w-full max-w-[90rem] mx-auto">
            <h2 className="text-right text-2xl sm:text-4xl md:text-[52px] font-normal leading-tight md:leading-[1.2] text-[#676B3F] font-aboreto drop-shadow-lg">
              <span className=" px-2 py-1 inline-block">GOT</span>
              <br />
              <span className=" px-2 py-1 inline-block">
                SUSTAINABLE NEEDS ?
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
