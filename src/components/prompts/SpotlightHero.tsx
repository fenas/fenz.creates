"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  Copy,
  Check,
  Bookmark,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  ArrowUpRight,
  Video,
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";

interface SpotlightHeroProps {
  featuredPrompt: Prompt | null;
}

export function SpotlightHero({ featuredPrompt }: SpotlightHeroProps) {
  const { copyPrompt, toggleSave, isSaved, setActiveModalPrompt, categories } =
    usePromptStore();

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

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden bg-[#11131a] border border-white/10 shadow-2xl min-h-[300px] sm:min-h-[360px] flex flex-col justify-end p-5 sm:p-7 group">
      {/* Background Cinematic Artwork */}
      <Image
        src={featuredPrompt.mediaUrl}
        alt={featuredPrompt.title}
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 70vw"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />

      {/* Cinematic Vignette Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-[#0b0c12]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c12]/90 via-[#0b0c12]/40 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 max-w-xl space-y-3">
        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-semibold border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>🔥 Now Trending</span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-[11px] font-medium border border-white/10">
            {category?.name || "AI Art"}
          </span>

          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-[11px] font-medium border border-white/10">
            {featuredPrompt.model}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          {featuredPrompt.title}
        </h2>

        {/* Prompt Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-mono bg-black/30 p-2.5 rounded-xl border border-white/5 backdrop-blur-sm">
          &ldquo;{featuredPrompt.promptText}&rdquo;
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2.5 pt-1">
          {/* Watch / Copy Prompt Pill Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xl ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white text-black hover:bg-slate-200 hover:scale-105 active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>

          {/* Inspect / Save Button */}
          <button
            onClick={() => setActiveModalPrompt(featuredPrompt)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all hover:scale-105"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-white" : ""}`} />
            <span>Details</span>
          </button>

          {/* More options */}
          <button
            onClick={() => setActiveModalPrompt(featuredPrompt)}
            className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10 transition-all"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Right Audio / Specs Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-slate-300 font-mono text-[10px] font-semibold border border-white/10">
          {featuredPrompt.aspectRatio} • {featuredPrompt.model.split(" ")[0]}
        </span>
      </div>
    </div>
  );
}
