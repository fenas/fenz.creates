"use client";

import React from "react";
import {
  Search,
  Dices,
  X,
  Video,
  ImageIcon,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

export function UnifiedHeader() {
  const {
    searchQuery,
    setSearchQuery,
    triggerRandomPrompt,
    selectedMediaType,
    setSelectedMediaType,
  } = usePromptStore();

  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--surface)] border border-[var(--border)] rounded-[22px] mb-6 shadow-[var(--shadow-panel)] transition-all">
      <div className="px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt blueprints, styles, or models (e.g. 'Midjourney', 'portrait')..."
            className="w-full pl-10 pr-9 py-2.5 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs font-normal shadow-[var(--shadow-input)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          )}
        </div>

        {/* Right Actions Row */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Media Type Switcher */}
          <div className="flex items-center p-1 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] shadow-[var(--shadow-input)] text-xs">
            <button
              onClick={() => setSelectedMediaType("all")}
              className={`px-3 py-1.5 rounded-[9px] transition-all cursor-pointer ${
                selectedMediaType === "all"
                  ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] shadow-[var(--active-btn-shadow)] border border-[var(--active-btn-border)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedMediaType("image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] transition-all cursor-pointer ${
                selectedMediaType === "image"
                  ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] shadow-[var(--active-btn-shadow)] border border-[var(--active-btn-border)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setSelectedMediaType("video")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] transition-all cursor-pointer ${
                selectedMediaType === "video"
                  ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] shadow-[var(--active-btn-shadow)] border border-[var(--active-btn-border)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Video className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Videos</span>
            </button>
          </div>

          {/* Surprise Me Button */}
          <button
            onClick={() => triggerRandomPrompt()}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-[12px] bg-[var(--surface-elevated)] hover:bg-[var(--surface-soft)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-xs shadow-[var(--shadow-btn)] transition-all cursor-pointer active:translate-y-[1px]"
            title="Surprise Me with a random prompt"
          >
            <Dices className="w-4 h-4 text-[var(--accent)] stroke-[1.75]" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </div>
      </div>
    </header>
  );
}
