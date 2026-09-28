"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LiquidCanvas } from "./LiquidCanvas";

export type LiquidButtonSize = "sm" | "md" | "lg" | "xl";
export type LiquidButtonVariant = "primary" | "pill" | "glass" | "subtle";

export interface LiquidAccentButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: LiquidButtonSize;
  variant?: LiquidButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  href?: string;
  target?: string;
  fullWidth?: boolean;
  glowIntensity?: number;
  className?: string;
}

export function LiquidAccentButton({
  children,
  label,
  icon,
  iconPosition = "right",
  size = "md",
  variant = "primary",
  isLoading = false,
  loadingText = "Thinking...",
  href,
  target,
  fullWidth = false,
  glowIntensity = 1.0,
  disabled = false,
  className = "",
  onClick,
  ...props
}: LiquidAccentButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Size styling tokens
  const sizeClasses = {
    sm: "h-9 px-4 py-1.5 text-xs sm:text-[13px] gap-1.5 rounded-full",
    md: "h-10 px-5 py-2 text-xs sm:text-sm gap-2 rounded-full",
    lg: "h-11 px-6 py-2.5 text-sm sm:text-[15px] gap-2.5 rounded-full",
    xl: "h-13 px-7 py-3 text-base sm:text-lg gap-3 rounded-full",
  }[size];

  // Visual text content
  const displayText = isLoading ? loadingText : label || children;

  // Outer container classes
  const containerClasses = `
    group relative inline-flex items-center justify-center select-none
    font-bold text-white tracking-wide cursor-pointer overflow-hidden
    transition-all duration-300 ease-out
    ${fullWidth ? "w-full" : "w-auto"}
    ${sizeClasses}
    ${
      disabled
        ? "opacity-50 pointer-events-none cursor-not-allowed"
        : "active:scale-[0.975] hover:scale-[1.015]"
    }
    ${className}
  `.trim();

  // Glowing hover shadow and tactile glass depth using active theme colors
  const glassStyle: React.CSSProperties = {
    boxShadow: isHovered
      ? "0 0 15px var(--accent), 0 0 35px color-mix(in srgb, var(--accent) 35%, transparent), 0 4px 16px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)"
      : "0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
    borderColor: isHovered ? "var(--accent)" : "transparent",
  };

  const innerContent = (
    <>
      {/* 1. LAYER: ANIMATED LIQUID WAVE CANVAS (Crisp & Clear) */}
      <LiquidCanvas
        isHovered={isHovered}
        isLoading={isLoading}
        intensity={glowIntensity * (isHovered ? 1.1 : 1.0)}
      />

      {/* 2. LAYER: DARK TRANSLUCENT GLASS DEPTH & SURFACE VIGNETTE */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(14, 16, 19, 0.75) 0%, rgba(10, 12, 14, 0.35) 45%, rgba(10, 12, 14, 0.65) 100%)",
        }}
      />

      {/* 3. LAYER: CENTER RADIAL CONTRAST SCRIM (Protects text legibility over fluid highlights) */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8, 10, 12, 0.45) 0%, rgba(8, 10, 12, 0.18) 65%, transparent 100%)",
        }}
      />

      {/* 4. LAYER: SPECULAR UPPER RIM & BORDER GLOW */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none border transition-all duration-300 ease-out ${
          isHovered
            ? "border-[var(--accent)]"
            : "border-white/[0.18]"
        }`}
        style={{
          boxShadow: isHovered
            ? "inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.4)"
            : "inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* 5. LAYER: CENTERED BOLD HIGH-CONTRAST TYPOGRAPHY & ICONS */}
      <span
        className="relative z-10 inline-flex items-center justify-center gap-2 font-bold leading-none text-white pointer-events-none select-none"
        style={{
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.95)",
          letterSpacing: "0.015em",
        }}
      >
        {icon && iconPosition === "left" && (
          <span
            className={`flex items-center justify-center shrink-0 transition-transform duration-200 ${
              isHovered ? "scale-110" : ""
            } ${isLoading ? "animate-pulse" : ""}`}
            style={{
              filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9))",
            }}
          >
            {icon}
          </span>
        )}

        <span className="truncate font-bold tracking-wide">{displayText}</span>

        {icon && iconPosition === "right" && (
          <span
            className={`flex items-center justify-center shrink-0 transition-transform duration-200 ${
              isHovered ? "translate-x-0.5" : ""
            } ${isLoading ? "animate-pulse" : ""}`}
            style={{
              filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9))",
            }}
          >
            {icon}
          </span>
        )}
      </span>
    </>
  );

  // If href is provided, render as Next.js Link
  if (href) {
    return (
      <Link
        href={href}
        target={target}
        className={containerClasses}
        style={glassStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        aria-busy={isLoading}
      >
        {innerContent}
      </Link>
    );
  }

  // Standard Button
  return (
    <button
      type={props.type || "button"}
      disabled={disabled || isLoading}
      className={containerClasses}
      style={glassStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onClick={onClick}
      aria-busy={isLoading}
      {...props}
    >
      {innerContent}
    </button>
  );
}
