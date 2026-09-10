"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Sparkles,
  Clock,
  BookOpen,
  Bookmark,
  Settings,
  Images,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { ViewTab } from "@/types";

export function SlimIconSidebar() {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
    savedPromptIds,
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
      id: "coming-soon" as ViewTab,
      label: "Coming soon",
      icon: Clock,
      badge: "3",
    },
    {
      id: "tutorials" as ViewTab,
      label: "Tutorials",
      icon: BookOpen,
      badge: null,
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
      {/* Desktop & Tablet Slim Icon-Only Sidebar */}
      <aside className="hidden md:flex flex-col justify-between items-center fixed top-0 left-0 bottom-0 z-40 w-20 glass-panel bg-[#07090e]/95 border-r border-white/10 py-5">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6 w-full">
          <Link
            href="/"
            onClick={() => {
              setActiveTab("home");
              setSelectedCategory("all");
            }}
            className="group relative flex items-center justify-center focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 flex items-center justify-center p-2 shadow-lg shadow-black/40 group-hover:scale-105 transition-all">
              <Image
                src="/logo.png"
                alt="fenz.creates logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>

            {/* Hover Tooltip matching reference */}
            <div className="absolute left-full ml-3.5 px-3.5 py-1.5 rounded-full bg-[#1c1f2b] text-white text-xs font-semibold shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50">
              fenz.creates
            </div>
          </Link>

          {/* Navigation Icon Buttons */}
          <nav className="flex flex-col items-center gap-2.5 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentTab(item.id);

              return (
                <div key={item.id} className="relative group flex items-center justify-center w-full">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                      active
                        ? "bg-[#202433] text-white shadow-md shadow-black/50 border border-white/10 scale-105"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-red-500" : "text-slate-400 group-hover:text-white"
                      }`}
                    />

                    {/* Notification Badge */}
                    {item.badge && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 shadow-sm shadow-red-500" />
                    )}
                  </button>

                  {/* Hover Popup Tooltip matching reference image */}
                  <div className="absolute left-full ml-3.5 px-4 py-2 rounded-full bg-[#1c1f2b] text-white text-xs font-bold shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50 flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Saved Formulas Button */}
            <div className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => setActiveTab("saved")}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                  activeTab === "saved"
                    ? "bg-[#202433] text-white shadow-md shadow-black/50 border border-white/10 scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === "saved"
                      ? "text-red-500 fill-red-500"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {savedPromptIds.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600" />
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-full ml-3.5 px-4 py-2 rounded-full bg-[#1c1f2b] text-white text-xs font-bold shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50 flex items-center gap-2">
                <span>Saved Formulas</span>
                {savedPromptIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[9px] font-bold">
                    {savedPromptIds.length}
                  </span>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Actions: Admin Settings */}
        <div className="flex flex-col items-center gap-3 w-full px-2 pt-4 border-t border-white/5">
          <div className="relative group flex items-center justify-center w-full">
            <Link
              href="/admin"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Settings className="w-5 h-5 text-slate-400 group-hover:rotate-45 transition-transform" />
            </Link>

            <div className="absolute left-full ml-3.5 px-4 py-2 rounded-full bg-[#1c1f2b] text-white text-xs font-bold shadow-2xl border border-white/10 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50">
              Admin Studio
            </div>
          </div>
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
                  active ? "text-red-500 font-bold" : "text-slate-400"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-red-500 rounded-full shadow-sm shadow-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
