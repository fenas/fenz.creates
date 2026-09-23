"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Layers, ArrowUpRight } from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface PosterPromptCardProps {
  prompt: Prompt;
}

export function PosterPromptCard({ prompt }: PosterPromptCardProps) {
  const { categories } = usePromptStore();
  const { showToast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    prompt.mediaUrls && prompt.mediaUrls.length > 0
      ? prompt.mediaUrls
      : [prompt.mediaUrl];

  // Auto-changing slideshow effect for multiple images
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  const category = categories.find((c) => c.id === prompt.categoryId);
  const displaySubtitle =
    prompt.subtitle ||
    prompt.description ||
    prompt.promptText.slice(0, 100);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/prompt/${prompt.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${prompt.title} - Arenae`,
          text: `Check out this AI prompt for ${prompt.model}: "${prompt.title}"`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Prompt Link Copied!", "success", url);
    }
  };

  return (
    <Link
      href={`/prompt/${prompt.slug}`}
      className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#0A0C0E] border border-white/10 shadow-[var(--shadow-card)] hover:border-white/25 hover:shadow-[var(--shadow-card-hover)] cursor-pointer aspect-[4/5] flex flex-col justify-between transition-all duration-300 block select-none"
    >
      {/* 1. Full-Bleed Artwork Image Canvas */}
      <div className="absolute inset-0 overflow-hidden bg-[#0A0C0E]">
        {images.map((imgUrl, i) => (
          <Image
            key={imgUrl + i}
            src={imgUrl}
            alt={`${prompt.title} - ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              i === currentImageIndex
                ? "opacity-100 scale-100 z-[1]"
                : "opacity-0 scale-95 z-0"
            }`}
            unoptimized={imgUrl.startsWith("data:")}
            priority={i === 0}
          />
        ))}
      </div>

      {/* 2. Soft Cinema Vignette & Bottom Text Contrast Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none z-[2]" />

      {/* 3. Top Badges (Subtle & Clean) */}
      <div className="relative z-10 flex items-center justify-between w-full p-3.5 sm:p-4">
        <div className="flex items-center gap-1.5">
          {category && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/15 shadow-sm">
              {category.name}
            </span>
          )}

          {images.length > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9.5px] font-mono font-medium text-white/90 border border-white/15 flex items-center gap-1 shadow-sm">
              <Layers className="w-3 h-3 text-[#E85002]" />
              <span>Pack • {images.length} Prompts</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/90 text-white/90 hover:text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            title="Share Prompt Link"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Filatov-Style Typography & Arrow CTA */}
      <div className="relative z-10 p-4 sm:p-5 md:p-6 flex items-end justify-between gap-3 w-full">
        {/* Left: Title + Subtitle */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md group-hover:text-white/95 transition-colors line-clamp-1">
            {prompt.title}
          </h3>
          <p className="text-xs sm:text-[13px] text-white/80 font-normal leading-relaxed line-clamp-2 drop-shadow-sm">
            {displaySubtitle}
          </p>
        </div>

        {/* Right: Corner Arrow Button */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black/80 group-hover:bg-[#E85002] border border-white/15 text-white flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-105 active:scale-95 flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2] text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

