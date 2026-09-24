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
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--accent)] shadow-sm">
          <BookOpen className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-medium mb-2 text-[var(--text-primary)]">Workflow Guide Not Found</h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mb-6">
          This tutorial may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="btn-primary px-5 py-2.5 rounded-[12px] text-xs font-medium"
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
          title: `${tutorial.title} - Aistronaut`,
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 transition-colors duration-200">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface-elevated)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--border-strong)] transition-all">
              <ArrowLeft className="w-4 h-4 text-[var(--accent)] group-hover:-translate-x-0.5 transition-transform stroke-[1.75]" />
            </div>
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all text-xs font-medium cursor-pointer"
              title="Share this guide"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
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
            {tutorial.tags && tutorial.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {tutorial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-[7px] bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] font-mono text-[var(--accent)] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-medium text-[var(--text-primary)] tracking-tight leading-tight">
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
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[22px] overflow-hidden bg-[#141619] border border-[var(--border)] shadow-[var(--shadow-panel)]">
              <Image
                src={tutorial.mediaUrl}
                alt={tutorial.coverAlt || tutorial.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-center"
                priority
                unoptimized={tutorial.mediaUrl.startsWith("data:")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="px-2.5 py-1 rounded-[7px] bg-[#141619]/80 border border-white/10 text-[11px] font-mono">
                  Aistronaut Blueprint
                </span>
                {tutorial.model && (
                  <span className="px-2.5 py-1 rounded-[7px] bg-[#141619]/80 border border-white/10 text-[11px] font-mono text-white/80">
                    {tutorial.model}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Article Structured Body Content */}
        <section className="pt-2">
          <StructuredArticleRenderer blocks={articleBlocks} />
        </section>

        {/* Guide Specifications & Metadata Section at End of Tutorial */}
        {(tutorial.model || tutorial.level || (tutorial.tags && tutorial.tags.length > 0)) && (
          <section className="p-5 sm:p-6 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] space-y-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/50" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Guide Specifications
                </span>
              </div>
              {tutorial.tags && tutorial.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tutorial.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-[6px] bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {tutorial.model && (
                <div className="p-3.5 rounded-[14px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)] font-mono">AI Model Focus</span>
                  <span className="text-xs font-medium text-[var(--accent)] font-mono">
                    {tutorial.model}
                  </span>
                </div>
              )}

              {tutorial.level && (
                <div className="p-3.5 rounded-[14px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)] font-mono">Difficulty Level</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
                    {tutorial.level}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section: Explore Related Tutorials */}
        {relatedTutorials.length > 0 && (
          <section className="space-y-5 pt-12 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                More Prompt Engineering Guides
              </h3>
              <Link
                href="/"
                className="text-xs text-[var(--accent)] hover:opacity-90 font-medium flex items-center gap-1 cursor-pointer font-mono"
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
                  className="rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-4 space-y-3 hover:border-[var(--border-strong)] transition-all group flex flex-col justify-between shadow-[var(--shadow-card)] cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-28 rounded-[12px] overflow-hidden bg-[#141619] border border-[var(--border)]">
                      <Image
                        src={tut.mediaUrl}
                        alt={tut.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={tut.mediaUrl?.startsWith("data:")}
                      />
                    </div>
                    {tut.model && (
                      <span className="text-[10px] font-mono text-[var(--accent)] font-medium">
                        {tut.model}
                      </span>
                    )}
                    <h4 className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                      {tut.title}
                    </h4>
                  </div>

                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    {tut.level || "Beginner"}
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

