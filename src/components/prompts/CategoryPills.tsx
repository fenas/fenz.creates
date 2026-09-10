"use client";

import React from "react";
import {
  Camera,
  Zap,
  Box,
  Sparkles,
  Flame,
  Building2,
  Layers,
  Leaf,
  Compass,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

// Icon mapping helper
const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Box: <Box className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Flame: <Flame className="w-3.5 h-3.5" />,
  Building2: <Building2 className="w-3.5 h-3.5" />,
  Layers: <Layers className="w-3.5 h-3.5" />,
  Leaf: <Leaf className="w-3.5 h-3.5" />,
};

export function CategoryPills() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    prompts,
    activeTab,
    setActiveTab,
  } = usePromptStore();

  // Count prompts per category
  const getCategoryCount = (catId: string) => {
    return prompts.filter(
      (p) => p.status === "published" && (catId === "all" || p.categoryId === catId)
    ).length;
  };

  return (
    <div className="w-full relative py-2 overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth">
        {/* All Button */}
        <button
          onClick={() => {
            setSelectedCategory("all");
            if (activeTab === "saved") setActiveTab("discover");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
            selectedCategory === "all"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/60 border border-violet-400/30 scale-[1.02]"
              : "glass-pill text-slate-300 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-violet-300" />
          <span>All Prompts</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategory === "all"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-slate-400"
            }`}
          >
            {getCategoryCount("all")}
          </span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          const icon = iconMap[cat.icon] || <Sparkles className="w-3.5 h-3.5" />;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (activeTab === "saved") setActiveTab("discover");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isSelected
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/60 border border-violet-400/30 scale-[1.02]"
                  : "glass-pill text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <span className={isSelected ? "text-violet-200" : "text-slate-400"}>
                {icon}
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
