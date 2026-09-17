"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Share2,
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface SpotlightHeroProps {
  featuredPrompt: Prompt | null;
}

export function SpotlightHero({ featuredPrompt }: SpotlightHeroProps) {
  const { copyPrompt, toggleSave, isSaved, setActiveModalPrompt, categories } =
    usePromptStore();
  const { showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!featuredPrompt) return null;

  const saved = isSaved(featuredPrompt.id);
  const category = categories.find((c) => c.id === featuredPrompt.categoryId);

  const handleCopy = async () => {
    setCopied(true);
    await copyPrompt(featuredPrompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/prompt/${featuredPrompt.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${featuredPrompt.title} - Arenae`,
          text: `Check out this trending prompt for ${featuredPrompt.model}: "${featuredPrompt.title}"`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Prompt Link Copied!", "success", url);
    }
  };

  return (
    <div className="relative w-full rounded-[22px] overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.03)] min-h-[300px] sm:min-h-[340px] flex flex-col justify-end p-5 sm:p-7 group">
      {/* Background Cinematic Artwork */}
      <Image
        src={featuredPrompt.mediaUrl}
        alt={featuredPrompt.title}
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 70vw"
        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
      />

      {/* Cinematic Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 max-w-xl space-y-3">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-black/70 text-white text-[10px] font-mono border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span>Spotlight</span>
          </div>

          <span className="px-2.5 py-1 rounded-[6px] bg-black/60 text-white/80 text-[10px] font-mono border border-white/10">
            {category?.name || "AI Art"}
          </span>

          <span className="px-2.5 py-1 rounded-[6px] bg-black/60 text-white/80 text-[10px] font-mono border border-white/10">
            {featuredPrompt.model}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight leading-tight">
          {featuredPrompt.title}
        </h2>

        {/* Prompt Synopsis */}
        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed font-mono bg-black/40 p-2.5 rounded-[10px] border border-white/10">
          &ldquo;{featuredPrompt.promptText}&rdquo;
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Copy Prompt Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-medium transition-all ${
              copied
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-white/90 text-black hover:bg-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Copy Blueprint</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-black/50 hover:bg-black/80 text-white/90 hover:text-white text-xs font-medium border border-white/10 transition-all"
            title="Share Prompt"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Share</span>
          </button>

          {/* Inspect / Save Button */}
          <button
            onClick={() => setActiveModalPrompt(featuredPrompt)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-black/50 hover:bg-black/80 text-white/90 hover:text-white text-xs font-medium border border-white/10 transition-all"
          >
            <Bookmark className={`w-3.5 h-3.5 stroke-[1.75] ${saved ? "fill-white" : ""}`} />
            <span>Details</span>
          </button>

          {/* More options */}
          <button
            onClick={() => setActiveModalPrompt(featuredPrompt)}
            className="p-2 rounded-[10px] bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 transition-all"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* Bottom Right Audio / Specs Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 rounded-[8px] bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <span className="px-2 py-0.5 rounded-[6px] bg-black/60 text-white/70 font-mono text-[9.5px] border border-white/10">
          {featuredPrompt.aspectRatio} • {featuredPrompt.model.split(" ")[0]}
        </span>
      </div>
    </div>
  );
}
