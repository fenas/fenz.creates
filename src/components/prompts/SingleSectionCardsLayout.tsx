"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Check,
  RotateCcw,
  SearchX,
  ChevronRight,
  Share2,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Tutorial, ComingSoonFeature } from "@/types";
import { PosterPromptCard } from "./PosterPromptCard";
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
  } = usePromptStore();

  const { showToast } = useToast();
  const [copiedTutId, setCopiedTutId] = useState<string | null>(null);

  const handleCopyTutorialPrompt = async (e: React.MouseEvent, tut: Tutorial) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(tut.samplePrompt);
      setCopiedTutId(tut.id);
      showToast("Formula Copied!", "success", tut.title);
      setTimeout(() => setCopiedTutId(null), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleShareTutorial = async (e: React.MouseEvent, tut: Tutorial) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tutorial/${tut.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tut.title} - Arenae`,
          text: `Check out this AI guide: ${tut.title}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Tutorial Link Copied!", "success", url);
    }
  };

  const handleShareComingSoon = async (e: React.MouseEvent, feat: ComingSoonFeature) => {
    e.stopPropagation();
    const url = `${window.location.origin}/coming-soon/${feat.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${feat.title} - Arenae Roadmap`,
          text: `Check out upcoming feature: ${feat.title}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Feature Link Copied!", "success", url);
    }
  };

  // Section Header Info
  const getHeaderInfo = () => {
    if (activeTab === "tutorials") {
      return {
        title: "Prompt Engineering Masterclasses",
        subtitle: "Master camera angles, lighting formulas, and advanced AI workflows",
        count: `${tutorials.length} guides`,
      };
    }
    if (activeTab === "coming-soon") {
      return {
        title: "Engine Roadmap & Feature Pipeline",
        subtitle: "Video generation models and prompt optimizers in active development",
        count: `${comingSoon.length} items`,
      };
    }
    if (selectedCategory !== "all") {
      const cat = categories.find((c) => c.id === selectedCategory);
      return {
        title: cat ? `${cat.name} Formulas` : "Category Prompts",
        subtitle: `Curated blueprints and visual styles for ${cat?.name || "this category"}`,
        count: `${filteredPrompts.length} formulas`,
      };
    }
    if (searchQuery.trim() !== "") {
      return {
        title: `Search: "${searchQuery}"`,
        subtitle: "Matching blueprints, styles, and prompt parameters",
        count: `${filteredPrompts.length} results`,
      };
    }
    return {
      title: "Discover All Prompts",
      subtitle: "Explore high-performing prompts across Midjourney, Flux, and creative models",
      count: `${filteredPrompts.length} formulas`,
    };
  };

  const header = getHeaderInfo();

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <span>{header.title}</span>
            {activeTab === "coming-soon" && (
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-normal bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]">
                Roadmap
              </span>
            )}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{header.subtitle}</p>
        </div>

        <span className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
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
                className="rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-5 space-y-4 hover:border-[var(--border-strong)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] transition-all duration-200 group flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
              >
                <div className="space-y-3.5">
                  {/* Top image & badges */}
                  <Link
                    href={`/tutorial/${tut.slug}`}
                    className="block relative w-full h-44 rounded-[12px] overflow-hidden bg-[#1E1E1E] border border-[var(--border)]"
                  >
                    <Image
                      src={tut.mediaUrl}
                      alt={tut.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      unoptimized={tut.mediaUrl?.startsWith("data:")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-[6px] bg-black/70 text-white text-[9.5px] font-mono border border-white/10">
                        {tut.model}
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-black/70 text-white/80 text-[9.5px] font-mono border border-white/10">
                        {tut.readTime}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <button
                        onClick={(e) => handleShareTutorial(e, tut)}
                        className="p-1.5 rounded-[8px] bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-all"
                        title="Share Tutorial Link"
                      >
                        <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[9.5px] font-mono uppercase text-[var(--accent)] font-medium">
                        {tut.level} Level
                      </span>
                      <h3 className="text-sm font-medium text-white truncate drop-shadow-sm">
                        {tut.title}
                      </h3>
                    </div>
                  </Link>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {tut.description}
                  </p>

                  {/* Core Takeaways */}
                  <div className="space-y-1.5 p-3 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)] text-[10.5px] uppercase tracking-wider block mb-0.5 font-mono">
                      Key Takeaways
                    </span>
                    {tut.content.slice(0, 2).map((point, i) => (
                      <div key={i} className="text-[11px] leading-relaxed line-clamp-1">
                        • {point}
                      </div>
                    ))}
                  </div>

                  {/* Sample Formula Box */}
                  <div className="p-3 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] space-y-1">
                    <span className="text-[9.5px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Formula Blueprint
                    </span>
                    <p className="text-[11px] line-clamp-2 text-[var(--text-secondary)]">&ldquo;{tut.samplePrompt}&rdquo;</p>
                  </div>
                </div>

                {/* Actions: Read Full Guide & Copy Formula */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]/60">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/tutorial/${tut.slug}`}
                      className="py-2 px-3 rounded-[10px] text-xs font-medium bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Read Guide</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
                    </Link>

                    <button
                      onClick={(e) => handleShareTutorial(e, tut)}
                      className="py-2 px-3 rounded-[10px] text-xs font-medium bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Share Link</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyTutorialPrompt(e, tut)}
                    className={`w-full py-2.5 px-4 rounded-[10px] text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      isCopied
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "btn-primary"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Formula Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Copy Formula Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
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
              className="rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 space-y-3.5 hover:border-[var(--border-strong)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
            >
              <div className="space-y-3">
                <Link
                  href={`/coming-soon/${feat.slug}`}
                  className="block relative w-full h-40 rounded-[12px] overflow-hidden bg-[#1E1E1E] border border-[var(--border)]"
                >
                  <Image
                    src={feat.mediaUrl}
                    alt={feat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-[6px] bg-black/70 text-white text-[9.5px] font-mono border border-white/10">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => handleShareComingSoon(e, feat)}
                      className="p-1.5 rounded-[8px] bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-all"
                      title="Share Feature Link"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[6px] bg-black/70 text-[9.5px] font-mono text-white/80 border border-white/10">
                    ETA: {feat.eta}
                  </div>
                </Link>

                <Link href={`/coming-soon/${feat.slug}`}>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] tracking-tight hover:text-[var(--accent)] transition-colors">
                    {feat.title}
                  </h3>
                </Link>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {feat.description}
                </p>

                <div className="space-y-1 pt-2 border-t border-[var(--border)]/60">
                  <span className="text-[9.5px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                    Highlights
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-0.5">
                    {feat.highlights.slice(0, 2).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border)]/60">
                <Link
                  href={`/coming-soon/${feat.slug}`}
                  className="text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                >
                  <span>Explore Feature</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
                </Link>

                <button
                  onClick={(e) => handleShareComingSoon(e, feat)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
                  title="Copy Direct Link"
                >
                  <Share2 className="w-3 h-3 stroke-[1.75]" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER CASE 3: Standard Prompts Grid */}
      {activeTab !== "tutorials" && activeTab !== "coming-soon" && (
        <>
          {filteredPrompts.length === 0 ? (
            <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-[16px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mb-3.5 shadow-sm">
                <SearchX className="w-6 h-6 text-[var(--icon-secondary)] stroke-[1.75]" />
              </div>

              <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                No prompts found
              </h3>

              <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5">
                No formulas matching your search query or active filter.
              </p>

              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setActiveTab("prompts");
                }}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Reset Filters</span>
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
    </section>
  );
}
