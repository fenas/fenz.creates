"use client";

import React, { useState } from "react";
import Image from "next/image";
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
        p.model.toLowerCase().includes(q) ||
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40 hover:scale-105 active:scale-95 transition-all ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Prompt</span>
          </button>
        </div>
      </div>

      {/* Prompts Table / Card List */}
      <div className="rounded-2xl glass-panel bg-[#0c0e15] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[11px] font-semibold text-[#A7A7A7] uppercase tracking-wider">
              <tr>
                <th className="p-4">Prompt & Artwork</th>
                <th className="p-4 hidden md:table-cell">Model / AR</th>
                <th className="p-4 hidden lg:table-cell">Category</th>
                <th className="p-4 text-center">Hero Banner</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center hidden sm:table-cell">Featured</th>
                <th className="p-4 text-right hidden sm:table-cell">Copies</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#A7A7A7]">
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
                        isCurrentBanner ? "bg-[#E85002]/[0.04]" : ""
                      }`}
                    >
                      {/* Prompt & Artwork */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                            <Image
                              src={p.mediaUrl}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="font-semibold text-white truncate flex items-center gap-1.5">
                              <span>{p.title}</span>
                              {p.type === "video" && (
                                <Video className="w-3 h-3 text-[#E85002]" />
                              )}
                            </div>
                            <div className="text-[11px] text-[#A7A7A7] truncate font-mono mt-0.5">
                              {p.promptText}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Model & Aspect Ratio */}
                      <td className="p-4 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-200">{p.model}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[#E85002]/20 text-[#F16001] text-[9px] font-bold border border-[#E85002]/40">
                              {p.aspectRatio}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 hidden lg:table-cell">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                          {category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Hero Banner Toggle */}
                      <td className="p-4 text-center">
                        {isCurrentBanner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E85002]/20 text-[#F16001] border border-[#E85002]/40 shadow-sm shadow-[#E85002]/40">
                            <span>🌟 Active Banner</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setBannerPromptId(p.id)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-medium glass-pill text-slate-400 hover:text-[#F16001] hover:border-[#E85002]/30 transition-all hover:scale-105"
                            title="Set as Home Spotlight Hero Banner"
                          >
                            Set as Banner
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                            p.status === "published"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-[#E85002]/15 text-[#F16001] border border-[#E85002]/30 hover:bg-[#E85002]/25"
                          }`}
                        >
                          {p.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="p-4 text-center hidden sm:table-cell">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.featured
                              ? "text-[#E85002] hover:text-[#F16001]"
                              : "text-slate-400 hover:text-slate-400"
                          }`}
                          title={p.featured ? "Featured" : "Not Featured"}
                        >
                          <Star
                            className={`w-4 h-4 ${p.featured ? "fill-[#E85002]" : ""}`}
                          />
                        </button>
                      </td>

                      {/* Copy Count */}
                      <td className="p-4 text-right font-mono font-medium hidden sm:table-cell">
                        {formatNumber(p.copyCount || 0)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveModalPrompt(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Preview Modal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPrompt(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-300"
                            title="Edit Prompt"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
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
      </div>
    </div>
  );
}
