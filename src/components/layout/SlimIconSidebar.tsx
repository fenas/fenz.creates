"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Clock,
  BookOpen,
  Images,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePromptStore } from "@/context/PromptContext";
import { ViewTab } from "@/types";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function SlimIconSidebar() {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
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
      icon: Images,
      badge: null,
    },
    {
      id: "tutorials" as ViewTab,
      label: "Workflows",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "coming-soon" as ViewTab,
      label: "Coming soon",
      icon: Clock,
      badge: "3",
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
      {/* Desktop & Tablet Segmented Capsule Sidebar (Tactile Matte Design) */}
      <aside className="hidden md:flex flex-col justify-between items-center fixed top-4 bottom-4 left-4 z-40 w-16 select-none pointer-events-auto">
        {/* Top Floating Capsule */}
        <div className="w-full rounded-[24px] bg-[var(--surface)] border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] p-1.5 pb-3 flex flex-col items-center justify-between flex-1 max-h-[calc(100vh-140px)] min-h-[380px] transition-all">
          {/* Top Dark Obsidian Island Pill */}
          <div className="w-full bg-[#1C1C1E] dark:bg-[#141414] text-white rounded-[18px] p-2 flex flex-col items-center gap-2.5 shadow-sm border border-black/20 dark:border-white/5">
            {/* Top Logo */}
            <Link
              href="/"
              onClick={() => {
                setActiveTab("home");
                setSelectedCategory("all");
              }}
              className="group relative flex items-center justify-center focus:outline-none p-1 transition-transform hover:scale-105"
              title="Arenae"
            >
              <Logo className="w-5.5 h-5.5 text-white group-hover:text-[var(--accent)] transition-colors duration-200" />

              {/* Hover Tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-[8px] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-medium shadow-md border border-[var(--border)] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50">
                arenae
              </div>
            </Link>

            {/* Subtle Divider */}
            <div className="w-4 h-[1px] bg-white/10 my-0.5" />

            {/* Navigation Icon Buttons Inside Dark Island */}
            <nav className="flex flex-col items-center gap-1.5 w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentTab(item.id);

                return (
                  <div key={item.id} className="relative group flex items-center justify-center w-full">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      aria-label={item.label}
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-150 relative ${
                        active
                          ? "bg-white/15 text-white shadow-sm font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.75]" />

                      {/* Notification Badge */}
                      {item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </button>

                    {/* Hover Popup Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-[8px] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-medium shadow-md border border-[var(--border)] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-[6px] bg-[var(--surface-muted)] text-[var(--text-secondary)] text-[9px] font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Vertical Micro-Typography Watermark */}
          <div className="py-4 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 select-none text-[7px] font-mono tracking-[0.24em] font-medium text-[var(--text-muted)] uppercase opacity-80">
            ARENAE 2026
          </div>
        </div>

        {/* Bottom Floating Capsule (Settings / Theme Selector) */}
        <div className="w-full rounded-[20px] bg-[var(--surface)] border border-[var(--border)] shadow-[0_8px_24px_rgba(0,0,0,0.05)] p-1.5 py-2 flex flex-col items-center justify-between gap-1.5 mt-3 transition-all">
          {/* Vertical Micro-Text */}
          <div className="[writing-mode:vertical-rl] rotate-180 select-none text-[6.5px] font-mono tracking-[0.2em] font-medium text-[var(--text-muted)] uppercase py-0.5 opacity-80">
            THEME
          </div>

          {/* Centered Dark Squircle Theme Selector Button */}
          <ThemeSelector direction="right" variant="dark-squircle" />
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] px-4 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentTab(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-[10px] transition-all relative ${
                  active
                    ? "text-[var(--text-primary)] font-medium bg-[var(--surface-elevated)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="relative">
                  <Icon className="w-4.5 h-4.5 stroke-[1.75]" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-3 h-3 bg-[var(--accent)] text-white text-[7.5px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
                {active && (
                  <span className="absolute bottom-0.5 w-3 h-0.5 bg-[var(--accent)] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
