"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { Prompt } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { LiquidAccentButton } from "@/components/ui/LiquidAccentButton";
import { isYouTubeUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

interface SpotlightHeroProps {
  featuredPrompt: Prompt | null;
}

export function SpotlightHero({ featuredPrompt }: SpotlightHeroProps) {
  const { showToast } = useToast();

  if (!featuredPrompt) return null;

  const isVideo = featuredPrompt.type === "video" || isYouTubeUrl(featuredPrompt.mediaUrl);
  const heroImage =
    featuredPrompt.thumbnailUrl ||
    (isVideo
      ? getYouTubeThumbnailUrl(featuredPrompt.mediaUrl, "maxres") || getYouTubeThumbnailUrl(featuredPrompt.mediaUrl, "hq")
      : null) ||
    featuredPrompt.mediaUrl;

  const handleShare = async () => {
    const url = `${window.location.origin}/prompt/${featuredPrompt.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${featuredPrompt.title} - Aistronaut`,
          text: `Check out this trending prompt for ${featuredPrompt.model || "AI"}: "${featuredPrompt.title}"`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Prompt Link Copied!", "success", url);
    }
  };

  return (
    <div className="relative w-full rounded-[22px] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-panel)] min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-5 sm:p-7 group">
      {/* Background Cinematic Artwork */}
      <Image
        src={heroImage}
        alt={featuredPrompt.title}
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 70vw"
        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
        unoptimized={heroImage.startsWith("data:")}
      />

      {/* Cinematic Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 max-w-xl space-y-3">
        {/* Title */}
        <Link href={`/prompt/${featuredPrompt.slug}`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight drop-shadow-md hover:text-[var(--accent)] transition-colors">
            {featuredPrompt.title}
          </h2>
        </Link>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 pt-1 flex-wrap">
          {/* Explore Blueprint Pill CTA */}
          <LiquidAccentButton
            href={`/prompt/${featuredPrompt.slug}`}
            size="sm"
            icon={<ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />}
          >
            Explore Blueprint
          </LiquidAccentButton>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-[#0A0C0E]/80 hover:bg-[#1E2228] text-white/90 hover:text-white text-xs font-medium border border-white/20 transition-all cursor-pointer shadow-sm"
            title="Share Prompt"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

