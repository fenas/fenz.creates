"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Bookmark,
  Sparkles,
  Video,
  Layers,
  ArrowUpRight,
  Eye,
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
      className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer border border-white/10 bg-[#0d0f16]/90 transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/40"
    >
      {/* Media Artwork Area */}
      <div className={`relative w-full overflow-hidden bg-slate-900 ${getAspectClass(prompt.aspectRatio)}`}>
        {/* Shimmer Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white/10 animate-pulse" />
          </div>
        )}

        <Image
          src={prompt.mediaUrl}
          alt={prompt.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={prompt.featured}
        />

        {/* Ambient Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/20 to-black/30 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Model Badge */}
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/60 backdrop-blur-md text-violet-300 border border-violet-500/30 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              {prompt.model}
            </span>

            {/* Video or Image type badge */}
            {prompt.type === "video" && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/80 backdrop-blur-md text-black flex items-center gap-1 shadow-sm">
                <Video className="w-3 h-3" />
                Video
              </span>
            )}
          </div>

          {/* Top Right: Aspect ratio & Favorite Button */}
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-medium bg-black/50 backdrop-blur-md text-slate-300 border border-white/10">
              {prompt.aspectRatio}
            </span>

            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                saved
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900"
                  : "bg-black/50 text-slate-300 hover:text-white hover:bg-black/70"
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
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-xl shadow-xl transition-all ${
                copied
                  ? "bg-emerald-600 text-white border border-emerald-400/40"
                  : "bg-violet-600/90 hover:bg-violet-600 text-white border border-violet-400/30 hover:scale-105"
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
            <span className="text-[10px] font-medium text-violet-300/90 tracking-wide uppercase">
              {category?.name || "AI Art"}
            </span>
            <h3 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm group-hover:text-violet-200 transition-colors">
              {prompt.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-300 flex-shrink-0 font-medium">
            <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-md">
              <Copy className="w-3 h-3 text-slate-400" />
              {formatNumber(prompt.copyCount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Prompt Snippet Body Footer */}
      <div className="p-3 bg-[#0d0f16]/95 border-t border-white/5 space-y-2">
        <p className="text-xs text-slate-300 font-mono line-clamp-2 leading-relaxed bg-black/40 p-2 rounded-xl border border-white/5">
          &ldquo;{prompt.promptText}&rdquo;
        </p>

        {/* Tags & Click Hint */}
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <div className="flex items-center gap-1 overflow-hidden">
            {prompt.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 text-[10px] truncate max-w-[90px]"
              >
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 2 && (
              <span className="text-[10px] text-slate-400">
                +{prompt.tags.length - 2}
              </span>
            )}
          </div>

          <span className="text-violet-400 group-hover:text-violet-300 font-semibold flex items-center gap-0.5 text-[11px]">
            Details <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
