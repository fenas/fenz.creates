"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Code2,
  Zap,
  Quote,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { ArticleBlock } from "@/types/blocks";
import { useToast } from "@/components/ui/Toast";
import { renderFormattedContent } from "@/lib/inlineParser";
import confetti from "canvas-confetti";

interface StructuredArticleRendererProps {
  blocks: ArticleBlock[];
}

export function StructuredArticleRenderer({ blocks }: StructuredArticleRendererProps) {
  const { showToast } = useToast();
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const handleCopyPrompt = async (block: ArticleBlock) => {
    if (!block.promptText) return;
    try {
      await navigator.clipboard.writeText(block.promptText);
      setCopiedBlockId(block.id);
      showToast("Formula Copied!", "success", block.promptTitle || "Prompt Formula");

      // Celebrate
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#E85002", "#F16001", "#ffffff"],
      });

      setTimeout(() => setCopiedBlockId(null), 2500);
    } catch {
      showToast("Failed to copy formula", "error");
    }
  };

  const handleCopyCode = async (block: ArticleBlock) => {
    if (!block.content) return;
    try {
      await navigator.clipboard.writeText(block.content);
      setCopiedBlockId(block.id);
      showToast("Code Copied!", "success");
      setTimeout(() => setCopiedBlockId(null), 2000);
    } catch {
      showToast("Failed to copy code", "error");
    }
  };

  return (
    <article className="w-full space-y-6 text-[var(--text-primary)] leading-relaxed">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            if (!block.content?.trim()) return null;
            return (
              <p
                key={block.id}
                className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-normal whitespace-pre-line"
              >
                {renderFormattedContent(block.content)}
              </p>
            );

          case "heading":
            return (
              <h2
                key={block.id}
                className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight pt-6 pb-1 border-b border-[var(--border-glass)]"
              >
                {renderFormattedContent(block.content)}
              </h2>
            );

          case "subheading":
            return (
              <h3
                key={block.id}
                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight pt-4"
              >
                {renderFormattedContent(block.content)}
              </h3>
            );

          case "quote":
            return (
              <blockquote
                key={block.id}
                className="my-6 rounded-r-3xl border-l-4 border-[#E85002] bg-[#E85002]/[0.08] px-6 py-4 text-base sm:text-lg italic text-[var(--text-primary)]"
              >
                &ldquo;{renderFormattedContent(block.content)}&rdquo;
              </blockquote>
            );

          case "bulleted-list":
            return (
              <ul key={block.id} className="space-y-2.5 my-4 pl-2">
                {(block.items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full bg-[#E85002] flex-shrink-0 mt-2 shadow-sm shadow-[#E85002]/50" />
                    <span>{renderFormattedContent(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case "numbered-list":
            return (
              <ol key={block.id} className="space-y-3 my-4 pl-2">
                {(block.items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-[var(--text-secondary)]">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-mono font-bold text-[#E85002] flex-shrink-0 mt-0.5 shadow-sm">
                      {i + 1}
                    </span>
                    <span className="flex-1">{renderFormattedContent(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case "image":
            if (!block.url) return null;
            return (
              <figure key={block.id} className="my-8 space-y-2">
                <div
                  className={`relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-[var(--border-glass)] shadow-2xl ${
                    block.size === "wide"
                      ? "aspect-[16/9] w-full"
                      : block.size === "full"
                        ? "aspect-[21/9] w-full"
                        : "aspect-[16/10] max-w-2xl mx-auto"
                  }`}
                >
                  <Image
                    src={block.url}
                    alt={block.alt || block.caption || "Illustration"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover"
                    unoptimized={block.url.startsWith("data:")}
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-[var(--text-secondary)] font-medium">
                    {renderFormattedContent(block.caption)}
                  </figcaption>
                )}
              </figure>
            );

          case "video":
            if (!block.embedUrl) return null;
            return (
              <figure key={block.id} className="my-8 space-y-2">
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 border border-[var(--border-glass)] shadow-2xl">
                  <iframe
                    src={block.embedUrl}
                    title={block.caption || "Video player"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-[var(--text-secondary)] font-medium">
                    {renderFormattedContent(block.caption)}
                  </figcaption>
                )}
              </figure>
            );

          case "prompt":
            return (
              <div
                key={block.id}
                className="my-8 rounded-3xl border border-[#E85002]/35 bg-[var(--bg-surface)] p-6 shadow-2xl space-y-4 relative overflow-hidden group"
              >
                {/* Glow accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#E85002]/15 blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--border-glass)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#E85002] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-[#E85002]/40 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>AISTRONAUT FORMULA</span>
                    </span>
                    {block.promptTitle && (
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {block.promptTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {block.promptModel && (
                      <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-secondary)]">
                        {block.promptModel}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(block)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                        copiedBlockId === block.id
                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                          : "bg-gradient-to-r from-[#E85002] to-[#F16001] text-white hover:opacity-95 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {copiedBlockId === block.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Formula!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>Copy Formula</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Formula Text */}
                <div className="rounded-2xl bg-[var(--bg-base)] border border-[var(--border-glass)] p-4 font-mono text-sm leading-relaxed text-[var(--text-primary)] select-all whitespace-pre-wrap">
                  {block.promptText}
                </div>

                {/* Parameters Pill Row */}
                {block.promptAspectRatio && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-glass)]">
                      --ar {block.promptAspectRatio}
                    </span>
                    {block.promptModel && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-glass)]">
                        {block.promptModel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );

          case "callout":
            return (
              <div
                key={block.id}
                className={`my-6 rounded-3xl p-5 sm:p-6 border space-y-2 shadow-xl ${
                  block.calloutVariant === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-200"
                    : block.calloutVariant === "important"
                      ? "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-200"
                      : block.calloutVariant === "note"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-500 dark:text-blue-200"
                        : "bg-[#E85002]/10 border-[#E85002]/30 text-[#E85002]"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide uppercase">
                  <Zap className="w-4 h-4 text-inherit" />
                  <span>{block.calloutTitle || "PRO TIP"}</span>
                </div>
                <div className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-line font-normal">
                  {renderFormattedContent(block.content)}
                </div>
              </div>
            );

          case "code":
            return (
              <div
                key={block.id}
                className="my-6 rounded-3xl border border-[var(--border-glass)] bg-[#0d1117] dark:bg-[#06080e] p-5 shadow-2xl space-y-3 overflow-hidden text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Code2 className="w-3.5 h-3.5 text-[#E85002]" />
                    <span>{block.language || "code"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(block)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 hover:text-white transition-colors"
                  >
                    {copiedBlockId === block.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedBlockId === block.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <pre className="overflow-x-auto text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed">
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case "divider":
            return (
              <div key={block.id} className="py-8 flex items-center justify-center">
                <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[var(--border-glass)] to-transparent rounded-full" />
              </div>
            );

          case "button":
            return (
              <div key={block.id} className="my-6 flex items-center justify-center">
                <Link
                  href={block.buttonUrl || "#"}
                  target={block.buttonUrl?.startsWith("http") ? "_blank" : undefined}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#E85002] to-[#F16001] text-white font-bold text-sm shadow-xl shadow-[#E85002]/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>{block.buttonText || "Learn More"}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}

