"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RotateCcw,
  SearchX,
  ChevronRight,
  Share2,
  ArrowUpRight,
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
    isLoaded,
    setSearchQuery,
    setSelectedCategory,
    setActiveTab,
  } = usePromptStore();

  const { showToast } = useToast();

  const handleShareTutorial = async (e: React.MouseEvent, tut: Tutorial) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tutorial/${tut.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tut.title} - Aistronaut`,
          text: `Check out this AI guide: ${tut.title}`,
          url,
        });
      } catch { }
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
          title: `${feat.title} - Aistronaut Roadmap`,
          text: `Check out upcoming feature: ${feat.title}`,
          url,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Feature Link Copied!", "success", url);
    }
  };

  const isHomeView =
    (activeTab === "home" || activeTab === "discover") &&
    selectedCategory === "all" &&
    !searchQuery.trim();

  // Helper renderer for a Workflow Guide Card
  const renderTutorialCard = (tut: Tutorial) => (
    <div
      key={tut.id}
      className="rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-5 space-y-4 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 group flex flex-col justify-between shadow-[var(--shadow-card)]"
    >
      <div className="space-y-3.5">
        {/* Top image & badges */}
        <Link
          href={`/tutorial/${tut.slug}`}
          className="block relative w-full h-44 rounded-[12px] overflow-hidden bg-[#0A0C0E] border border-[var(--border)]"
        >
          <Image
            src={tut.mediaUrl}
            alt={tut.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            unoptimized={tut.mediaUrl?.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {tut.model && (
              <span className="px-2 py-0.5 rounded-[6px] bg-[#0A0C0E]/90 text-white text-[9.5px] font-mono border border-white/20 shadow-sm">
                {tut.model}
              </span>
            )}
            {tut.readTime && (
              <span className="px-2 py-0.5 rounded-[6px] bg-[#0A0C0E]/90 text-white/90 text-[9.5px] font-mono border border-white/20 shadow-sm">
                {tut.readTime}
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={(e) => handleShareTutorial(e, tut)}
              className="p-1.5 rounded-[8px] bg-[#0A0C0E]/80 hover:bg-[#1E2228] text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-sm"
              title="Share Tutorial Link"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[9.5px] font-mono uppercase text-[var(--accent)] font-semibold tracking-wider">
              {tut.level || "Beginner"} Level
            </span>
            <h3 className="text-sm font-semibold text-white truncate drop-shadow-sm">
              {tut.title}
            </h3>
          </div>
        </Link>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {tut.description}
        </p>
      </div>

      {/* Actions: Read Full Guide & Share */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
        <Link
          href={`/tutorial/${tut.slug}`}
          className="flex-1 py-2.5 px-4 rounded-[10px] text-xs font-medium btn-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Read Full Workflow</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>

        <button
          onClick={(e) => handleShareTutorial(e, tut)}
          className="py-2.5 px-3 rounded-[10px] text-xs font-medium bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Share Tutorial Link"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );

  // ==========================================
  // VIEW 1: HOME PAGE (Both Prompts & Workflows with View All)
  // ==========================================
  if (isHomeView) {
    const previewPrompts = filteredPrompts.slice(0, 9);
    const previewTutorials = tutorials.slice(0, 2);

    return (
      <div className="space-y-14 pb-16">
        {/* SECTION 1: Discover All Prompts / Visual Systems */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--border)] pb-4 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Discover All Prompts
              </h2>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hidden sm:inline-block">
                {filteredPrompts.length} prompts
              </span>

              <button
                onClick={() => {
                  setActiveTab("prompts");
                  setSelectedCategory("all");
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm group"
                title="View All Prompts"
              >
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {previewPrompts.length === 0 ? (
            !isLoaded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[18px] bg-[var(--surface)] border border-[var(--border)] overflow-hidden relative shadow-[var(--shadow-card)]"
                  >
                    <div className="absolute inset-0 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-[var(--text-secondary)]">No prompts uploaded yet.</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4">
              {previewPrompts.map((prompt) => (
                <PosterPromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: Workflows & Tutorials */}
        {tutorials.length > 0 && (
          <section className="space-y-6 pt-2">
            <div className="flex items-end justify-between border-b border-[var(--border)] pb-4 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <span>Workflows & Masterclasses</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Step-by-step masterclasses and advanced prompt engineering frameworks
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] hidden sm:inline-block">
                  {tutorials.length} guides
                </span>

                <button
                  onClick={() => setActiveTab("tutorials")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm group"
                  title="View All Workflows"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewTutorials.map((tut) => renderTutorialCard(tut))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DEDICATED TAB VIEWS (Full Listings)
  // ==========================================
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
      title: "All Prompts Gallery",
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
          {tutorials.map((tut) => renderTutorialCard(tut))}
        </div>
      )}

      {/* RENDER CASE 2: Coming Soon Grid */}
      {activeTab === "coming-soon" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
          {comingSoon.map((feat) => (
            <div
              key={feat.id}
              className="rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 space-y-3.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)] transition-all flex flex-col justify-between shadow-[var(--shadow-card)]"
            >
              <div className="space-y-3">
                <Link
                  href={`/coming-soon/${feat.slug}`}
                  className="block relative w-full h-40 rounded-[12px] overflow-hidden bg-[#0A0C0E] border border-[var(--border)]"
                >
                  <Image
                    src={feat.mediaUrl}
                    alt={feat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#0A0C0E]/90 text-white text-[9.5px] font-mono border border-white/20 shadow-sm">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => handleShareComingSoon(e, feat)}
                      className="p-1.5 rounded-[8px] bg-[#0A0C0E]/80 hover:bg-[#1E2228] text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer shadow-sm"
                      title="Share Feature Link"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[6px] bg-[#0A0C0E]/90 text-[9.5px] font-mono text-white/90 border border-white/20 shadow-sm">
                    ETA: {feat.eta}
                  </div>
                </Link>

                <Link href={`/coming-soon/${feat.slug}`}>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight hover:text-[var(--accent)] transition-colors">
                    {feat.title}
                  </h3>
                </Link>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {feat.description}
                </p>

                <div className="space-y-1 pt-2 border-t border-[var(--border)]">
                  <span className="text-[9.5px] font-mono uppercase text-[var(--text-muted)] tracking-wider font-semibold">
                    Highlights
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-[var(--text-secondary)] space-y-0.5">
                    {feat.highlights.slice(0, 2).map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border)]">
                <Link
                  href={`/coming-soon/${feat.slug}`}
                  className="text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                >
                  <span>Explore Feature</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
                </Link>

                <button
                  onClick={(e) => handleShareComingSoon(e, feat)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)] cursor-pointer shadow-sm"
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
            !isLoaded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 pb-16">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-[18px] bg-[var(--surface)] border border-[var(--border)] overflow-hidden relative shadow-[var(--shadow-card)]"
                  >
                    <div className="absolute inset-0 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-[16px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mb-3.5 shadow-sm">
                  <SearchX className="w-6 h-6 text-[var(--icon-secondary)] stroke-[1.75]" />
                </div>

                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No prompts found
                </h3>

                <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5">
                  No formulas matching your search query or active filter.
                </p>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setActiveTab("discover");
                  }}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 pb-16">
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
