"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Check,
  LayoutGrid,
  Camera,
  Zap,
  Box,
  Sparkles,
  Flame,
  Building2,
  Layers,
  Leaf,
  Palette,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Category } from "@/types";

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon helper mapping
const getCategoryIcon = (iconName?: string) => {
  switch (iconName?.toLowerCase()) {
    case "camera":
      return Camera;
    case "zap":
      return Zap;
    case "box":
      return Box;
    case "sparkles":
      return Sparkles;
    case "flame":
      return Flame;
    case "building2":
      return Building2;
    case "layers":
      return Layers;
    case "leaf":
    case "nature":
      return Leaf;
    default:
      return Palette;
  }
};

export function CategorySelectionModal({
  isOpen,
  onClose,
}: CategorySelectionModalProps) {
  const { categories, selectedCategory, setSelectedCategory, prompts } =
    usePromptStore();
  const [search, setSearch] = useState("");

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return prompts.filter((p) => p.status === "published").length;
    return prompts.filter((p) => p.categoryId === categoryId && p.status === "published").length;
  };

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl rounded-[22px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] z-10 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-[var(--text-primary)]">All Visual Categories</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Explore prompt formulas categorized by style and medium</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Search Field */}
        <div className="p-4 sm:px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter categories (e.g. 'Photorealistic', '3D', 'Fashion')..."
              className="w-full pl-10 pr-4 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
              autoFocus
            />
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 space-y-3">
          {/* All Categories Option Card */}
          {(!search || "all categories".includes(search.toLowerCase())) && (
            <div
              onClick={() => handleSelect("all")}
              className={`p-3.5 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedCategory === "all"
                  ? "bg-[var(--surface-active)] border-[var(--border-strong)] shadow-sm"
                  : "bg-[var(--surface-muted)] hover:bg-[var(--surface)] border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="w-4 h-4 text-[var(--text-primary)] stroke-[1.75]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-2">
                    <span>All Categories</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      ({getCategoryCount("all")} formulas)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                    View full catalog across all mediums, styles, and prompt blueprints.
                  </p>
                </div>
              </div>

              {selectedCategory === "all" && (
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white stroke-[2.5]" />
                </div>
              )}
            </div>
          )}

          {/* Specific Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCategories.map((cat: Category) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = getCategoryIcon(cat.icon);
              const count = getCategoryCount(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelect(cat.id)}
                  className={`p-3 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "bg-[var(--surface-active)] border-[var(--border-strong)] shadow-sm"
                      : "bg-[var(--surface-muted)] hover:bg-[var(--surface)] border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[var(--icon-primary)] stroke-[1.75]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {cat.name}
                        </div>
                        <span className="text-[9.5px] font-mono text-[var(--text-muted)]">
                          {count} formulas
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {cat.description && (
                    <p className="text-[10.5px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              No categories found matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <span>{categories.length + 1} total filters available</span>
          <button
            onClick={onClose}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
