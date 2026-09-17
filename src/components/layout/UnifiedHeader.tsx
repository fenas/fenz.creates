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
      <header className="sticky top-0 z-20 w-full bg-[var(--surface)] border border-[var(--border)] rounded-[20px] mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.03)] transition-all">
        <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Recessed Inset Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt blueprints, styles, or models (e.g. 'Midjourney', 'portrait')..."
              className="w-full pl-10 pr-9 py-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs font-normal shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            )}
          </div>

          {/* Right Actions Row */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Media Type Switcher */}
            <div className="flex items-center p-1 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs">
              <button
                onClick={() => setSelectedMediaType("all")}
                className={`px-2.5 py-1 rounded-[8px] transition-all font-medium ${
                  selectedMediaType === "all"
                    ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMediaType("image")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] transition-all font-medium ${
                  selectedMediaType === "image"
                    ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Images</span>
              </button>
              <button
                onClick={() => setSelectedMediaType("video")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] transition-all font-medium ${
                  selectedMediaType === "video"
                    ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm"
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
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs shadow-sm transition-all hover:border-[var(--border-strong)] active:scale-[0.98]"
              title="Surprise Me with a random prompt"
            >
              <Dices className="w-3.5 h-3.5 text-[var(--icon-secondary)] stroke-[1.75]" />
              <span className="hidden sm:inline">Surprise Me</span>
            </button>

            {/* Theme Selector Popover */}
            <ThemeSelector />
          </div>
        </div>

        {/* Category Pills Row */}
        {(activeTab === "home" || activeTab === "prompts" || activeTab === "discover") && (
          <div className="px-4 sm:px-6 pb-3 pt-1 border-t border-[var(--border)]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* All Categories Option */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-[10px] text-xs transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm font-medium"
                  : "bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
              }`}
            >
              All Categories
            </button>

            {/* Compact Visible Category Pills */}
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-sm font-medium"
                      : "bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {/* View All Categories Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-[10px] text-xs font-medium bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)] flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shadow-sm ml-auto sm:ml-0"
              title="View all categories"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[var(--icon-secondary)] stroke-[1.75]" />
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
