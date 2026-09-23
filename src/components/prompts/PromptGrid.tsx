"use client";

import React from "react";
import { Prompt } from "@/types";
import { PromptCard } from "./PromptCard";
import { SearchX, RotateCcw } from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

interface PromptGridProps {
  prompts: Prompt[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  const {
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setSelectedModel,
    setSelectedMediaType,
    setActiveTab,
  } = usePromptStore();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedModel("all");
    setSelectedMediaType("all");
    setActiveTab("discover");
  };

  if (prompts.length === 0) {
    return (
      <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 shadow-lg shadow-violet-950/30">
          <SearchX className="w-8 h-8 text-violet-400" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          No prompts found
        </h3>

        <p className="text-sm text-slate-400 max-w-sm mb-6">
          {searchQuery
            ? `We couldn't find any prompts matching "${searchQuery}". Try different keywords or reset filters.`
            : "Try adjusting your category, model, or media type filters to discover more prompts."}
        </p>

        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-950/50 hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 pb-16">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
