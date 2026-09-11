"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Copy, Check, Bookmark, Sparkles, MoreHorizontal } from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatNumber } from "@/lib/utils";

interface PosterPromptCardProps {
  prompt: Prompt;
}

export function PosterPromptCard({ prompt }: PosterPromptCardProps) {
  const { copyPrompt, toggleSave, isSaved, setActiveModalPrompt, categories } =
    usePromptStore();
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  return (
    <div
      onClick={() => setActiveModalPrompt(prompt)}
      className="group relative rounded-2xl overflow-hidden bg-[#11141e] border border-white/10 shadow-xl cursor-pointer poster-card aspect-[3/4] flex flex-col justify-between p-3"
    >
      {/* Background Poster Image */}
      <Image
        src={prompt.mediaUrl}
        alt={prompt.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className={`object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/40 to-black/30 pointer-events-none" />

      {/* Top Header in Card */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-slate-200 border border-white/10">
          {category?.name?.split(" ")[0] || "AI Art"}
        </span>

        <button
          onClick={handleSave}
          className={`p-1 rounded-full backdrop-blur-md transition-all ${
            saved
              ? "bg-red-500 text-white"
              : "bg-black/50 text-slate-300 hover:text-white"
          }`}
          title="Save"
        >
          <Bookmark className={`w-3 h-3 ${saved ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Bottom Information & 1-Click Copy Action */}
      <div className="relative z-10 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-xs font-bold text-white truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-[10px] text-slate-300 font-mono truncate opacity-80">
            {prompt.promptText}
          </p>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold pt-0.5">
            <span className="text-amber-400">{prompt.model}</span>
            <span>•</span>
            <span>{formatNumber(prompt.copyCount || 0)} copies</span>
          </div>
        </div>

        {/* Circular Copy Action Button */}
        <button
          onClick={handleCopy}
          className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg transition-all ${
            copied
              ? "bg-emerald-500 text-white"
              : "bg-white text-black hover:bg-slate-200 hover:scale-110 active:scale-95"
          }`}
          title="Copy Prompt"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-black" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-black" />
          )}
        </button>
      </div>
    </div>
  );
}
