"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { CategoryPills } from "@/components/prompts/CategoryPills";
import { PromptGrid } from "@/components/prompts/PromptGrid";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { SubmitPromptModal } from "@/components/prompts/SubmitPromptModal";
import { usePromptStore } from "@/context/PromptContext";
import { Sparkles, Flame, Clock, Bookmark } from "lucide-react";

export default function Home() {
  const {
    filteredPrompts,
    activeTab,
    selectedCategory,
    categories,
    searchQuery,
    activeModalPrompt,
    setActiveModalPrompt,
  } = usePromptStore();

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Tab heading helper
  const getSectionHeading = () => {
    if (searchQuery) {
      return {
        title: `Search results for "${searchQuery}"`,
        subtitle: `Found ${filteredPrompts.length} prompt formula(s)`,
        icon: Sparkles,
      };
    }
    if (activeTab === "saved") {
      return {
        title: "Saved Prompt Collection",
        subtitle: "Your bookmarked prompt formulas saved in local storage",
        icon: Bookmark,
      };
    }
    if (activeTab === "trending") {
      return {
        title: "Trending & Most Copied",
        subtitle: "The most popular prompts inspiring creators right now",
        icon: Flame,
      };
    }
    if (activeTab === "new") {
      return {
        title: "Recently Added Prompts",
        subtitle: "Fresh prompts added to the showcase",
        icon: Clock,
      };
    }
    if (selectedCategory !== "all" && currentCategoryObj) {
      return {
        title: currentCategoryObj.name,
        subtitle: currentCategoryObj.description || "Curated prompts in this genre",
        icon: Sparkles,
      };
    }
    return {
      title: "Discover All Prompts",
      subtitle: "Explore curated AI prompt blueprints ready to copy",
      icon: Sparkles,
    };
  };

  const headingInfo = getSectionHeading();
  const HeadingIcon = headingInfo.icon;

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col md:flex-row relative">
      {/* Background ambient lighting */}
      <div className="ambient-glow" />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-16 lg:pl-64 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12 z-10 space-y-6">
          {/* Hero Banner */}
          <HeroBanner />

          {/* Category Filter Pills */}
          <div className="space-y-4">
            <CategoryPills />

            {/* Section Heading */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-400">
                  <HeadingIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {headingInfo.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {headingInfo.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? "prompt" : "prompts"}
              </span>
            </div>
          </div>

          {/* Prompt Grid */}
          <PromptGrid prompts={filteredPrompts} />
        </main>
      </div>

      {/* Prompt Detail Modal */}
      <PromptDetailModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />

      {/* Submit Community Prompt Modal */}
      <SubmitPromptModal />
    </div>
  );
}
