"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  extractThemePalette,
  lerpColor,
  lerp,
  toRgbaString,
  LiquidThemePalette,
} from "./liquidColorUtils";

interface LiquidCanvasProps {
  isHovered?: boolean;
  isLoading?: boolean;
  intensity?: number;
  className?: string;
}

export function LiquidCanvas({
  isHovered = false,
  isLoading = false,
  intensity = 1.0,
  className = "",
}: LiquidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Keep references to state across renders
  const stateRef = useRef({
    isHovered,
    isLoading,
    resolvedTheme,
    intensity,
  });

  stateRef.current = { isHovered, isLoading, resolvedTheme, intensity };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let prefersReducedMotion = false;

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }

    // Colors
    let currentPalette: LiquidThemePalette = extractThemePalette(
      stateRef.current.resolvedTheme
    );
    let targetPalette: LiquidThemePalette = extractThemePalette(
      stateRef.current.resolvedTheme
    );

    // Animation variables
    let time = Math.random() * 100;
    let currentSpeed = 0.6;
    let lastTimestamp = performance.now();

    // Canvas size in CSS pixels
    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateDimensions = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 32);
      height = Math.max(rect.height, 20);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(canvas);

    // Intersection observer to pause rendering when offscreen
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          isVisible = entries[0].isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(canvas);

    // Render loop
    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Update target palette when theme changes
      targetPalette = extractThemePalette(stateRef.current.resolvedTheme);

      // Smooth color lerping (exponential smoothing)
      const colorLerpFactor = 0.08;
      currentPalette = {
        accentPrimary: lerpColor(
          currentPalette.accentPrimary,
          targetPalette.accentPrimary,
          colorLerpFactor
        ),
        accentSecondary: lerpColor(
          currentPalette.accentSecondary,
          targetPalette.accentSecondary,
          colorLerpFactor
        ),
        accentHighlight: lerpColor(
          currentPalette.accentHighlight,
          targetPalette.accentHighlight,
          colorLerpFactor
        ),
        accentDeep: lerpColor(
          currentPalette.accentDeep,
          targetPalette.accentDeep,
          colorLerpFactor
        ),
        ambientUndertone: lerpColor(
          currentPalette.ambientUndertone,
          targetPalette.ambientUndertone,
          colorLerpFactor
        ),
        glassBase: lerpColor(
          currentPalette.glassBase,
          targetPalette.glassBase,
          colorLerpFactor
        ),
        bloomColor: targetPalette.bloomColor,
      };

      // Determine target speed based on state
      let targetSpeed = 0.55;
      if (stateRef.current.isLoading) {
        targetSpeed = 1.9;
      } else if (stateRef.current.isHovered) {
        targetSpeed = 1.1;
      }

      if (prefersReducedMotion) {
        targetSpeed = 0.0;
      }

      currentSpeed = lerp(currentSpeed, targetSpeed, 0.08);
      time += dt * currentSpeed;

      // Reset and clear context
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. CRISP OBSIDIAN BASE SURFACE (Deep dark background)
      ctx.fillStyle = toRgbaString(currentPalette.glassBase, 0.98);
      ctx.fillRect(0, 0, width, height);

      // 2. LAYER A: SECONDARY BACK LIQUID WAVE (Subtle depth undulation)
      const backWavePointsCount = 20;
      const backWaveStep = width / (backWavePointsCount - 1);
      const backPoints: { x: number; y: number }[] = [];

      const backBaseY = height * 0.58;
      const backAmp1 = height * 0.12;
      const backAmp2 = height * 0.07;

      for (let i = 0; i < backWavePointsCount; i++) {
        const x = i * backWaveStep;
        const normX = x / width;

        const y =
          backBaseY +
          Math.sin(normX * Math.PI * 2.0 - time * 0.9 + 0.8) * backAmp1 +
          Math.cos(normX * Math.PI * 3.6 + time * 1.1 + 1.5) * backAmp2;

        backPoints.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, backPoints[0].y);

      for (let i = 0; i < backPoints.length - 1; i++) {
        const p0 = backPoints[i];
        const p1 = backPoints[i + 1];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.lineTo(width, backPoints[backPoints.length - 1].y);
      ctx.lineTo(width, height);
      ctx.closePath();

      const backWaveGrad = ctx.createLinearGradient(0, height * 0.45, width, height);
      backWaveGrad.addColorStop(0, toRgbaString(currentPalette.accentDeep, 0.45));
      backWaveGrad.addColorStop(0.5, toRgbaString(currentPalette.accentSecondary, 0.4));
      backWaveGrad.addColorStop(1, toRgbaString(currentPalette.accentPrimary, 0.45));

      ctx.fillStyle = backWaveGrad;
      ctx.fill();

      // 3. LAYER B: PRIMARY FRONT LIQUID WAVE (Crisp, defined fluid flow)
      const wavePointsCount = 24;
      const waveStep = width / (wavePointsCount - 1);
      const points: { x: number; y: number }[] = [];

      const baseWaveY = height * 0.62;
      const amp1 = height * 0.13;
      const amp2 = height * 0.08;
      const amp3 = height * 0.05;

      for (let i = 0; i < wavePointsCount; i++) {
        const x = i * waveStep;
        const normX = x / width;

        // Clean fluid wave equation
        const y =
          baseWaveY +
          Math.sin(normX * Math.PI * 2.4 + time * 1.2) * amp1 +
          Math.sin(normX * Math.PI * 4.2 - time * 0.8 + 1.8) * amp2 +
          Math.cos(normX * Math.PI * 1.8 + time * 0.5 + 2.6) * amp3;

        points.push({ x, y });
      }

      // Draw Main Wave Fill
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.lineTo(width, points[points.length - 1].y);
      ctx.lineTo(width, height);
      ctx.closePath();

      // Crisp horizontal gradient strictly in the theme accent spectrum
      const waveGrad = ctx.createLinearGradient(0, height * 0.4, width, height);
      waveGrad.addColorStop(0, toRgbaString(currentPalette.accentDeep, 0.95));
      waveGrad.addColorStop(0.3, toRgbaString(currentPalette.accentHighlight, 0.98));
      waveGrad.addColorStop(0.65, toRgbaString(currentPalette.accentPrimary, 0.95));
      waveGrad.addColorStop(1, toRgbaString(currentPalette.accentSecondary, 0.92));

      ctx.fillStyle = waveGrad;
      ctx.fill();

      // 4. LAYER C: CRISP WAVE CREST MENISCUS (Clean luminous edge along liquid top)
      ctx.beginPath();
      ctx.moveTo(0, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.lineTo(width, points[points.length - 1].y);

      ctx.strokeStyle = toRgbaString(currentPalette.accentHighlight, 0.65);
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 5. LAYER D: DARK TOP GLASS (Ensures high contrast typography above liquid)
      const topGlass = ctx.createLinearGradient(0, 0, 0, height);
      topGlass.addColorStop(0, toRgbaString(currentPalette.glassBase, 0.88));
      topGlass.addColorStop(0.38, toRgbaString(currentPalette.glassBase, 0.42));
      topGlass.addColorStop(0.7, toRgbaString(currentPalette.glassBase, 0.1));
      topGlass.addColorStop(1, toRgbaString(currentPalette.glassBase, 0.45));

      ctx.fillStyle = topGlass;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}
