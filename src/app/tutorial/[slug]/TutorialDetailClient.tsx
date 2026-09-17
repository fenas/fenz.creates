"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Share2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Tutorial } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";
import { StructuredArticleRenderer } from "@/components/tutorials/StructuredArticleRenderer";
import { convertTutorialToBlocks } from "@/lib/blockConverter";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function TutorialDetailClient({
  initialTutorial,
  slug,
}: {
  initialTutorial?: Tutorial | null;
  slug: string;
}) {
  const { tutorials } = usePromptStore();
  const { showToast } = useToast();

  // Find latest from store or fallback to initialTutorial
  const tutorial =
    tutorials.find(
      (t) =>
        t.slug === slug ||
        t.id === slug ||
        (initialTutorial && (t.slug === initialTutorial.slug || t.id === initialTutorial.id))
    ) || initialTutorial;

  const [copiedLink, setCopiedLink] = useState(false);

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center mb-4 text-[#E85002]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Workflow Guide Not Found</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
          This tutorial may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E85002] to-[#F16001] text-white font-bold text-xs shadow-lg shadow-[#E85002]/30 hover:scale-105 transition-transform"
        >
          Return to Discovery
        </Link>
      </div>
    );
  }

  const relatedTutorials = tutorials
    .filter((t) => t.id !== tutorial.id)
    .slice(0, 3);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tutorial.title} - Arenae`,
          text: `Read this AI Prompt Engineering Guide for ${tutorial.model}: "${tutorial.title}"`,
          url,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      if (url) {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        showToast("Article Link Copied!", "success", url);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const articleBlocks =
    tutorial.blocks && tutorial.blocks.length > 0
      ? tutorial.blocks
      : convertTutorialToBlocks(tutorial);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#E85002] selection:text-white pb-24 transition-colors duration-200">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/90 border-b border-[var(--border-glass)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center group-hover:border-[#E85002]/40 group-hover:bg-[#E85002]/10 transition-all">
              <ArrowLeft className="w-4 h-4 text-[#E85002] group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E85002]/15 border border-[#E85002]/30 text-[#E85002] hover:bg-[#E85002] hover:text-white transition-all text-xs font-bold shadow-lg"
              title="Share this guide"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Guide</span>
                </>
              )}
            </button>

            {/* Theme Selector */}
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Main Content Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header Section */}
        <div className="space-y-6">
          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
              {tutorial.title}
            </h1>
            {(tutorial.subtitle || tutorial.description) && (
              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                {tutorial.subtitle || tutorial.description}
              </p>
            )}
          </div>

          {/* Featured Visual Media */}
          {tutorial.mediaUrl && (
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-[var(--border-glass)] shadow-2xl">
              <Image
                src={tutorial.mediaUrl}
                alt={tutorial.coverAlt || tutorial.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-center"
                priority
                unoptimized={tutorial.mediaUrl.startsWith("data:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
                  Arenae Blueprint
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Article Structured Body Content */}
        <section className="pt-2">
          <StructuredArticleRenderer blocks={articleBlocks} />
        </section>

        {/* Section: Explore Related Tutorials */}
        {relatedTutorials.length > 0 && (
          <section className="space-y-5 pt-12 border-t border-[var(--border-glass)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                More Prompt Engineering Guides
              </h3>
              <Link
                href="/"
                className="text-xs text-[#E85002] hover:text-[#F16001] font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTutorials.map((tut) => (
                <Link
                  key={tut.id}
                  href={`/tutorial/${tut.slug}`}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] p-4 space-y-3 hover:border-[#E85002]/40 transition-all group flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-[var(--border-glass)]">
                      <Image
                        src={tut.mediaUrl}
                        alt={tut.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={tut.mediaUrl?.startsWith("data:")}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#E85002]">
                      {tut.model}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[#E85002] transition-colors">
                      {tut.title}
                    </h4>
                  </div>

                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    {tut.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

