"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  Video,
  Layers,
  RotateCcw,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Prompt } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { formatNumber, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PromptManagerTableProps {
  onOpenCreate: () => void;
  onEditPrompt: (prompt: Prompt) => void;
}

export function PromptManagerTable({
  onOpenCreate,
  onEditPrompt,
}: PromptManagerTableProps) {
  const {
    prompts,
    categories,
    deletePrompt,
    updatePrompt,
    resetToDefaults,
    setActiveModalPrompt,
    bannerPromptId,
    setBannerPromptId,
  } = usePromptStore();
  const { showToast } = useToast();

  const [tableSearch, setTableSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPrompts = prompts.filter((p) => {
    if (filterCategory !== "all" && p.categoryId !== filterCategory) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (tableSearch.trim() !== "") {
      const q = tableSearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.promptText.toLowerCase().includes(q) ||
        (p.model?.toLowerCase() || "").includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleStatus = (prompt: Prompt) => {
    const nextStatus = prompt.status === "published" ? "draft" : "published";
    updatePrompt(prompt.id, { status: nextStatus });
  };

  const handleToggleFeatured = (prompt: Prompt) => {
    updatePrompt(prompt.id, { featured: !prompt.featured });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePrompt(id);
    }
  };

  const handleCopyLink = async (p: Prompt) => {
    const url = `${window.location.origin}/prompt/${p.slug}`;
    await navigator.clipboard.writeText(url);
    showToast("Prompt Link Copied!", "success", url);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Filter prompts by keyword, model, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="glass-pill text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none"
          >
            <option value="all" className="bg-[#0f1117]">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0f1117]">
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-pill text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none"
          >
            <option value="all" className="bg-[#0f1117]">All Statuses</option>
            <option value="published" className="bg-[#0f1117]">Published Only</option>
            <option value="draft" className="bg-[#0f1117]">Drafts Only</option>
          </select>

          <button
            onClick={resetToDefaults}
            className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white"
            title="Reset catalog to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-accent-gradient text-xs font-semibold ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Prompt</span>
          </button>
        </div>
      </div>

      {/* Prompts Table / Responsive List (Zero Horizontal Scroll) */}
      <div className="rounded-2xl glass-panel bg-[#0c0e15] border border-white/5 overflow-hidden shadow-xl w-full">
        {/* Desktop / Tablet Table View (hidden on small mobile, fits 100% width with no scroll) */}
        <div className="hidden md:block w-full overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[11px] font-semibold text-[#A7A7A7] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4 pr-2">Prompt & Metadata</th>
                <th className="py-3.5 px-2 w-[110px] text-center">Hero Banner</th>
                <th className="py-3.5 px-2 w-[85px] text-center">Status</th>
                <th className="py-3.5 px-2 w-[45px] text-center">Star</th>
                <th className="py-3.5 px-2 w-[55px] text-right hidden lg:table-cell">Copies</th>
                <th className="py-3.5 pl-2 pr-4 w-[150px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#A7A7A7]">
                    No prompts found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId);
                  const isCurrentBanner = bannerPromptId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isCurrentBanner ? "bg-[var(--accent)]/[0.04]" : ""
                      }`}
                    >
                      {/* Prompt & Metadata */}
                      <td className="py-3 pl-4 pr-2">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/prompt/${p.slug}`}
                            target="_blank"
                            className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 hover:border-[var(--accent)]/40 transition-colors"
                          >
                            <Image
                              src={p.mediaUrl}
                              alt={p.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/prompt/${p.slug}`}
                                target="_blank"
                                className="font-semibold text-white truncate hover:text-[var(--accent)] transition-colors text-xs sm:text-sm"
                              >
                                {p.title}
                              </Link>
                              {p.type === "video" && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold border border-red-500/30 flex items-center gap-1 flex-shrink-0">
                                  <Video className="w-2.5 h-2.5" />
                                  <span>VIDEO</span>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-[#A7A7A7] truncate font-mono mt-0.5 max-w-xs sm:max-w-md lg:max-w-lg">
                              {p.promptText}
                            </div>

                            {/* Integrated Metadata Badges */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {category && (
                                <span className="px-2 py-0.2 rounded-md text-[9.5px] font-medium bg-white/5 border border-white/10 text-slate-300">
                                  {category.name}
                                </span>
                              )}
                              {p.model && (
                                <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-mono text-[var(--accent)] bg-[var(--accent-soft)]/40 border border-[var(--accent)]/20">
                                  {p.model}
                                </span>
                              )}
                              {p.aspectRatio && (
                                <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-mono text-slate-400 bg-white/5 border border-white/10">
                                  {p.aspectRatio}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Hero Banner Toggle */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {isCurrentBanner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-sm">
                            <span>🌟 Banner</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setBannerPromptId(p.id)}
                            className="px-2 py-1 rounded-full text-[9.5px] font-medium glass-pill text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all"
                            title="Set as Home Spotlight Hero Banner"
                          >
                            Set Banner
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2 py-1 rounded-full text-[9.5px] font-semibold transition-all ${
                            p.status === "published"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/80"
                          }`}
                        >
                          {p.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                            p.featured
                              ? "text-[var(--accent)] hover:text-[var(--accent-hover)]"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                          title={p.featured ? "Featured Prompt" : "Not Featured"}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${p.featured ? "fill-[var(--accent)]" : ""}`}
                          />
                        </button>
                      </td>

                      {/* Copy Count */}
                      <td className="py-3 px-2 text-right font-mono text-[11px] text-slate-400 hidden lg:table-cell whitespace-nowrap">
                        {formatNumber(p.copyCount || 0)}
                      </td>

                      {/* Action Icons (All 5 always visible side-by-side without scroll) */}
                      <td className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyLink(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-[var(--accent)] transition-colors"
                            title="Copy Sharable Link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/prompt/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Open Live Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setActiveModalPrompt(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Preview Modal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPrompt(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                            title="Edit Prompt"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Prompt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (<768px): Card Row Layout with 0 horizontal scroll & all icons clearly visible */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredPrompts.length === 0 ? (
            <div className="p-6 text-center text-[#A7A7A7] text-xs">
              No prompts found matching your filter criteria.
            </div>
          ) : (
            filteredPrompts.map((p) => {
              const category = categories.find((c) => c.id === p.categoryId);
              const isCurrentBanner = bannerPromptId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-3.5 space-y-3 ${
                    isCurrentBanner ? "bg-[var(--accent)]/[0.04]" : ""
                  }`}
                >
                  {/* Top Row: Thumbnail + Title + Status */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Link
                        href={`/prompt/${p.slug}`}
                        target="_blank"
                        className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0"
                      >
                        <Image
                          src={p.mediaUrl}
                          alt={p.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/prompt/${p.slug}`}
                          target="_blank"
                          className="font-semibold text-white truncate block text-xs hover:text-[var(--accent)]"
                        >
                          {p.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {category && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                              {category.name}
                            </span>
                          )}
                          {p.model && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded text-[var(--accent)] bg-[var(--accent-soft)]/30 border border-[var(--accent)]/20 font-mono">
                              {p.model}
                            </span>
                          )}
                          {p.type === "video" && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                              VIDEO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Star */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          p.status === "published"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30"
                        }`}
                      >
                        {p.status === "published" ? "Pub" : "Draft"}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className="p-1 text-slate-400 hover:text-[var(--accent)]"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            p.featured ? "fill-[var(--accent)] text-[var(--accent)]" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Text Preview */}
                  <p className="text-[11px] text-[#A7A7A7] font-mono line-clamp-1">
                    {p.promptText}
                  </p>

                  {/* Bottom Controls Row: Banner Toggle + All 5 Action Icons */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div>
                      {isCurrentBanner ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                          🌟 Hero Banner
                        </span>
                      ) : (
                        <button
                          onClick={() => setBannerPromptId(p.id)}
                          className="px-2 py-0.5 rounded-full text-[9px] glass-pill text-slate-400 hover:text-[var(--accent)]"
                        >
                          Set as Banner
                        </button>
                      )}
                    </div>

                    {/* All 5 Action Icons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(p)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-[var(--accent)]"
                        title="Copy Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/prompt/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                        title="Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setActiveModalPrompt(p)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                        title="Preview Modal"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditPrompt(p)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-amber-300"
                        title="Edit Prompt"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-slate-400 hover:text-red-400"
                        title="Delete Prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
