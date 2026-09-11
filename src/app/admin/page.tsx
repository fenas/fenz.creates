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
  BookOpen,
  Clock,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePromptStore } from "@/context/PromptContext";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";
import { PromptManagerTable } from "@/components/admin/PromptManagerTable";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { TutorialManagerTable } from "@/components/admin/TutorialManagerTable";
import { ComingSoonManagerTable } from "@/components/admin/ComingSoonManagerTable";
import { PromptEditorModal } from "@/components/admin/PromptEditorModal";
import { TutorialEditorModal } from "@/components/admin/TutorialEditorModal";
import { ComingSoonEditorModal } from "@/components/admin/ComingSoonEditorModal";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { Prompt, Tutorial, ComingSoonFeature } from "@/types";
import { formatNumber } from "@/lib/utils";

export default function AdminPage() {
  const {
    isAdminAuth,
    adminEmail,
    logoutAdmin,
    prompts,
    categories,
    tutorials,
    comingSoon,
    activeModalPrompt,
    setActiveModalPrompt,
  } = usePromptStore();

  const [activeAdminTab, setActiveAdminTab] = useState<
    "prompts" | "tutorials" | "coming-soon" | "categories"
  >("prompts");

  // Modals state
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);

  const [isTutEditorOpen, setIsTutEditorOpen] = useState(false);
  const [tutToEdit, setTutToEdit] = useState<Tutorial | null>(null);

  const [isFeatEditorOpen, setIsFeatEditorOpen] = useState(false);
  const [featToEdit, setFeatToEdit] = useState<ComingSoonFeature | null>(null);

  // If not authenticated, render login form
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#06070a] text-white">
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Showcase</span>
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

  // Prompt Handlers
  const handleOpenCreatePrompt = () => {
    setPromptToEdit(null);
    setIsPromptEditorOpen(true);
  };

  const handleEditPrompt = (p: Prompt) => {
    setPromptToEdit(p);
    setIsPromptEditorOpen(true);
  };

  // Tutorial Handlers
  const handleOpenCreateTut = () => {
    setTutToEdit(null);
    setIsTutEditorOpen(true);
  };

  const handleEditTut = (t: Tutorial) => {
    setTutToEdit(t);
    setIsTutEditorOpen(true);
  };

  // Coming Soon Handlers
  const handleOpenCreateFeat = () => {
    setFeatToEdit(null);
    setIsFeatEditorOpen(true);
  };

  const handleEditFeat = (f: ComingSoonFeature) => {
    setFeatToEdit(f);
    setIsFeatEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-white pb-24">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 floating-panel bg-[#090b10]/95 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white transition-colors"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center p-1.5 shadow-sm text-white">
                <Logo className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-sm sm:text-base text-white">
                Admin Content Studio
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 hidden sm:inline">
                Verified: {adminEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenCreatePrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Prompt</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-slate-400 hover:text-[#E85002] hover:border-[#E85002]/30 transition-colors"
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
          <div className="p-5 rounded-2xl floating-panel bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Prompts</span>
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalPrompts}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{publishedCount} active</span>
              <span>•</span>
              <span className="text-[#F16001] font-semibold">{draftCount} drafts</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Prompt Copies</span>
              <Copy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(totalCopies)}</div>
            <div className="text-[11px] text-slate-400">
              Visitor clipboard clicks
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Tutorial Guides</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{tutorials.length}</div>
            <div className="text-[11px] text-slate-400">
              Prompt engineering masterclasses
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[#0d0f17] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Roadmap Features</span>
              <Clock className="w-4 h-4 text-[#E85002]" />
            </div>
            <div className="text-2xl font-bold text-white">{comingSoon.length}</div>
            <div className="text-[11px] text-slate-400">
              Coming soon roadmap previews
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveAdminTab("prompts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeAdminTab === "prompts"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[#A7A7A7] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompts Catalog ({prompts.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("tutorials")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeAdminTab === "tutorials"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[#A7A7A7] hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tutorials Studio ({tutorials.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("coming-soon")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeAdminTab === "coming-soon"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[#A7A7A7] hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Coming Soon Roadmap ({comingSoon.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeAdminTab === "categories"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[#A7A7A7] hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeAdminTab === "prompts" && (
          <PromptManagerTable
            onOpenCreate={handleOpenCreatePrompt}
            onEditPrompt={handleEditPrompt}
          />
        )}

        {activeAdminTab === "tutorials" && (
          <TutorialManagerTable
            onOpenCreate={handleOpenCreateTut}
            onEditTutorial={handleEditTut}
          />
        )}

        {activeAdminTab === "coming-soon" && (
          <ComingSoonManagerTable
            onOpenCreate={handleOpenCreateFeat}
            onEditFeature={handleEditFeat}
          />
        )}

        {activeAdminTab === "categories" && <CategoryManager />}
      </main>

      {/* Editor Modals */}
      <PromptEditorModal
        promptToEdit={promptToEdit}
        isOpen={isPromptEditorOpen}
        onClose={() => setIsPromptEditorOpen(false)}
      />

      <TutorialEditorModal
        tutorialToEdit={tutToEdit}
        isOpen={isTutEditorOpen}
        onClose={() => setIsTutEditorOpen(false)}
      />

      <ComingSoonEditorModal
        featureToEdit={featToEdit}
        isOpen={isFeatEditorOpen}
        onClose={() => setIsFeatEditorOpen(false)}
      />

      {/* Prompt Preview Modal */}
      <PromptDetailModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />
    </div>
  );
}
