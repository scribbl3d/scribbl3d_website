"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface ParallaxProps {
  backgroundImage: string;
  height: string;
  children: React.ReactNode;
}

export default function Parallax({
  backgroundImage,
  height,
  children,
}: ParallaxProps) {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const { top } = ref.current.getBoundingClientRect();
        setScrollY(-top);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height }}>
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <Image
          src={backgroundImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
