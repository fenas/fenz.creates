"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Sparkles,
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

  const isPack =
    prompt?.promptKind === "pack" ||
    (Array.isArray(prompt?.packItems) && prompt.packItems.length > 1) ||
    images.length > 1;

  const currentPackItem = prompt?.packItems?.[activeImageIndex];
  const activePromptText = currentPackItem?.promptText || prompt?.promptText || "";
  const activeNegativePrompt =
    currentPackItem?.negativePrompt !== undefined
      ? currentPackItem.negativePrompt
      : prompt?.negativePrompt;

  const currentImageUrl = images[activeImageIndex] || prompt.mediaUrl;
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
    await navigator.clipboard.writeText(activePromptText);
    await copyPrompt(prompt);
    showToast("Prompt Copied to Clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllPackPrompts = async () => {
    if (!prompt.packItems || prompt.packItems.length === 0) {
      await handleCopyMain();
      return;
    }
    const allText = prompt.packItems
      .map((item, idx) => `/* [${prompt.title} - Image ${idx + 1}] */\n${item.promptText}`)
      .join("\n\n");
    await navigator.clipboard.writeText(allText);
    await copyPrompt(prompt);
    showToast(`Copied all ${prompt.packItems.length} pack prompts!`, "success");
  };

  const handleCopyNegative = async () => {
    if (!activeNegativePrompt) return;
    await navigator.clipboard.writeText(activeNegativePrompt);
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
                        ? "border-[#E85002] ring-2 ring-[#E85002]/60 scale-[1.03]"
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
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white font-mono text-center py-0.5 font-bold">
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
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-[var(--accent)] font-mono uppercase tracking-wider">
                  {category?.name || "AI Art"}
                </span>
                {isPack && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E85002]/15 text-[#F16001] font-mono">
                    Prompt Pack Collection
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium text-[var(--text-primary)] tracking-tight">
                {prompt.title}
              </h1>
              {prompt.subtitle && (
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {prompt.subtitle}
                </p>
              )}
            </div>

            {/* Copyable prompt box (Recessed) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  {isPack ? (
                    <span className="text-[#F16001]">
                      Prompt for Image #{activeImageIndex + 1} of {images.length}
                    </span>
                  ) : (
                    "Prompt Formula"
                  )}
                </span>
              </div>

              <div className="rounded-[16px] bg-[var(--surface-recessed)] border border-[var(--border)] p-5 font-mono text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
                <p className="select-all break-words">&ldquo;{activePromptText}&rdquo;</p>

                <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    onClick={handleCopyMain}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-[12px] text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
                        <span>{isPack ? `Copy Image #${activeImageIndex + 1} Prompt` : "Copy Full Prompt"}</span>
                      </>
                    )}
                  </button>

                  {isPack && prompt.packItems && prompt.packItems.length > 1 && (
                    <button
                      onClick={handleCopyAllPackPrompts}
                      className="px-4 py-3 rounded-[12px] bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Copy all prompts in this pack"
                    >
                      <Layers className="w-4 h-4 text-[#E85002]" />
                      <span>Copy All ({prompt.packItems.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Negative prompt */}
            {activeNegativePrompt && (
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
                  {activeNegativePrompt}
                </div>
              </div>
            )}

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

