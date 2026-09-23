"use client";

import React from "react";
import { Sparkles, Dices, Flame, Shield, Zap, ArrowDown } from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

export function HeroBanner() {
  const { triggerRandomPrompt, setActiveTab, selectedCategory } = usePromptStore();

  if (selectedCategory !== "all") {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 border border-white/10 glass-panel bg-gradient-to-b from-[#121420]/80 via-[#0e1018]/60 to-[#0a0c12]/80 shadow-2xl">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          <span>Curated AI Formula Gallery</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          Discover, Explore & Remix <br />
          <span className="gradient-text-violet">World-Class AI Prompts.</span>
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          A high-aesthetic visual vault of curated prompts for Midjourney v6, Flux.1 Pro,
          SDXL, and cinematic video generators. 100% free to browse, explore, and remix.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => triggerRandomPrompt()}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-violet-950/60 transition-all hover:scale-105 active:scale-95"
          >
            <Dices className="w-4 h-4 text-violet-200" />
            <span>🎲 Surprise Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab("trending")}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl glass-pill text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-amber-500/30 transition-all hover:scale-105"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>🔥 Trending Prompts</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Detailed Prompt Blueprints
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Midjourney & Flux Optimized
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Free & No Login Needed
          </span>
        </div>
      </div>
    </div>
  );
}
