"use client";

import React from "react";
import { LiquidCanvas } from "./LiquidAccentButton/LiquidCanvas";

export interface LiquidPillProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  glowIntensity?: number;
}

export function LiquidPill({
  children,
  icon,
  size = "md",
  className = "",
  glowIntensity = 0.8,
}: LiquidPillProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const sizeClasses = {
    sm: "h-7 px-3 py-1 text-[11px] gap-1.5 font-bold",
    md: "h-8 px-3.5 py-1.5 text-xs sm:text-[13px] gap-2 font-bold",
    lg: "h-10 px-5 py-2 text-sm gap-2.5 font-bold",
  }[size];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none font-bold text-white shadow-sm transition-all duration-300 ease-out ${sizeClasses} ${className}`}
      style={{
        boxShadow: isHovered
          ? "0 0 15px var(--accent), 0 0 35px color-mix(in srgb, var(--accent) 35%, transparent), 0 2px 8px rgba(0, 0, 0, 0.35)"
          : "0 2px 6px rgba(0, 0, 0, 0.35)",
        letterSpacing: "0.015em",
      }}
    >
      {/* 1. Fluid Canvas */}
      <LiquidCanvas intensity={glowIntensity} isHovered={isHovered} />

      {/* 2. Dark Glass Layer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(14, 16, 19, 0.75) 0%, rgba(10, 12, 14, 0.35) 45%, rgba(10, 12, 14, 0.65) 100%)",
        }}
      />

      {/* 3. Center Radial Scrim */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8, 10, 12, 0.45) 0%, rgba(8, 10, 12, 0.18) 65%, transparent 100%)",
        }}
      />

      {/* 4. Rim Highlight */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none border transition-all duration-300 ease-out ${
          isHovered ? "border-[var(--accent)]" : "border-white/[0.18]"
        }`}
        style={{
          boxShadow: isHovered
            ? "inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)"
            : "inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)",
        }}
      />

      {/* 5. Text & Icon Content */}
      <span
        className="relative z-10 flex items-center gap-1.5 font-bold text-white pointer-events-none select-none"
        style={{
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.95)",
        }}
      >
        {icon && (
          <span
            className="flex items-center justify-center"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9))" }}
          >
            {icon}
          </span>
        )}
        <span className="font-bold">{children}</span>
      </span>
    </div>
  );
}
