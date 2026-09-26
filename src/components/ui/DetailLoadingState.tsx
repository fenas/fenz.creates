"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

interface DetailLoadingStateProps {
  type?: "tutorial" | "prompt" | "feature" | "generic";
  message?: string;
}

export function DetailLoadingState({
  type = "tutorial",
  message,
}: DetailLoadingStateProps) {
  const getMessage = () => {
    if (message) return message;
    switch (type) {
      case "tutorial":
        return "Loading masterclass workflow...";
      case "prompt":
        return "Loading prompt formula...";
      case "feature":
        return "Loading roadmap feature...";
      default:
        return "Loading content...";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Top Header Placeholder */}
      <header className="sticky top-0 z-30 w-full bg-[var(--surface)]/90 border-b border-[var(--border)] backdrop-blur-xl transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 px-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
            <span className="hidden sm:inline">Back to Studio</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-muted)] skeleton-shimmer" />
          </div>
        </div>
      </header>

      {/* Main Animated Skeleton Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Glowing Mascot Animated Center Loader */}
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="relative flex items-center justify-center mb-4">
            {/* Ambient Accent Radial Glow */}
            <div className="absolute w-24 h-24 rounded-full bg-[var(--accent)]/20 blur-xl animate-pulse pointer-events-none" />
            
            {/* Outer Subtle Spinning Ring */}
            <div className="absolute w-16 h-16 rounded-2xl border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" />
            
            {/* Center Logo */}
            <div className="relative z-10 transform scale-110">
              <Logo className="w-11 h-11 shadow-lg shadow-[var(--accent)]/15" />
            </div>
          </div>

          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            {getMessage()}
          </p>
        </div>

        {/* Shimmering Skeleton Wireframe */}
        <div className="space-y-6 pt-2">
          {/* Badges & Meta Row */}
          <div className="flex items-center gap-3">
            <div className="w-24 h-6 rounded-[8px] skeleton-shimmer border border-[var(--border)]" />
            <div className="w-20 h-6 rounded-[8px] skeleton-shimmer border border-[var(--border)]" />
            <div className="w-16 h-6 rounded-[8px] skeleton-shimmer border border-[var(--border)] hidden sm:block" />
          </div>

          {/* Title and Subtitle Skeletons */}
          <div className="space-y-3">
            <div className="w-11/12 sm:w-3/4 h-8 sm:h-10 rounded-[12px] skeleton-shimmer" />
            <div className="w-full sm:w-5/6 h-4 rounded-[8px] skeleton-shimmer opacity-75" />
            <div className="w-2/3 h-4 rounded-[8px] skeleton-shimmer opacity-75" />
          </div>

          {/* Hero Media Container Skeleton */}
          <div className="w-full h-64 sm:h-96 rounded-[20px] bg-[var(--surface-recessed)] border border-[var(--border)] overflow-hidden relative shadow-[var(--shadow-panel)]">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>

          {/* Body Content Blocks Skeleton */}
          <div className="space-y-4 pt-4">
            <div className="w-full h-4 rounded-[8px] skeleton-shimmer" />
            <div className="w-full h-4 rounded-[8px] skeleton-shimmer" />
            <div className="w-4/5 h-4 rounded-[8px] skeleton-shimmer" />
            <div className="w-full h-28 rounded-[16px] skeleton-shimmer border border-[var(--border)] mt-6" />
          </div>
        </div>
      </main>
    </div>
  );
}
