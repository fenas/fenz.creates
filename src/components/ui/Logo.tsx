import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export function Logo({
  className = "w-8 h-8",
  size,
  alt = "Aistronaut",
}: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-[10px] transition-all dark:bg-[#676565] dark:p-0.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:border dark:border-white/15 ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }}
    >
      <img
        src="/logo-light.png"
        alt={alt}
        className="w-full h-full object-contain pointer-events-none select-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

