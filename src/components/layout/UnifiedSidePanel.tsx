"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Sparkles,
  Clock,
  BookOpen,
  Bookmark,
  PlusCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { ViewTab } from "@/types";

interface UnifiedSidePanelProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function UnifiedSidePanel({
  isCollapsed,
  setIsCollapsed,
}: UnifiedSidePanelProps) {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
    savedPromptIds,
    setIsSubmitModalOpen,
  } = usePromptStore();

  const navItems = [
    {
      id: "home" as ViewTab,
      label: "Home",
      icon: Home,
      badge: null,
    },
    {
      id: "prompts" as ViewTab,
      label: "Prompts",
      icon: Sparkles,
      badge: null,
    },
    {
      id: "coming-soon" as ViewTab,
      label: "Coming soon",
      icon: Clock,
      badge: "3",
      badgeColor: "bg-[#E85002] text-white",
    },
    {
      id: "tutorials" as ViewTab,
      label: "Tutorials",
      icon: BookOpen,
      badge: "NEW",
      badgeColor: "bg-white/10 text-white border border-white/10",
    },
  ];

  const handleNavClick = (tabId: ViewTab) => {
    setActiveTab(tabId);
    if (tabId === "home" || tabId === "prompts") {
      setSelectedCategory("all");
    }
  };

  const isCurrentTab = (id: ViewTab) => {
    if (id === "home" && (activeTab === "home" || activeTab === "discover")) return true;
    if (id === "prompts" && (activeTab === "prompts" || activeTab === "trending" || activeTab === "new")) return true;
    return activeTab === id;
  };

  return (
    <>
      {/* Desktop & Tablet Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 floating-panel bg-[#0b0d14]/95 border-r border-white/10 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="h-18 px-4 flex items-center justify-between border-b border-white/5">
            <Link
              href="/"
              onClick={() => {
                setActiveTab("home");
                setSelectedCategory("all");
              }}
              className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E85002] to-[#F16001] flex items-center justify-center font-black text-white text-base shadow-lg shadow-[#E85002]/40 flex-shrink-0 group-hover:scale-105 transition-transform">
                F
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                    <span className="text-[#E85002] font-black tracking-wider">FENZ</span>
                    <span className="text-[#F9F9F9]">.CREATES</span>
                  </span>
                  <span className="text-[9px] text-[#A7A7A7] uppercase tracking-widest font-semibold">
                    AI Prompt Showcase
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse to Icon Only"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentTab(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group relative ${
                    active
                      ? "bg-[#202433] text-white shadow-md shadow-black/40 border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      active ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {item.badge && !isCollapsed && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed Badge Dot */}
                  {item.badge && isCollapsed && (
                    <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-[#E85002]" />
                  )}
                </button>
              );
            })}

            {/* Saved Tab */}
            <button
              onClick={() => setActiveTab("saved")}
              title="Saved Prompts"
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                activeTab === "saved"
                  ? "bg-[#202433] text-white shadow-md shadow-black/40 border border-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Bookmark
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === "saved" ? "text-white fill-white" : "text-slate-400 group-hover:text-white"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">Saved Formulas</span>
              )}
              {savedPromptIds.length > 0 && !isCollapsed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  {savedPromptIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer info in expanded view */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Catalog Version</span>
              <span className="font-mono text-white">v2.4</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#C10801] via-[#E85002] to-[#F16001] h-full w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400">
              Free to copy and remix prompts for AI creators.
            </p>
          </div>
        )}

        {/* Bottom Actions: Submit & Admin Settings */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            title="Submit Prompt"
            className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white text-xs font-bold shadow-lg shadow-[#E85002]/40 transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Submit Prompt</span>}
          </button>

          <Link
            href="/admin"
            title="Admin Studio Settings"
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
            {!isCollapsed && <span className="truncate">Settings / Studio</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 floating-panel bg-[#0a0c12]/95 border-t border-white/10 px-4 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentTab(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  active ? "text-white font-bold" : "text-slate-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#E85002] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-white rounded-full shadow-sm shadow-white/50" />
                )}
              </button>
            );
          })}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-white"
          >
            <PlusCircle className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] mt-1">Submit</span>
          </button>
        </div>
      </nav>
    </>
  );
}
