import React, { ReactNode } from "react";

interface GradientWrapperProps {
  children: ReactNode;
  gradientPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  gradientColor?: string;
}

const GradientWrapper: React.FC<GradientWrapperProps> = ({
  children,
  gradientPosition = "bottom-right",
  gradientColor = "rgba(0,255,0,0.5)",
}) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute w-[300px] h-[300px] pointer-events-none ${positionClasses[gradientPosition]}`}
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {children}
    </div>
  );
};

export default GradientWrapper;
