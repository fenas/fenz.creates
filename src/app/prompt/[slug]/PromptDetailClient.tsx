"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Bookmark,
  Share2,
  Sparkles,
  Sliders,
  Tag,
  Layers,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatDate, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function PromptDetailClient({
  initialPrompt,
  slug,
}: {
  initialPrompt?: Prompt | null;
  slug: string;
}) {
  const {
    prompts,
    copyPrompt,
    toggleSave,
    isSaved,
    categories,
    setActiveTab,
    setSearchQuery,
  } = usePromptStore();
  const { showToast } = useToast();

  // Find latest in store or fallback to initialPrompt
  const prompt =
    prompts.find(
      (p) =>
        p.slug === slug ||
        p.id === slug ||
        (initialPrompt && (p.slug === initialPrompt.slug || p.id === initialPrompt.id))
    ) || initialPrompt;

  const [copied, setCopied] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images =
    prompt?.mediaUrls && prompt.mediaUrls.length > 0
      ? prompt.mediaUrls
      : prompt?.mediaUrl
      ? [prompt.mediaUrl]
      : [];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [prompt?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && images.length > 1) {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--accent)] shadow-sm">
          <Sparkles className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-medium mb-2 text-[var(--text-primary)]">Prompt Showcase Not Found</h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mb-6">
          This prompt formula may have been removed or the link is incorrect.
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

  const currentImageUrl = images[activeImageIndex] || prompt.mediaUrl;
  const saved = isSaved(prompt.id);
  const category = categories.find((c) => c.id === prompt.categoryId);

  const relatedPrompts = prompts
    .filter(
      (p) =>
        p.id !== prompt.id &&
        p.status === "published" &&
        (p.categoryId === prompt.categoryId ||
          p.tags.some((t) => prompt.tags.includes(t)))
    )
    .slice(0, 4);

  const handleCopyMain = async () => {
    setCopied(true);
    await copyPrompt(prompt);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyNegative = async () => {
    if (!prompt.negativePrompt) return;
    await navigator.clipboard.writeText(prompt.negativePrompt);
    setCopiedNegative(true);
    showToast("Negative Prompt Copied", "info");
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${prompt.title} - Arenae`,
          text: `Check out this AI prompt for ${prompt.model}: "${prompt.title}"`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link Copied to Clipboard!", "success", url);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[var(--surface-elevated)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[var(--accent)] stroke-[1.75]" />
            <span>Back to Discovery Gallery</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => toggleSave(prompt.id)}
              className={`p-2 rounded-[10px] transition-all border cursor-pointer ${
                saved
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_8px_rgba(232,92,92,0.3)]"
                  : "bg-[var(--surface-muted)] hover:bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title={saved ? "Saved" : "Save Prompt"}
            >
              <Bookmark className={`w-4 h-4 stroke-[1.75] ${saved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Theme Toggle */}
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Artwork Showcase with Arrow Scroll */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-[20px] overflow-hidden bg-[#141619] border border-[var(--border)] shadow-[var(--shadow-card)] group">
              <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square">
                <Image
                  src={currentImageUrl}
                  alt={`${prompt.title} - Artwork ${activeImageIndex + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-all duration-300"
                  unoptimized={currentImageUrl.startsWith("data:")}
                  priority
                />
              </div>

              {/* Multiple Images Arrow Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[10px] bg-[#1D2024]/90 hover:bg-[#25292E] text-white flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95 z-20 cursor-pointer"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[10px] bg-[#1D2024]/90 hover:bg-[#25292E] text-white flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95 z-20 cursor-pointer"
                    title="Next Image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-[7px] bg-[#141619]/85 border border-white/15 text-white font-mono text-xs shadow-xl z-20 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-white/80" />
                  <span>{activeImageIndex + 1} / {images.length}</span>
                </div>
              )}

              {prompt.type === "video" && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-[7px] bg-[#141619]/80 border border-white/15 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg z-20 font-mono">
                  <Video className="w-3.5 h-3.5" />
                  Video Prompt
                </div>
              )}

              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-[7px] bg-[#141619]/80 text-white/80 font-mono text-xs border border-white/10 z-20">
                {prompt.aspectRatio}
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0 border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={img.startsWith("data:")}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white font-mono text-center py-0.5">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 rounded-[12px] bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] shadow-sm">
              <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                {formatNumber(prompt.copyCount || 0)} copies
              </span>
              <span className="font-mono text-[11px]">Published {formatDate(prompt.createdAt)}</span>
            </div>
          </div>

          {/* Prompt Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs font-medium text-[var(--accent)] font-mono uppercase tracking-wider mb-1.5">
                {category?.name || "AI Art"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium text-[var(--text-primary)] tracking-tight">
                {prompt.title}
              </h1>
            </div>

            {/* Copyable prompt box (Recessed) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  Prompt Formula
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono px-2 py-0.5 rounded-[6px] bg-[var(--surface-muted)] border border-[var(--border)]">
                  {prompt.model}
                </span>
              </div>

              <div className="rounded-[16px] bg-[var(--surface-recessed)] border border-[var(--border)] p-5 font-mono text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
                <p className="select-all break-words">&ldquo;{prompt.promptText}&rdquo;</p>

                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={handleCopyMain}
                    className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-[12px] text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      copied
                        ? "bg-[var(--accent)] text-white shadow-[0_2px_10px_rgba(232,92,92,0.35)]"
                        : "btn-primary"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2]" />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 stroke-[1.75]" />
                        <span>Copy Full Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Negative prompt */}
            {prompt.negativePrompt && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)]">
                  <span>Negative Parameters</span>
                  <button
                    onClick={handleCopyNegative}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedNegative ? <Check className="w-3 h-3 text-[var(--accent)] stroke-[2]" /> : <Copy className="w-3 h-3 stroke-[1.75]" />}
                    <span>{copiedNegative ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] p-3.5 font-mono text-xs text-[var(--text-secondary)] select-all shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.25)]">
                  {prompt.negativePrompt}
                </div>
              </div>
            )}

            {/* Technical Parameters */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 stroke-[1.75]" />
                Technical Settings
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)]">AI Model</div>
                  <div className="font-mono text-[var(--text-primary)] truncate mt-0.5">{prompt.model}</div>
                </div>
                <div className="p-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)]">Aspect Ratio</div>
                  <div className="font-mono text-[var(--text-primary)] mt-0.5">{prompt.aspectRatio}</div>
                </div>
                {prompt.parameters?.stylize !== undefined && (
                  <div className="p-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Stylize (--s)</div>
                    <div className="font-mono text-[var(--text-primary)] mt-0.5">{prompt.parameters.stylize}</div>
                  </div>
                )}
                {prompt.parameters?.cfgScale !== undefined && (
                  <div className="p-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">CFG Scale</div>
                    <div className="font-mono text-[var(--text-primary)] mt-0.5">{prompt.parameters.cfgScale}</div>
                  </div>
                )}
                {prompt.parameters?.seed && (
                  <div className="p-3 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Seed</div>
                    <div className="font-mono text-[var(--text-primary)] mt-0.5">{prompt.parameters.seed}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 stroke-[1.75]" />
                Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((t) => (
                  <Link
                    key={t}
                    href="/"
                    onClick={() => {
                      setSearchQuery(t);
                      setActiveTab("discover");
                    }}
                    className="px-3 py-1.5 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] transition-all font-mono"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Prompts Row */}
        {relatedPrompts.length > 0 && (
          <div className="pt-12 border-t border-[var(--border)] space-y-6">
            <h2 className="text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 stroke-[1.75]" />
              Related Prompts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedPrompts.map((related) => (
                <Link
                  key={related.id}
                  href={`/prompt/${related.slug}`}
                  className="group relative rounded-[16px] overflow-hidden bg-[var(--surface-muted)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all aspect-[4/3] shadow-md"
                >
                  <Image
                    src={related.mediaUrl}
                    alt={related.title}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-xs font-medium text-white truncate drop-shadow">
                      {related.title}
                    </span>
                    <span className="text-[10px] text-white/70 font-mono">
                      {related.model}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

