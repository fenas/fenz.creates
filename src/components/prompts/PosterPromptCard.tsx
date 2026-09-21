import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Check, Bookmark, Share2, Layers } from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PosterPromptCardProps {
  prompt: Prompt;
}

export function PosterPromptCard({ prompt }: PosterPromptCardProps) {
  const { copyPrompt, toggleSave, isSaved, categories } = usePromptStore();
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
    e.preventDefault();
    e.stopPropagation();
    setCopied(true);
    await copyPrompt(prompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(prompt.id);
  };

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
      className="group relative rounded-[18px] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] hover:border-[var(--border-strong)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.55)] cursor-pointer aspect-[3/4] flex flex-col justify-between p-3.5 transition-all duration-200 block select-none"
    >
      {/* Background Multi-Image Poster */}
      <div className="absolute inset-0 overflow-hidden bg-[#0A0C0E]">
        {images.map((imgUrl, i) => (
          <Image
            key={imgUrl + i}
            src={imgUrl}
            alt={`${prompt.title} - Artwork ${i + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={`object-cover object-center transition-all duration-500 group-hover:scale-[1.03] ${
              i === currentImageIndex
                ? "opacity-100 scale-100 z-[1]"
                : "opacity-0 scale-95 z-0"
            }`}
            unoptimized={imgUrl.startsWith("data:")}
            priority={i === 0}
          />
        ))}
      </div>

      {/* High-Contrast Vignette Gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/25 pointer-events-none z-[2]" />

      {/* Top Badges & Actions */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-[8px] bg-[#0A0C0E]/85 backdrop-blur-none text-[10px] font-semibold text-white border border-white/20 font-mono shadow-sm">
            {category?.name?.split(" ")[0] || "AI Art"}
          </span>

          {images.length > 1 && (
            <span className="px-2 py-1 rounded-[8px] bg-[#0A0C0E]/85 text-[9.5px] font-mono font-medium text-white/90 border border-white/20 flex items-center gap-1 shadow-sm">
              <Layers className="w-2.5 h-2.5 text-[var(--accent)]" />
              <span>{images.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-[9px] bg-[#0A0C0E]/80 hover:bg-[#21252B] text-white/90 hover:text-white border border-white/15 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
            title="Share Prompt Link"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          <button
            onClick={handleSave}
            className={`p-2 rounded-[9px] transition-all cursor-pointer border shadow-sm ${
              saved
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_10px_rgba(255,84,84,0.4)]"
                : "bg-[#0A0C0E]/80 text-white/90 hover:text-white hover:bg-[#21252B] border-white/15"
            }`}
            title={saved ? "Saved" : "Save"}
          >
            <Bookmark className={`w-3.5 h-3.5 stroke-[1.75] ${saved ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Bottom Information & Action */}
      <div className="relative z-10 space-y-2.5">
        {/* Multi-Image Dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1 pb-0.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-200 ${
                  i === currentImageIndex
                    ? "w-3.5 bg-white shadow-sm"
                    : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-end justify-between gap-2.5">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-white/95 transition-colors drop-shadow-sm">
              {prompt.title}
            </h3>
            <p className="text-[10.5px] text-white/80 font-mono truncate leading-tight">
              {prompt.promptText}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-white/70 pt-0.5 font-mono">
              <span className="text-white font-medium">{prompt.model}</span>
              <span>•</span>
              <span>{formatNumber(prompt.copyCount || 0)} copies</span>
            </div>
          </div>

          {/* Tactile High-Contrast Copy Action Button */}
          <button
            onClick={handleCopy}
            className={`w-8 h-8 rounded-[10px] flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer ${
              copied
                ? "bg-[var(--accent)] text-white shadow-[0_4px_12px_rgba(255,84,84,0.45)] scale-105"
                : "bg-white text-black hover:bg-[var(--accent)] hover:text-white border border-white/20 hover:scale-105 active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
            }`}
            title="Copy Prompt"
          >
            {copied ? (
              <Check className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <Copy className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
