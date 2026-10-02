"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Layers, ArrowUpRight, Video, Play } from "lucide-react";
import { Prompt } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { isYouTubeUrl, getYouTubeThumbnailUrl, getYouTubeHoverPreviewUrl } from "@/lib/youtube";

interface PosterPromptCardProps {
  prompt: Prompt;
}

export function PosterPromptCard({ prompt }: PosterPromptCardProps) {
  const { showToast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isVideo = prompt.type === "video" || isYouTubeUrl(prompt.mediaUrl);
  const videoThumb = isVideo
    ? prompt.thumbnailUrl ||
      (prompt.mediaUrls && prompt.mediaUrls.length > 0 && !isYouTubeUrl(prompt.mediaUrls[0]) ? prompt.mediaUrls[0] : null) ||
      getYouTubeThumbnailUrl(prompt.mediaUrl, "maxres") ||
      getYouTubeThumbnailUrl(prompt.mediaUrl, "hq") ||
      prompt.mediaUrl
    : null;

  const hoverVideoUrl = isVideo && isHovered ? getYouTubeHoverPreviewUrl(prompt.mediaUrl) : null;

  const images = isVideo && videoThumb
    ? [videoThumb]
    : prompt.mediaUrls && prompt.mediaUrls.length > 0
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/prompt/${prompt.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${prompt.title} - Aistronaut`,
          text: `Check out this AI prompt for ${prompt.model || "AI"}: "${prompt.title}"`,
          url,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Prompt Link Copied!", "success", url);
    }
  };

  const isPack =
    !isVideo &&
    (prompt.promptKind === "pack" ||
      (Array.isArray(prompt.packItems) && prompt.packItems.length > 1));

  return (
    <Link
      href={`/prompt/${prompt.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

        {/* Hover Video Preview for Video Prompts */}
        {isVideo && isHovered && hoverVideoUrl && (
          <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none flex items-center justify-center">
            <iframe
              src={hoverVideoUrl}
              title={prompt.title}
              className="w-[185%] h-[185%] max-w-none border-0 pointer-events-none object-cover opacity-100 transition-opacity duration-300"
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          </div>
        )}
      </div>

      {/* 2. Soft Cinema Vignette Overlay (Visible on Hover Only) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[3]" />

      {/* Center Play Button indicator for Video Prompts (hidden once playing on hover) */}
      {isVideo && !isHovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[4] opacity-80 group-hover:opacity-0 transition-all duration-300 scale-90 group-hover:scale-100">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] backdrop-blur-sm border border-white/20">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* 3. Top Header: Badges & Share Button (Visible on Hover Only) */}
      <div className="relative z-10 flex items-center justify-between w-full p-3.5 sm:p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1.5 group-hover:translate-y-0">
        <div>
          {isVideo ? (
            <span className="px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-[9.5px] font-mono font-bold text-white border border-red-400/30 flex items-center gap-1.5 shadow-sm">
              <Video className="w-3 h-3 text-white" />
              <span>Video</span>
            </span>
          ) : isPack ? (
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[9.5px] font-mono font-medium text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
              <Layers className="w-3 h-3 text-[var(--accent)]" />
              <span>Pack • {prompt.packItems?.length || images.length} Prompts</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-[9.5px] font-mono font-medium text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
              <Layers className="w-3 h-3 text-[var(--accent)]" />
              <span>{images.length} {images.length === 1 ? "Image" : "Images"}</span>
            </span>
          )}
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-black/65 backdrop-blur-md hover:bg-black/90 text-white/90 hover:text-white border border-white/15 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-md"
          title="Share Prompt Link"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* 4. Bottom: Title & Corner Arrow CTA (Visible on Hover Only) */}
      <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between gap-3 w-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0">
        {/* Title */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md line-clamp-2">
            {prompt.title}
          </h3>
        </div>

        {/* Corner Arrow Button */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black/80 group-hover:bg-[var(--accent)] border border-white/15 text-white flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,108,0,0.5)] active:scale-95 flex-shrink-0">
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2] text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}



