"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Flame,
  Clock,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { ViewTab } from "@/types";
import { Logo } from "@/components/ui/Logo";

export function Sidebar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const {
    activeTab,
    setActiveTab,
    categories,
    selectedCategory,
    setSelectedCategory,
    setIsSubmitModalOpen,
  } = usePromptStore();

  const handleNavClick = (tab: ViewTab) => {
    setActiveTab(tab);
    if (tab !== "home" && tab !== "prompts" && tab !== "discover") {
      setSelectedCategory("all");
    }
  };

  const navItems = [
    {
      id: "discover" as ViewTab,
      label: "Discover",
      icon: Compass,
      count: null,
    },
    {
      id: "trending" as ViewTab,
      label: "Trending",
      icon: Flame,
      count: null,
      highlight: true,
    },
    {
      id: "new" as ViewTab,
      label: "Recently Added",
      icon: Clock,
      count: null,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 w-16 lg:w-64 glass-panel border-r border-white/5 bg-[#0a0c12]/80 transition-all duration-300">
        {/* Brand Header */}
        <div className="h-18 px-4 lg:px-6 flex items-center justify-between border-b border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={() => {
              setActiveTab("discover");
              setSelectedCategory("all");
            }}
          >
            <Logo className="w-8.5 h-8.5 group-hover:scale-105 transition-all" />
            <div className="hidden lg:flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Aistronaut
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Prompt Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Discover */}
          <div className="space-y-1">
            <div className="hidden lg:block px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Explore
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = !isAdminRoute && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                      ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-950"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                      } ${item.highlight && !isActive ? "text-amber-400/80" : ""}`}
                  />
                  <span className="hidden lg:inline truncate flex-1 text-left">
                    {item.label}
                  </span>
                  {item.count !== null && (
                    <span
                      className={`hidden lg:inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded-full ${isActive
                          ? "bg-violet-500 text-white"
                          : "bg-white/10 text-slate-300"
                        }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Categories list */}
          <div className="hidden lg:block space-y-1 pt-2 border-t border-white/5">
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Categories</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setActiveTab("discover");
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === "all" && activeTab === "discover"
                    ? "text-violet-400 bg-violet-500/10 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
              >
                <span>All Categories</span>
                {selectedCategory === "all" && (
                  <ChevronRight className="w-3 h-3 text-violet-400" />
                )}
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveTab("discover");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                        ? "text-violet-400 bg-violet-500/10 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && (
                      <ChevronRight className="w-3 h-3 text-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Submit prompt button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            title="Submit Prompt"
            className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white font-medium text-xs shadow-lg shadow-[#E85002]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline">Submit Prompt</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Instagram & Phone friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel bg-[#090b10]/90 border-t border-white/10 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !isAdminRoute && activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${isActive ? "text-violet-400 font-semibold" : "text-slate-400"
                  }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.count !== null && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-violet-400 rounded-full shadow-sm shadow-violet-400" />
                )}
              </button>
            );
          })}

          {/* Mobile Submit action */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-violet-300 transition-all"
          >
            <PlusCircle className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] mt-1">Submit</span>
          </button>
        </div>
      </nav>
    </>
  );
}
