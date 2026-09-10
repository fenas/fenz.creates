"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Compass,
  Clock,
  Settings,
  Bell,
  ChevronDown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Dices,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { SpotlightHero } from "@/components/prompts/SpotlightHero";
import { PosterPromptCard } from "@/components/prompts/PosterPromptCard";
import { ViewTab } from "@/types";

export function MainDashboard() {
  const {
    prompts,
    filteredPrompts,
    categories,
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
    triggerRandomPrompt,
    setIsSubmitModalOpen,
  } = usePromptStore();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Top featured prompt for Spotlight Hero
  const featuredPrompt =
    prompts.find((p) => p.featured && p.status === "published") ||
    prompts[0] ||
    null;

  // Recommended prompts (excluding spotlight)
  const recommendedPrompts = filteredPrompts.filter(
    (p) => p.id !== featuredPrompt?.id
  );

  const creators = [
    {
      name: "Midjourney v6",
      tag: "Photorealism",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop",
    },
    {
      name: "Flux.1 Pro",
      tag: "Octane & 3D",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120&auto=format&fit=crop",
    },
    {
      name: "SDXL Master",
      tag: "Concept Art",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=120&auto=format&fit=crop",
    },
    {
      name: "Fenas Sharma",
      tag: "@fenz.creates",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=120&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex-1 rounded-[28px] floating-panel bg-[#0d0f17]/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row min-w-0">
      {/* Internal Left Rail (Netflix style sidebar) */}
      <div className="w-full md:w-56 lg:w-60 p-5 md:border-r border-white/5 flex flex-col justify-between flex-shrink-0 bg-[#0a0c12]/60">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => {
                setActiveTab("discover");
                setSelectedCategory("all");
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-950/50">
                F
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                <span className="text-red-500 font-black tracking-wider">FENZ</span>
                <span className="text-slate-200">.CREATES</span>
              </span>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("discover");
                setSelectedCategory("all");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "discover"
                  ? "bg-[#202433] text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Home
                className={`w-4 h-4 ${
                  activeTab === "discover" ? "text-red-500" : "text-slate-400"
                }`}
              />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab("trending")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "trending"
                  ? "bg-[#202433] text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Compass
                className={`w-4 h-4 ${
                  activeTab === "trending" ? "text-red-500" : "text-slate-400"
                }`}
              />
              <span>Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab("new")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                activeTab === "new"
                  ? "bg-[#202433] text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className={`w-4 h-4 ${
                    activeTab === "new" ? "text-red-500" : "text-slate-400"
                  }`}
                />
                <span>Coming soon</span>
              </div>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>
          </nav>

          {/* Section: Who's Watching / AI Models */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Who&apos;s Watching
            </div>

            <div className="space-y-2">
              {creators.map((creator) => (
                <div
                  key={creator.name}
                  onClick={() => triggerRandomPrompt()}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                    {creator.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Rail Action */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Internal Center Content Area */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
        {/* Top Navigation Row inside panel */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Category Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setActiveTab("discover");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "netflix-pill-active"
                  : "netflix-pill text-slate-300"
              }`}
            >
              All Prompts
            </button>

            {categories.slice(0, 4).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab("discover");
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? "netflix-pill-active"
                      : "netflix-pill text-slate-300"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="px-3.5 py-1.5 rounded-full netflix-pill text-xs font-semibold flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-[#141724] border border-white/10 p-2 shadow-2xl z-30 space-y-1 animate-in fade-in duration-150">
                  {categories.slice(4).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Right Profile & Notification Controls */}
          <div className="flex items-center gap-3">
            {/* Surprise me quick button */}
            <button
              onClick={() => triggerRandomPrompt()}
              className="p-2 rounded-full netflix-pill text-amber-400 hover:text-amber-300 transition-colors"
              title="Surprise Me"
            >
              <Dices className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="relative p-2 rounded-full netflix-pill text-slate-300 hover:text-white transition-colors"
              title="Submit Prompt"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
            </button>

            {/* Profile Chip */}
            <Link
              href="/admin"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full netflix-pill group"
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=120&auto=format&fit=crop"
                  alt="Profile"
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-white leading-tight">
                  Fenas Sharma
                </span>
                <span className="text-[9px] text-slate-400 leading-tight">
                  @fenz.creates
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Spotlight Hero Banner */}
        <SpotlightHero featuredPrompt={featuredPrompt} />

        {/* Recommended Prompts Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Recommended Prompts
            </h3>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setActiveTab("discover");
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              See all
            </button>
          </div>

          {/* Horizontal / Grid Poster Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {recommendedPrompts.slice(0, 4).map((p) => (
              <PosterPromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
