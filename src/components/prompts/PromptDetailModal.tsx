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
  Sparkles,
  Sliders,
  Maximize2,
  Tag,
  Layers,
  Video,
  Eye,
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!prompt) return null;

  const saved = isSaved(prompt.id);
  const category = categories.find((c) => c.id === prompt.categoryId);

  // Related prompts (same category or shared tags, excluding current)
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
          title: `${prompt.title} - fenz.creates`,
          text: `Check out this AI prompt for ${prompt.model}: "${prompt.title}"`,
          url,
        });
      } catch {
        // User dismissed share dialog
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl rounded-3xl glass-panel bg-[#0d0f17] border border-white/10 shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Sticky Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/5 flex items-center justify-between bg-[#0a0c12]/90 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              {prompt.model}
            </span>
            <span className="text-xs text-slate-400 truncate hidden sm:inline">
              / {category?.name || "AI Art"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSave(prompt.id)}
              className={`p-2 rounded-xl transition-all ${
                saved
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50"
                  : "glass-pill text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title={saved ? "Saved in Favorites" : "Save Prompt"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Share Prompt"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Link
              href={`/prompt/${prompt.slug}`}
              target="_blank"
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:flex"
              title="Open in Full Page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Artwork Showcase */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl group">
                <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square">
                  <Image
                    src={prompt.mediaUrl}
                    alt={prompt.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>

                {/* Media Type pill */}
                {prompt.type === "video" && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-amber-500/90 backdrop-blur-md text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg">
                    <Video className="w-3.5 h-3.5" />
                    Video Prompt
                  </div>
                )}

                {/* Aspect ratio overlay badge */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-slate-300 font-mono text-xs border border-white/10">
                  {prompt.aspectRatio}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Copy className="w-3.5 h-3.5 text-violet-400" />
                  {formatNumber(prompt.copyCount || 0)} times copied
                </span>
                <span>Created {formatDate(prompt.createdAt)}</span>
              </div>
            </div>

            {/* Right Column: Prompt Details & Copy Action */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
                  {category?.name}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {prompt.title}
                </h1>
              </div>

              {/* Main Prompt Text Box with 1-Click Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    AI Prompt Text
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {prompt.promptText.length} chars
                  </span>
                </div>

                <div className="relative group rounded-2xl bg-black/60 border border-violet-500/20 p-4 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
                  <p className="select-all break-words">{prompt.promptText}</p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <button
                      onClick={handleCopyMain}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg ${
                        copied
                          ? "bg-emerald-600 text-white shadow-emerald-950"
                          : "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-950/60 hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-violet-200" />
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
                    <span className="text-xs font-semibold text-red-300/80 uppercase tracking-wider">
                      Negative Prompt (Avoid)
                    </span>
                    <button
                      onClick={handleCopyNegative}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      {copiedNegative ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedNegative ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3 font-mono text-xs text-red-200/90 select-all">
                    {prompt.negativePrompt}
                  </div>
                </div>
              )}

              {/* Technical Parameters Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Parameters & Settings
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Model</div>
                    <div className="font-semibold text-white truncate mt-0.5">
                      {prompt.model}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Aspect Ratio</div>
                    <div className="font-semibold font-mono text-white mt-0.5">
                      {prompt.aspectRatio}
                    </div>
                  </div>

                  {prompt.parameters?.stylize !== undefined && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">Stylize (--s)</div>
                      <div className="font-semibold font-mono text-white mt-0.5">
                        {prompt.parameters.stylize}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.cfgScale !== undefined && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">CFG Scale</div>
                      <div className="font-semibold font-mono text-white mt-0.5">
                        {prompt.parameters.cfgScale}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.seed && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">Seed</div>
                      <div className="font-semibold font-mono text-white truncate mt-0.5">
                        {prompt.parameters.seed}
                      </div>
                    </div>
                  )}

                  {prompt.parameters?.sampler && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">Sampler</div>
                      <div className="font-semibold text-white truncate mt-0.5">
                        {prompt.parameters.sampler}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-violet-400" />
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-violet-600/20 hover:text-violet-300 hover:border-violet-500/30 border border-white/5 text-xs text-slate-300 transition-all cursor-pointer"
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
            <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  More Like This
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedPrompts.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => setActiveModalPrompt(related)}
                    className="group relative rounded-xl overflow-hidden glass-card cursor-pointer border border-white/5 hover:border-violet-500/30 transition-all aspect-[4/3]"
                  >
                    <Image
                      src={related.mediaUrl}
                      alt={related.title}
                      fill
                      sizes="25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[11px] font-semibold text-white truncate drop-shadow">
                        {related.title}
                      </span>
                      <span className="text-[10px] text-violet-300 font-medium">
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
