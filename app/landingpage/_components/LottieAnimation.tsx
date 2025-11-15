"use client";

import dynamic from "next/dynamic";

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Import your animation data
import animationData from "./1731063387721.json"; // Adjust this path

export function LottieAnimation() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: "120%",
        left: "40%",
        transform: "translateX(-50%)",
      }}
    >
      {/* Only render Lottie on client side */}
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{
          width: "100%",
          height: "150px",
          position: "absolute",
          top: "50%",
          left: "65%",
          transform: "translate(-50%, -50%) scale(1.5)",
        }}
      />
    </div>
  );
}
