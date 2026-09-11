"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  ArrowUpDown,
  Copy,
  Check,
  Flame,
  Bookmark,
  Sparkles,
  X,
  History,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Prompt } from "@/types";
import { formatNumber } from "@/lib/utils";

export function RightCompanionPanel() {
  const {
    prompts,
    searchQuery,
    setSearchQuery,
    copyPrompt,
    setActiveModalPrompt,
    savedPromptIds,
    sortBy,
    setSortBy,
  } = usePromptStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Top trending prompts
  const trendingPrompts = [...prompts]
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
    .slice(0, 2);

  // Recently added or saved prompts
  const recentPrompts = [...prompts]
    .filter((p) => p.status === "published")
    .slice(2, 6);

  const handleCopy = async (e: React.MouseEvent, prompt: Prompt) => {
    e.stopPropagation();
    setCopiedId(prompt.id);
    await copyPrompt(prompt);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-88 flex-shrink-0 flex flex-col gap-4">
      {/* Floating Card Container */}
      <div className="p-4 sm:p-5 rounded-[28px] floating-panel bg-[#0e1017]/95 border border-white/10 shadow-2xl space-y-6">
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl glass-input text-xs font-medium placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section 1: Trending Now */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              Trending Now
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 font-semibold cursor-pointer focus:outline-none"
              >
                <option value="trending" className="bg-[#0f1117]">Today</option>
                <option value="newest" className="bg-[#0f1117]">Newest</option>
                <option value="most-copied" className="bg-[#0f1117]">All Time</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Stacks */}
          <div className="space-y-2.5">
            {trendingPrompts.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveModalPrompt(p)}
                  className="group relative rounded-2xl overflow-hidden bg-[#141724] border border-white/10 p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-red-500/40 hover:bg-[#191d2d] transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                      {p.model}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-red-300 transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      {p.promptText}
                    </p>
                  </div>

                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                    <Image
                      src={p.mediaUrl}
                      alt={p.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30" />

                    {/* Circular Play / Copy Button */}
                    <button
                      onClick={(e) => handleCopy(e, p)}
                      className={`absolute inset-0 m-auto w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isCopied
                          ? "bg-emerald-500 text-white"
                          : "bg-white/90 text-black hover:bg-white hover:scale-110"
                      }`}
                      title="Copy Prompt"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Continue Browsing / Quick Prompts */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-violet-400" />
              Quick Formulas
            </span>
          </div>

          <div className="space-y-2">
            {recentPrompts.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveModalPrompt(p)}
                  className="group flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                      <Image
                        src={p.mediaUrl}
                        alt={p.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {p.model} • {formatNumber(p.copyCount || 0)} copies
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleCopy(e, p)}
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                      isCopied
                        ? "bg-emerald-500 text-white"
                        : "bg-white/80 hover:bg-white text-black hover:scale-110"
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-black" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
