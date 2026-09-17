"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Check, Bookmark, Share2, Layers } from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PosterPromptCardProps {
  prompt: Prompt;
}

export function PosterPromptCard({ prompt }: PosterPromptCardProps) {
  const { copyPrompt, toggleSave, isSaved, setActiveModalPrompt, categories } =
    usePromptStore();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
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

  const handleShare = async (e: React.MouseEvent) => {
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
    <div
      onClick={() => setActiveModalPrompt(prompt)}
      className="group relative rounded-[16px] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_16px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] hover:border-[var(--border-strong)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] cursor-pointer aspect-[3/4] flex flex-col justify-between p-3.5 transition-all duration-200"
    >
      {/* Background Multi-Image Poster */}
      <div className="absolute inset-0 overflow-hidden bg-[#1E1E1E]">
        {images.map((imgUrl, i) => (
          <Image
            key={imgUrl + i}
            src={imgUrl}
            alt={`${prompt.title} - Artwork ${i + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover object-center transition-all duration-500 group-hover:scale-[1.02] ${
              i === currentImageIndex
                ? "opacity-100 scale-100 z-[1]"
                : "opacity-0 scale-95 z-0"
            }`}
            unoptimized={imgUrl.startsWith("data:")}
            priority={i === 0}
          />
        ))}
      </div>

      {/* Subtle Vignette Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 pointer-events-none z-[2]" />

      {/* Top Badges & Actions */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-[6px] bg-black/60 text-[9.5px] font-medium text-white/90 border border-white/10">
            {category?.name?.split(" ")[0] || "AI Art"}
          </span>

          {images.length > 1 && (
            <span className="px-1.5 py-0.5 rounded-[6px] bg-black/60 text-[9px] font-mono text-white/80 border border-white/10 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              <span>{images.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-[8px] bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            title="Share Prompt Link"
          >
            <Share2 className="w-3 h-3 stroke-[1.75]" />
          </button>

          <button
            onClick={handleSave}
            className={`p-1.5 rounded-[8px] transition-all ${
              saved
                ? "bg-[var(--accent)] text-white"
                : "bg-black/50 text-white/80 hover:text-white hover:bg-black/80"
            }`}
            title={saved ? "Saved" : "Save"}
          >
            <Bookmark className={`w-3 h-3 stroke-[1.75] ${saved ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bottom Information & Action */}
      <div className="relative z-10 space-y-2">
        {/* Multi-Image Dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1 pb-0.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-200 ${
                  i === currentImageIndex
                    ? "w-3 bg-white shadow-sm"
                    : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-xs font-medium text-white truncate group-hover:text-white/90 transition-colors">
              {prompt.title}
            </h3>
            <p className="text-[10px] text-white/70 font-mono truncate">
              {prompt.promptText}
            </p>
            <div className="flex items-center gap-1.5 text-[9.5px] text-white/60 pt-0.5">
              <span className="font-mono text-white/90">{prompt.model}</span>
              <span>•</span>
              <span>{formatNumber(prompt.copyCount || 0)} copies</span>
            </div>
          </div>

          {/* Tactile Copy Action Button */}
          <button
            onClick={handleCopy}
            className={`w-7 h-7 rounded-[8px] flex-shrink-0 flex items-center justify-center shadow-sm transition-all duration-150 ${
              copied
                ? "bg-[var(--accent)] text-white"
                : "bg-white/90 text-black hover:bg-white hover:scale-105 active:scale-95"
            }`}
            title="Copy Prompt"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
