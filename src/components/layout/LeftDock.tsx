"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Download,
  User,
  Settings,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";

export function LeftDock() {
  const { activeTab, setActiveTab, setSelectedCategory, setIsSubmitModalOpen } =
    usePromptStore();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-center fixed left-6 top-1/2 -translate-y-1/2 z-30">
      <div className="flex flex-col items-center gap-3 p-2.5 rounded-full floating-dock bg-[#12151e]/90 border border-white/10 shadow-2xl py-4">
        {/* Home / Discover Button */}
        <button
          onClick={() => {
            setActiveTab("discover");
            setSelectedCategory("all");
          }}
          title="Home / Discover"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeTab === "discover"
              ? "bg-[#282d3d] text-white shadow-md shadow-black/40 scale-105"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Trending / Downloads Button */}
        <button
          onClick={() => setActiveTab("trending")}
          title="Trending Prompts"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeTab === "trending"
              ? "bg-[#282d3d] text-white shadow-md shadow-black/40 scale-105"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Submit / User Button */}
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          title="Submit Prompt"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
