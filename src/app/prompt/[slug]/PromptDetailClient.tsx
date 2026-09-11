"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatDate, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function PromptDetailClient({
  initialPrompt,
}: {
  initialPrompt: Prompt;
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
  const prompt = prompts.find((p) => p.slug === initialPrompt.slug) || initialPrompt;
  const [copied, setCopied] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

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
          title: `${prompt.title} - fenz.creates`,
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
    <div className="min-h-screen bg-[#07080b] text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 glass-panel bg-[#090b10]/90 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discovery Gallery</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSave(prompt.id)}
              className={`p-2 rounded-xl transition-all ${
                saved
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900"
                  : "glass-pill text-slate-300 hover:text-white"
              }`}
              title={saved ? "Saved" : "Save Prompt"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Artwork Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
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

              {prompt.type === "video" && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-amber-500/90 backdrop-blur-md text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg">
                  <Video className="w-3.5 h-3.5" />
                  Video Prompt
                </div>
              )}

              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-slate-300 font-mono text-xs border border-white/10">
                {prompt.aspectRatio}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-card text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Copy className="w-3.5 h-3.5 text-violet-400" />
                {formatNumber(prompt.copyCount || 0)} copies
              </span>
              <span>Published {formatDate(prompt.createdAt)}</span>
            </div>
          </div>

          {/* Prompt Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
                {category?.name || "AI Art"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {prompt.title}
              </h1>
            </div>

            {/* Copyable prompt box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Prompt Formula
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {prompt.model}
                </span>
              </div>

              <div className="rounded-2xl bg-black/70 border border-violet-500/30 p-5 font-mono text-sm text-slate-200 leading-relaxed shadow-xl">
                <p className="select-all break-words">&ldquo;{prompt.promptText}&rdquo;</p>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <button
                    onClick={handleCopyMain}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all shadow-xl ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-950/60 hover:scale-[1.01]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
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
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300/80 uppercase">
                  <span>Negative Prompt</span>
                  <button
                    onClick={handleCopyNegative}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedNegative ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNegative ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="rounded-xl bg-amber-950/20 border border-amber-500/20 p-3 font-mono text-xs text-amber-200 select-all">
                  {prompt.negativePrompt}
                </div>
              </div>
            )}

            {/* Technical Parameters */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Technical Settings
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-slate-400">AI Model</div>
                  <div className="font-semibold text-white mt-0.5">{prompt.model}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-slate-400">Aspect Ratio</div>
                  <div className="font-semibold font-mono text-white mt-0.5">{prompt.aspectRatio}</div>
                </div>
                {prompt.parameters?.stylize !== undefined && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Stylize (--s)</div>
                    <div className="font-semibold font-mono text-white mt-0.5">{prompt.parameters.stylize}</div>
                  </div>
                )}
                {prompt.parameters?.cfgScale !== undefined && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">CFG Scale</div>
                    <div className="font-semibold font-mono text-white mt-0.5">{prompt.parameters.cfgScale}</div>
                  </div>
                )}
                {prompt.parameters?.seed && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Seed</div>
                    <div className="font-semibold font-mono text-white mt-0.5">{prompt.parameters.seed}</div>
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
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((t) => (
                  <Link
                    key={t}
                    href="/"
                    onClick={() => {
                      setSearchQuery(t);
                      setActiveTab("discover");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-violet-600/20 hover:text-violet-300 border border-white/5 text-xs text-slate-300 transition-all"
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
          <div className="pt-12 border-t border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Related Prompts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedPrompts.map((related) => (
                <Link
                  key={related.id}
                  href={`/prompt/${related.slug}`}
                  className="group relative rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-violet-500/40 transition-all aspect-[4/3]"
                >
                  <Image
                    src={related.mediaUrl}
                    alt={related.title}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-xs font-semibold text-white truncate drop-shadow">
                      {related.title}
                    </span>
                    <span className="text-[10px] text-violet-300 font-medium">
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
