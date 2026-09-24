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
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export default function AdminPage() {
  const {
    isAdminAuth,
    adminEmail,
    adminRole,
    adminProfile,
    isDatabaseConnected,
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
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
        <header className="px-6 py-4 border-b border-[var(--border-glass)] flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="w-4 h-4 text-[#E85002]" />
            <span>Back to Public Showcase</span>
          </Link>

          <ThemeSelector />
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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-24 transition-colors duration-200">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-30 floating-panel bg-[var(--bg-surface)]/95 border-b border-[var(--border-glass)] backdrop-blur-xl">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4 text-[#E85002]" />
            </Link>

            <div className="flex items-center gap-2.5">
              <Logo className="w-8.5 h-8.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                    Admin Content Studio
                  </span>
                  {/* Database Live status badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${isDatabaseConnected
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDatabaseConnected ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                    />
                    <span className="hidden sm:inline">
                      {isDatabaseConnected ? "Supabase Live" : "Local Mode"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User & Role pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs">
              <span className="text-[var(--text-secondary)] truncate max-w-[140px]">
                {adminProfile?.displayName || adminEmail}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${adminRole === "super_admin"
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                    : "bg-cyan-500/20 text-cyan-500 border border-cyan-500/30"
                  }`}
              >
                {adminRole === "super_admin" ? "👑 Super Admin" : "🛡️ Admin"}
              </span>
            </div>

            <button
              onClick={handleOpenCreatePrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Prompt</span>
            </button>

            {/* Theme Toggle */}
            <ThemeSelector />

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-semibold text-[var(--text-secondary)] hover:text-[#E85002] hover:border-[#E85002]/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl floating-panel bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium">
              <span>Total Prompts</span>
              <FileText className="w-4 h-4 text-[#E85002]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{totalPrompts}</div>
            <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-emerald-500 font-semibold">{publishedCount} active</span>
              <span>•</span>
              <span className="text-[#E85002] font-semibold">{draftCount} drafts</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium">
              <span>Total Prompt Copies</span>
              <Copy className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{formatNumber(totalCopies)}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Visitor clipboard clicks
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium">
              <span>Tutorial Guides</span>
              <BookOpen className="w-4 h-4 text-[#E85002]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{tutorials.length}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Prompt engineering masterclasses
            </div>
          </div>

          <div className="p-5 rounded-2xl floating-panel bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-medium">
              <span>Roadmap Features</span>
              <Clock className="w-4 h-4 text-[#E85002]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{comingSoon.length}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Coming soon roadmap previews
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-glass)] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveAdminTab("prompts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeAdminTab === "prompts"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompts Catalog ({prompts.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("tutorials")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeAdminTab === "tutorials"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tutorials Studio ({tutorials.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("coming-soon")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeAdminTab === "coming-soon"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Coming Soon Roadmap ({comingSoon.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("categories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeAdminTab === "categories"
                ? "bg-[#E85002] text-white shadow-lg shadow-[#E85002]/40"
                : "glass-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

