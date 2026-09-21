"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  Copy,
  Check,
  Flame,
  X,
  History,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { Prompt } from "@/types";
import { formatNumber } from "@/lib/utils";

export function RightCompanionPanel() {
  const {
    prompts,
    searchQuery,
    setSearchQuery,
    copyPrompt,
    setActiveModalPrompt,
    sortBy,
    setSortBy,
  } = usePromptStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Top trending prompts
  const trendingPrompts = [...prompts]
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0))
    .slice(0, 2);

  // Recently added or saved prompts
  const recentPrompts = [...prompts]
    .filter((p) => p.status === "published")
    .slice(2, 6);

  const handleCopy = async (e: React.MouseEvent, prompt: Prompt) => {
    e.stopPropagation();
    setCopiedId(prompt.id);
    await copyPrompt(prompt);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-88 flex-shrink-0 flex flex-col gap-4">
      {/* Floating Card Container */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-panel)] space-y-5">
        {/* Top Search Input (Recessed) */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints..."
            className="w-full pl-10 pr-9 py-2.5 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] text-xs font-normal text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          )}
        </div>

        {/* Section 1: Trending Now */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Flame className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
              Trending Blueprints
            </span>
            <div className="flex items-center gap-1 text-[10.5px] text-[var(--text-secondary)] font-mono">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[var(--text-primary)] cursor-pointer focus:outline-none font-mono"
              >
                <option value="trending" className="bg-[var(--surface-elevated)]">Today</option>
                <option value="newest" className="bg-[var(--surface-elevated)]">Newest</option>
                <option value="most-copied" className="bg-[var(--surface-elevated)]">All Time</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-[var(--icon-secondary)]" />
            </div>
          </div>

          {/* Stacks */}
          <div className="space-y-2">
            {trendingPrompts.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <Link
                  key={p.id}
                  href={`/prompt/${p.slug}`}
                  className="group relative rounded-[14px] overflow-hidden bg-[var(--surface-muted)] border border-[var(--border)] p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-[var(--border-strong)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all shadow-sm block"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[9px] font-mono text-[var(--accent)] uppercase font-semibold">
                      {p.model}
                    </span>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate font-mono">
                      {p.promptText}
                    </p>
                  </div>

                  <div className="relative w-14 h-14 rounded-[10px] overflow-hidden bg-[#0A0C0E] flex-shrink-0 border border-[var(--border)]">
                    <Image
                      src={p.mediaUrl}
                      alt={p.title}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-[1.03] transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Circular Copy Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCopy(e, p);
                      }}
                      className={`absolute inset-0 m-auto w-6 h-6 rounded-[7px] flex items-center justify-center transition-all cursor-pointer ${
                        isCopied
                          ? "bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(255,84,84,0.5)]"
                          : "bg-[#0A0C0E]/90 text-white hover:bg-[var(--accent)] hover:text-white border border-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                      }`}
                      title="Copy Prompt"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 stroke-[2]" />
                      ) : (
                        <Copy className="w-3 h-3 stroke-[1.75]" />
                      )}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Quick Formulas */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <History className="w-3.5 h-3.5 text-[var(--icon-secondary)] stroke-[1.75]" />
              Quick Formulas
            </span>
          </div>

          <div className="space-y-1.5">
            {recentPrompts.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <Link
                  key={p.id}
                  href={`/prompt/${p.slug}`}
                  className="group flex items-center justify-between gap-3 p-2 rounded-[10px] hover:bg-[var(--surface-muted)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-[8px] overflow-hidden bg-[#0A0C0E] flex-shrink-0 border border-[var(--border)]">
                      <Image
                        src={p.mediaUrl}
                        alt={p.title}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[9.5px] text-[var(--text-muted)] font-mono truncate">
                        {p.model} • {formatNumber(p.copyCount || 0)} copies
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopy(e, p);
                    }}
                    className={`w-6 h-6 rounded-[7px] flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                      isCopied
                        ? "bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(255,84,84,0.4)]"
                        : "bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm"
                    }`}
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 stroke-[2]" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 stroke-[1.75]" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
