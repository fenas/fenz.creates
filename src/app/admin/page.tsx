"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LogOut,
  Layers,
  Sparkles,
  Copy,
  TrendingUp,
  FileText,
  Plus,
  ArrowLeft,
  Eye,
  Sliders,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";
import { PromptManagerTable } from "@/components/admin/PromptManagerTable";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PromptEditorModal } from "@/components/admin/PromptEditorModal";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { Prompt } from "@/types";
import { formatNumber } from "@/lib/utils";

export default function AdminPage() {
  const {
    isAdminAuth,
    logoutAdmin,
    prompts,
    categories,
    activeModalPrompt,
    setActiveModalPrompt,
  } = usePromptStore();

  const [activeAdminTab, setActiveAdminTab] = useState<"prompts" | "categories">("prompts");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#07080b] text-white">
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Site</span>
          </Link>
        </header>
        <AdminAuthModal />
      </div>
    );
  }

  // Calculate stats
  const totalPrompts = prompts.length;
  const publishedCount = prompts.filter((p) => p.status === "published").length;
  const draftCount = prompts.filter((p) => p.status === "draft").length;
  const totalCopies = prompts.reduce((acc, curr) => acc + (curr.copyCount || 0), 0);
  const mostCopiedPrompt = [...prompts].sort(
    (a, b) => (b.copyCount || 0) - (a.copyCount || 0)
  )[0];

  const handleOpenCreate = () => {
    setPromptToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEditPrompt = (p: Prompt) => {
    setPromptToEdit(p);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white pb-20">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 glass-panel bg-[#090b10]/95 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white transition-colors"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-sm sm:text-base text-white">
                Admin Studio
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30 hidden sm:inline">
                Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/40 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Prompt</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Prompts</span>
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalPrompts}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{publishedCount} active</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{draftCount} drafts</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Prompt Copies</span>
              <Copy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalCopies)}</div>
            <div className="text-[11px] text-slate-400">
              Visitor copy interactions
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Top Copied Prompt</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-white truncate">
              {mostCopiedPrompt?.title || "None yet"}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {formatNumber(mostCopiedPrompt?.copyCount || 0)} copies ({mostCopiedPrompt?.model})
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{categories.length}</div>
            <div className="text-[11px] text-slate-400">
              Taxonomy genres configured
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveAdminTab("prompts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeAdminTab === "prompts"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-950/50"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompt Catalog ({prompts.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeAdminTab === "categories"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-950/50"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Category Manager ({categories.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeAdminTab === "prompts" ? (
          <PromptManagerTable
            onOpenCreate={handleOpenCreate}
            onEditPrompt={handleEditPrompt}
          />
        ) : (
          <CategoryManager />
        )}
      </main>

      {/* Editor Modal */}
      <PromptEditorModal
        promptToEdit={promptToEdit}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />

      {/* Prompt Detail Preview Modal */}
      <PromptDetailModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />
    </div>
  );
}
