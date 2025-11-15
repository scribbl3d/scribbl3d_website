"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ParallaxSection = dynamic(() => import("./parallax-section"), {
  ssr: false,
});

interface ClientParallaxSectionProps {
  backgroundImage: string;
  height: string;
}

export default function ClientParallaxSection({
  backgroundImage,
  height,
}: ClientParallaxSectionProps) {
  return (
    <Suspense fallback={<Skeleton className="w-full h-screen" />}>
      <ParallaxSection backgroundImage={backgroundImage} height={height} />
    </Suspense>
  );
}
