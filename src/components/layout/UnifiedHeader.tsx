"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Dices,
  X,
  Sparkles,
  ChevronDown,
  SlidersHorizontal,
  Video,
  ImageIcon,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

export function UnifiedHeader() {
  const {
    searchQuery,
    setSearchQuery,
    triggerRandomPrompt,
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedMediaType,
    setSelectedMediaType,
    activeTab,
  } = usePromptStore();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 w-full floating-panel bg-[#0b0d14]/90 border-b border-white/10 backdrop-blur-xl rounded-2xl mb-6">
      <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt blueprints, styles, or models (e.g. 'Midjourney', 'cyberpunk', 'portrait')..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-xs font-medium placeholder-slate-400"
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

        {/* Right Actions Row */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Media Type Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-medium">
            <button
              onClick={() => setSelectedMediaType("all")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedMediaType === "all"
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedMediaType("image")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                selectedMediaType === "image"
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setSelectedMediaType("video")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                selectedMediaType === "video"
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Videos</span>
            </button>
          </div>

          {/* Surprise Me Button */}
          <button
            onClick={() => triggerRandomPrompt()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold text-xs transition-all hover:scale-105"
            title="Random Prompt"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {/* Category Pills Row (shown on Prompts & Home tabs) */}
      {(activeTab === "home" || activeTab === "prompts" || activeTab === "discover") && (
        <div className="px-4 sm:px-6 pb-3 pt-1 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-[#252a3a] text-white border border-white/20 shadow-sm"
                : "netflix-pill text-slate-400 hover:text-white"
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#252a3a] text-white border border-white/20 shadow-sm"
                    : "netflix-pill text-slate-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
