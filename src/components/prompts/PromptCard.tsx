"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Video,
  ArrowUpRight,
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatNumber } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const { copyPrompt, toggleSave, isSaved, setActiveModalPrompt, categories } =
    usePromptStore();
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    }, 3200);

    return () => clearInterval(interval);
  }, [images.length]);

  const saved = isSaved(prompt.id);
  const category = categories.find((c) => c.id === prompt.categoryId);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    await copyPrompt(prompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(prompt.id);
  };

  // Compute aspect ratio CSS classes
  const getAspectClass = (ar: string) => {
    switch (ar) {
      case "16:9":
        return "aspect-video";
      case "9:16":
        return "aspect-[9/16]";
      case "4:5":
        return "aspect-[4/5]";
      case "3:2":
        return "aspect-[3/2]";
      case "2:3":
        return "aspect-[2/3]";
      case "21:9":
        return "aspect-[21/9]";
      case "1:1":
      default:
        return "aspect-square";
    }
  };

  return (
    <div
      onClick={() => setActiveModalPrompt(prompt)}
      className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer border border-black/10 dark:border-white/10 transition-all duration-300 hover:border-[#E85002]/50 hover:shadow-2xl hover:shadow-[#E85002]/15 poster-card"
    >
      {/* Media Artwork Area */}
      <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900 ${getAspectClass(prompt.aspectRatio)}`}>
        {/* Shimmer Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-slate-400/30 animate-pulse" />
          </div>
        )}

        {images.map((imgUrl, i) => (
          <Image
            key={imgUrl + i}
            src={imgUrl}
            alt={`${prompt.title} - ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-center transition-all duration-700 group-hover:scale-105 ${
              i === currentImageIndex ? "opacity-100 scale-100 z-[1]" : "opacity-0 scale-95 z-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority={prompt.featured && i === 0}
            unoptimized={imgUrl.startsWith("data:")}
          />
        ))}

        {/* Multi-Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentImageIndex ? "w-3 bg-[#E85002]" : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Ambient Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Model Badge */}
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/60 backdrop-blur-md text-amber-200 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E85002] animate-pulse" />
              {prompt.model}
            </span>

            {/* Video or Image type badge */}
            {prompt.type === "video" && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#E85002] backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
                <Video className="w-3 h-3" />
                Video
              </span>
            )}
          </div>

          {/* Top Right: Aspect ratio & Favorite Button */}
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-medium bg-black/50 backdrop-blur-md text-slate-200 border border-white/10">
              {prompt.aspectRatio}
            </span>

            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                saved
                  ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                  : "bg-black/50 text-slate-200 hover:text-white hover:bg-black/70"
              }`}
              title={saved ? "Saved" : "Save Prompt"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Floating Quick Action Overlay (Center Hover on desktop) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-xl shadow-xl transition-all ${
                copied
                  ? "bg-emerald-600 text-white border border-emerald-400/40"
                  : "bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white shadow-lg shadow-[#E85002]/40 hover:scale-105 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Metadata in Image Area */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between z-10 text-white">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-bold text-[#F16001] tracking-wide uppercase">
              {category?.name || "AI Art"}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
              {prompt.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-300 flex-shrink-0 font-medium">
            <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-md">
              <Copy className="w-3 h-3 text-slate-400" />
              {formatNumber(prompt.copyCount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Prompt Snippet Body Footer */}
      <div className="p-3 bg-white/70 dark:bg-[#0d0f16]/95 border-t border-black/5 dark:border-white/5 space-y-2">
        <p className="text-xs text-slate-700 dark:text-slate-300 font-mono line-clamp-2 leading-relaxed bg-black/[0.03] dark:bg-black/40 p-2 rounded-xl border border-black/5 dark:border-white/5">
          &ldquo;{prompt.promptText}&rdquo;
        </p>

        {/* Tags & Click Hint */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <div className="flex items-center gap-1 overflow-hidden">
            {prompt.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 text-[10px] truncate max-w-[90px]"
              >
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 2 && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                +{prompt.tags.length - 2}
              </span>
            )}
          </div>

          <span className="text-[#E85002] dark:text-[#F16001] group-hover:text-[#F16001] font-bold flex items-center gap-0.5 text-[11px]">
            Details <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
