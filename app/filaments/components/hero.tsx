"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroImage {
  id: string;
  page: string;
  imageUrl: string;
  alt: string;
}

export default function Hero() {
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch("/api/admin/hero-images");
        if (response.ok) {
          const images: HeroImage[] = await response.json();
          const filamentsImage = images.find((img) => img.page === "filaments");
          if (filamentsImage) {
            setHeroImage(filamentsImage);
          }
        }
      } catch (error) {
        console.error("Error fetching hero image:", error);
      }
    };

    fetchHeroImage();
  }, []);

  if (!heroImage) {
    return (
      <div className="relative w-full">
        <Image
          src="/images/filament-banner.png"
          alt="Introductory Filament Collection - Up to 55% discount on high-quality 3D printing filaments including PLA, PLA+, ABS, PETG, and TPU"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-contain"
          unoptimized={true} // Key prop
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Image
        src={heroImage.imageUrl}
        alt={heroImage.alt}
        width={1920}
        height={1080}
        priority
        className="w-full h-auto object-contain"
        unoptimized={true} // Key prop
      />
    </div>
  );
}
