"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Copy,
  Check,
  Bookmark,
  Share2,
  ExternalLink,
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

interface PromptDetailModalProps {
  prompt: Prompt | null;
  onClose: () => void;
}

export function PromptDetailModal({ prompt, onClose }: PromptDetailModalProps) {
  const { copyPrompt, toggleSave, isSaved, setSearchQuery, categories, prompts, setActiveModalPrompt } =
    usePromptStore();
  const { showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images =
    prompt?.mediaUrls && prompt.mediaUrls.length > 0
      ? prompt.mediaUrls
      : prompt?.mediaUrl
      ? [prompt.mediaUrl]
      : [];

  // Reset image index when prompt changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [prompt?.id]);

  // Keyboard navigation for Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, images.length]);

  if (!prompt) return null;

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
    const url = `${window.location.origin}/prompt/${prompt.slug}`;
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

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/75 animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl rounded-[22px] bg-[var(--surface-elevated)] border border-[var(--border)] z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col shadow-[var(--shadow-modal)]">
        {/* Top Sticky Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)] z-20">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <span className="px-2.5 py-1 rounded-[8px] text-[11px] font-mono bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1.5 flex-shrink-0">
              {prompt.model}
            </span>
            <span className="text-xs text-[var(--text-secondary)] truncate hidden sm:inline">
              / {category?.name || "AI Art"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleSave(prompt.id)}
              className={`p-2 rounded-[10px] transition-all border cursor-pointer ${
                saved
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_8px_rgba(232,92,92,0.3)]"
                  : "bg-[var(--surface-muted)] hover:bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title={saved ? "Saved in Favorites" : "Save Prompt"}
            >
              <Bookmark className={`w-4 h-4 stroke-[1.75] ${saved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Share Prompt"
            >
              <Share2 className="w-4 h-4 stroke-[1.75]" />
            </button>

            <Link
              href={`/prompt/${prompt.slug}`}
              target="_blank"
              className="p-2 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:flex cursor-pointer"
              title="Open in Full Page"
            >
              <ExternalLink className="w-4 h-4 stroke-[1.75]" />
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Artwork Showcase */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative rounded-[16px] overflow-hidden bg-[#141619] border border-[var(--border)] shadow-[var(--shadow-card)] group">
                <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square">
                  <Image
                    src={currentImageUrl}
                    alt={`${prompt.title} - Image ${activeImageIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-all duration-300"
                    unoptimized={currentImageUrl.startsWith("data:")}
                    priority
                  />
                </div>

                {/* Media Type pill */}
                {prompt.type === "video" && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[6px] bg-[#141619]/80 text-white text-[10px] font-mono flex items-center gap-1.5 border border-white/10 z-20">
                    <Video className="w-3.5 h-3.5" />
                    Video Prompt
                  </div>
                )}

                {/* Image Counter Badge */}
                {images.length > 1 && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-[6px] bg-[#141619]/85 border border-white/15 text-white font-mono text-xs z-20 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-white/80" />
                    <span>{activeImageIndex + 1} / {images.length}</span>
                  </div>
                )}

                {/* Navigation Arrows for Multiple Images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] bg-[#1D2024]/90 hover:bg-[#25292E] text-white flex items-center justify-center border border-white/15 transition-all z-20 cursor-pointer"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] bg-[#1D2024]/90 hover:bg-[#25292E] text-white flex items-center justify-center border border-white/15 transition-all z-20 cursor-pointer"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Aspect ratio overlay badge */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[6px] bg-[#141619]/80 text-white font-mono text-[10px] border border-white/10 z-20">
                  {prompt.aspectRatio}
                </div>
              </div>

              {/* Multiple Images Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 border transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                          : "border-[var(--border)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={img.startsWith("data:")}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8.5px] text-white font-mono text-center py-0.5">
                        {idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Stats Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                  <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                  {formatNumber(prompt.copyCount || 0)} times copied
                </span>
                <span className="font-mono text-[11px]">Created {formatDate(prompt.createdAt)}</span>
              </div>
            </div>

            {/* Right Column: Prompt Details & Copy Action */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-1 font-medium">
                  {category?.name}
                </div>
                <h1 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                  {prompt.title}
                </h1>
              </div>

              {/* Main Prompt Text Box with 1-Click Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                    Prompt Formula
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {prompt.promptText.length} chars
                  </span>
                </div>

                <div className="relative group rounded-[14px] bg-[var(--surface-recessed)] border border-[var(--border)] p-4 font-mono text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]">
                  <p className="select-all break-words">&ldquo;{prompt.promptText}&rdquo;</p>

                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    <button
                      onClick={handleCopyMain}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        copied
                          ? "bg-[var(--accent)] text-white shadow-[0_2px_10px_rgba(232,92,92,0.35)]"
                          : "btn-primary"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 stroke-[2]" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 stroke-[1.75]" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Negative Prompt (if available) */}
              {prompt.negativePrompt && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider font-mono">
                      Negative Parameters (Avoid)
                    </span>
                    <button
                      onClick={handleCopyNegative}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedNegative ? (
                        <Check className="w-3 h-3 text-[var(--accent)] stroke-[2]" />
                      ) : (
                        <Copy className="w-3 h-3 stroke-[1.75]" />
                      )}
                      <span>{copiedNegative ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="rounded-[10px] bg-[var(--surface-recessed)] border border-[var(--border)] p-3 font-mono text-xs text-[var(--text-secondary)] select-all shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.25)]">
                    {prompt.negativePrompt}
                  </div>
                </div>
              )}

              {/* Technical Parameters Grid */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 stroke-[1.75]" />
                  Technical Blueprint
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Model</div>
                    <div className="font-mono text-[var(--text-primary)] truncate mt-0.5">
                      {prompt.model}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Aspect Ratio</div>
                    <div className="font-mono text-[var(--text-primary)] mt-0.5">
                      {prompt.aspectRatio}
                    </div>
                  </div>

                  {prompt.parameters?.stylize !== undefined && (
                    <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Stylize (--s)</div>
                      <div className="font-mono text-[var(--text-primary)] mt-0.5">
                        {prompt.parameters.stylize}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.cfgScale !== undefined && (
                    <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-muted)]">CFG Scale</div>
                      <div className="font-mono text-[var(--text-primary)] mt-0.5">
                        {prompt.parameters.cfgScale}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.seed && (
                    <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Seed</div>
                      <div className="font-mono text-[var(--text-primary)] truncate mt-0.5">
                        {prompt.parameters.seed}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.sampler && (
                    <div className="p-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-muted)]">Sampler</div>
                      <div className="font-mono text-[var(--text-primary)] truncate mt-0.5">
                        {prompt.parameters.sampler}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 stroke-[1.75]" />
                  Style Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] transition-all cursor-pointer font-mono"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Prompts Row */}
          {relatedPrompts.length > 0 && (
            <div className="pt-8 border-t border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Layers className="w-4 h-4 stroke-[1.75]" />
                  More Like This
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedPrompts.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => setActiveModalPrompt(related)}
                    className="group relative rounded-[14px] overflow-hidden bg-[var(--surface-muted)] cursor-pointer border border-[var(--border)] hover:border-[var(--border-strong)] transition-all aspect-[4/3]"
                  >
                    <Image
                      src={related.mediaUrl}
                      alt={related.title}
                      fill
                      sizes="25vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[11px] font-medium text-white truncate">
                        {related.title}
                      </span>
                      <span className="text-[9.5px] font-mono text-white/80">
                        {related.model}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
