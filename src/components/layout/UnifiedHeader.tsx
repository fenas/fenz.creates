"use client";

import React, { useState } from "react";
import {
  Search,
  Dices,
  X,
  Video,
  ImageIcon,
  LayoutGrid,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { CategorySelectionModal } from "@/components/layout/CategorySelectionModal";

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

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Keep a compact number of categories visible to cleanly fit the bar
  const VISIBLE_COUNT = 4;
  const initialSlice = categories.slice(0, VISIBLE_COUNT);
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);
  const isSelectedInInitial = initialSlice.some((c) => c.id === selectedCategory);

  // If the active category is not in the first 4, include it dynamically
  const visibleCategories =
    selectedCategory !== "all" && selectedCatObj && !isSelectedInInitial
      ? [...initialSlice, selectedCatObj]
      : initialSlice;

  return (
    <>
      <header className="sticky top-0 z-20 w-full bg-[var(--surface)] border border-[var(--border)] rounded-[22px] mb-6 shadow-[-2px_-2px_8px_rgba(255,255,255,0.04),8px_16px_32px_rgba(0,0,0,0.48)] transition-all">
        <div className="px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Recessed High-Contrast Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt blueprints, styles, or models (e.g. 'Midjourney', 'portrait')..."
              className="w-full pl-10 pr-9 py-2.5 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs font-normal shadow-[inset_2px_3px_8px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.025)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/40 transition-all"
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
            <div className="flex items-center p-1 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.3)] text-xs">
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
              className="h-10 inline-flex items-center gap-2 px-4 rounded-[12px] bg-[var(--surface-elevated)] hover:bg-[var(--surface-soft)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-xs shadow-[-1px_-1px_4px_rgba(255,255,255,0.03),2px_4px_10px_rgba(0,0,0,0.35)] transition-all cursor-pointer active:translate-y-[1px]"
              title="Surprise Me with a random prompt"
            >
              <Dices className="w-4 h-4 text-[var(--accent)] stroke-[1.75]" />
              <span className="hidden sm:inline">Surprise Me</span>
            </button>

            {/* Theme Selector Popover */}
            <ThemeSelector />
          </div>
        </div>

        {/* Category Pills Row */}
        {(activeTab === "home" || activeTab === "prompts" || activeTab === "discover") && (
          <div className="px-4 sm:px-6 pb-3.5 pt-2 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* All Categories Option */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "all"
                  ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] border border-[var(--active-btn-border)] shadow-[var(--active-btn-shadow)] font-semibold"
                  : "bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
              }`}
            >
              {selectedCategory === "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_rgba(255,84,84,0.8)]" />
              )}
              <span>All Categories</span>
            </button>

            {/* Compact Visible Category Pills */}
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-[10px] text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] border border-[var(--active-btn-border)] shadow-[var(--active-btn-shadow)] font-semibold"
                      : "bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_rgba(255,84,84,0.8)]" />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}

            {/* View All Categories Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-[10px] text-xs font-medium bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-sm ml-auto sm:ml-0 active:translate-y-[1px]"
              title="View all categories"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
              <span>View All</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                ({categories.length})
              </span>
            </button>
          </div>
        )}
      </header>

      {/* View All Categories Window Modal */}
      <CategorySelectionModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
}
