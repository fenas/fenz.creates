"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  Clock,
  Bookmark,
  Play,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  SearchX,
  Layers,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Prompt, Tutorial, ComingSoonFeature } from "@/types";
import { initialTutorials, initialComingSoon } from "@/data/tutorialsData";
import { PosterPromptCard } from "./PosterPromptCard";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function SingleSectionCardsLayout() {
  const {
    filteredPrompts,
    activeTab,
    selectedCategory,
    categories,
    tutorials,
    comingSoon,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setActiveTab,
    copyPrompt,
    setActiveModalPrompt,
  } = usePromptStore();

  const { showToast } = useToast();
  const [copiedTutId, setCopiedTutId] = useState<string | null>(null);

  const handleCopyTutorialPrompt = async (tut: Tutorial) => {
    try {
      await navigator.clipboard.writeText(tut.samplePrompt);
      setCopiedTutId(tut.id);
      showToast("Formula Copied!", "success", tut.title);
      setTimeout(() => setCopiedTutId(null), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Section Header Info
  const getHeaderInfo = () => {
    if (activeTab === "tutorials") {
      return {
        title: "Prompt Engineering Tutorials",
        subtitle: "Masterclasses and formula breakdowns for Midjourney, Flux, and SDXL",
        count: `${tutorials.length} guides`,
      };
    }
    if (activeTab === "coming-soon") {
      return {
        title: "Coming Soon to fenz.creates",
        subtitle: "Upcoming features and AI video prompt tools in development",
        count: `${comingSoon.length} updates`,
      };
    }
    if (activeTab === "saved") {
      return {
        title: "Saved Prompt Formulas",
        subtitle: "Your personal bookmarks stored in your browser",
        count: `${filteredPrompts.length} saved`,
      };
    }
    if (searchQuery) {
      return {
        title: `Search: "${searchQuery}"`,
        subtitle: `Displaying matching prompts across title, tags, and AI model`,
        count: `${filteredPrompts.length} results`,
      };
    }
    const cat = categories.find((c) => c.id === selectedCategory);
    return {
      title: cat ? cat.name : "All Prompt Formulas",
      subtitle: cat?.description || "Browse and 1-click copy curated prompts",
      count: `${filteredPrompts.length} prompts`,
    };
  };

  const header = getHeaderInfo();

  return (
    <div className="w-full space-y-6">
      {/* Single Section Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{header.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {header.subtitle}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 font-semibold">
          {header.count}
        </span>
      </div>

      {/* RENDER CASE 1: Tutorials Grid */}
      {activeTab === "tutorials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-16">
          {tutorials.map((tut) => {
            const isCopied = copiedTutId === tut.id;
            return (
              <div
                key={tut.id}
                className="rounded-3xl floating-panel bg-[#0e1017]/95 border border-white/10 p-6 space-y-5 hover:border-violet-500/40 transition-all group shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top image & badges */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                    <Image
                      src={tut.mediaUrl}
                      alt={tut.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow-md">
                        {tut.model}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-medium border border-white/10">
                        {tut.readTime}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-violet-300">
                        {tut.level} Level
                      </span>
                      <h3 className="text-base font-bold text-white truncate drop-shadow">
                        {tut.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tut.description}
                  </p>

                  {/* Core Takeaways */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                    <span className="font-semibold text-white text-[11px] uppercase tracking-wider block mb-1">
                      Key Takeaways:
                    </span>
                    {tut.content.map((point, i) => (
                      <div key={i} className="text-slate-400 text-[11px] leading-relaxed">
                        {point}
                      </div>
                    ))}
                  </div>

                  {/* Sample Formula Box */}
                  <div className="p-3 rounded-xl bg-black/50 border border-violet-500/20 text-xs font-mono text-slate-300 space-y-2">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">
                      Sample Formula:
                    </span>
                    <p className="text-[11px] line-clamp-2">&ldquo;{tut.samplePrompt}&rdquo;</p>
                  </div>
                </div>

                {/* Copy Sample Formula Button */}
                <button
                  onClick={() => handleCopyTutorialPrompt(tut)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isCopied
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-black hover:bg-slate-200"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Formula Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tutorial Prompt Formula</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER CASE 2: Coming Soon Grid */}
      {activeTab === "coming-soon" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
          {comingSoon.map((feat) => (
            <div
              key={feat.id}
              className="rounded-3xl floating-panel bg-[#0e1017]/95 border border-white/10 p-5 space-y-4 hover:border-[#E85002]/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <Image
                    src={feat.mediaUrl}
                    alt={feat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#E85002] text-white text-[10px] font-bold shadow-md">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300">
                    ETA: {feat.eta}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Highlights:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                    {feat.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-xs font-semibold text-[#E85002] flex items-center justify-center gap-1">
                  <span>Launching {feat.eta}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER CASE 3: Standard Prompts Single Section Grid */}
      {activeTab !== "tutorials" && activeTab !== "coming-soon" && (
        <>
          {filteredPrompts.length === 0 ? (
            <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#E85002]/10 border border-[#E85002]/20 flex items-center justify-center mb-4 shadow-xl">
                <SearchX className="w-8 h-8 text-[#E85002]" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                No prompts found
              </h3>

              <p className="text-sm text-slate-400 max-w-sm mb-6">
                {activeTab === "saved"
                  ? "You haven't bookmarked any prompt formulas yet. Click the bookmark icon on any card to save it here."
                  : `No formulas matching your search query or category filter.`}
              </p>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setActiveTab("prompts");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40 hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters & Explore</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 pb-16">
              {filteredPrompts.map((prompt) => (
                <PosterPromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
