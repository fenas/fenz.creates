import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export function Logo({
  className = "w-8 h-8",
  size,
  color,
}: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }}
    >
      <div
        className="w-full h-full transition-colors"
        style={{
          maskImage: "url(/logo-white.png)",
          WebkitMaskImage: "url(/logo-white.png)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          backgroundColor: color || "currentColor",
        }}
      />
    </div>
  );
}
