"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroImage {
  id: string;
  page: string;
  imageUrl: string;
  alt: string;
}

export default function MakeItYourOwn() {
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch("/api/admin/hero-images");
        if (response.ok) {
          const images: HeroImage[] = await response.json();
          const landingImage = images.find((img) => img.page === "landing");
          if (landingImage) {
            setHeroImage(landingImage);
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
      <div className="w-full">
        <Image
          src="/3d_printer.png"
          alt="3D Printer"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto"
          unoptimized={true} // Key prop
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Image
        src={heroImage.imageUrl}
        alt={heroImage.alt}
        width={1920}
        height={1080}
        priority
        className="w-full h-auto"
        unoptimized={true} // Key prop
      />
    </div>
  );
}
