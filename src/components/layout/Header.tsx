"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Dices,
  X,
  Sparkles,
  SlidersHorizontal,
  Video,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    triggerRandomPrompt,
    selectedModel,
    setSelectedModel,
    selectedMediaType,
    setSelectedMediaType,
    sortBy,
    setSortBy,
    prompts,
  } = usePromptStore();

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Extract distinct models from prompts
  const models = Array.from(new Set(prompts.map((p) => p.model))).filter(Boolean);

  return (
    <header className="sticky top-0 z-20 w-full glass-panel bg-[#07080b]/85 border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Mobile Brand Logo */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-7.5 h-7.5" />
            <span className="font-bold text-base tracking-tight text-white">
              Aistronaut
            </span>
          </Link>
        </div>

        {/* Search Bar - Desktop & Tablet */}
        <div className="hidden sm:flex flex-1 max-w-xl items-center relative">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts, styles, keywords, or models (e.g. 'cyberpunk', 'Flux', 'portrait')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-xs sm:text-sm font-normal placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white"
            aria-label="Toggle search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Media Type Toggle: Image vs Video */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-medium">
            <button
              onClick={() => setSelectedMediaType("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedMediaType === "all"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedMediaType("image")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${selectedMediaType === "image"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setSelectedMediaType("video")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${selectedMediaType === "video"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
          </div>

          {/* Model Filter Dropdown */}
          <div className="hidden lg:block relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="glass-pill text-xs font-medium text-slate-300 py-2 px-3 rounded-xl appearance-none pr-8 cursor-pointer focus:outline-none focus:border-violet-500/50"
            >
              <option value="all" className="bg-[#0f1117] text-slate-200">
                All AI Models
              </option>
              {models.map((m) => (
                <option key={m} value={m} className="bg-[#0f1117] text-slate-200">
                  {m}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-pill text-xs font-medium text-slate-300 py-2 px-3 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50"
            >
              <option value="trending" className="bg-[#0f1117] text-slate-200">
                🔥 Trending
              </option>
              <option value="newest" className="bg-[#0f1117] text-slate-200">
                ✨ Newest
              </option>
              <option value="most-copied" className="bg-[#0f1117] text-slate-200">
                📋 Most Copied
              </option>
              <option value="alphabetical" className="bg-[#0f1117] text-slate-200">
                🔤 Alphabetical
              </option>
            </select>
          </div>

          {/* Surprise Me Button */}
          <button
            onClick={() => triggerRandomPrompt()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-violet-600/15 to-amber-500/15 hover:from-amber-500/25 hover:to-violet-600/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold text-xs transition-all shadow-sm group hover:scale-[1.03] active:scale-[0.97]"
            title="Pick a random prompt"
          >
            <Dices className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Expandable Drawer */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all prompts..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 rounded-xl glass-input text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile quick filters */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Media:</span>
              <button
                onClick={() => setSelectedMediaType("all")}
                className={`px-2 py-0.5 rounded ${selectedMediaType === "all" ? "bg-violet-600 text-white" : "text-slate-400"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMediaType("image")}
                className={`px-2 py-0.5 rounded ${selectedMediaType === "image" ? "bg-violet-600 text-white" : "text-slate-400"
                  }`}
              >
                Images
              </button>
              <button
                onClick={() => setSelectedMediaType("video")}
                className={`px-2 py-0.5 rounded ${selectedMediaType === "video" ? "bg-violet-600 text-white" : "text-slate-400"
                  }`}
              >
                Videos
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-[11px] focus:outline-none"
            >
              <option value="trending" className="bg-[#0f1117]">Trending</option>
              <option value="newest" className="bg-[#0f1117]">Newest</option>
              <option value="most-copied" className="bg-[#0f1117]">Most Copied</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
