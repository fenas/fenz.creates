"use client";

import React from "react";
import { SlimIconSidebar } from "@/components/layout/SlimIconSidebar";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { SpotlightHero } from "@/components/prompts/SpotlightHero";
import { SingleSectionCardsLayout } from "@/components/prompts/SingleSectionCardsLayout";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { SubmitPromptModal } from "@/components/prompts/SubmitPromptModal";
import { usePromptStore } from "@/context/PromptContext";

export default function Home() {
  const { activeModalPrompt, setActiveModalPrompt, prompts, activeTab, selectedCategory } =
    usePromptStore();

  const featuredPrompt =
    prompts.find((p) => p.featured && p.status === "published") ||
    prompts[0] ||
    null;

  const showSpotlightHero =
    (activeTab === "home" || activeTab === "discover") &&
    selectedCategory === "all";

  return (
    <div className="min-h-screen room-backdrop bg-[#06070a] text-white flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Permanent Slim Icon-Only Left Sidebar */}
      <SlimIconSidebar />

      {/* Main Content Area — Margin Left Offset to Guarantee Zero Overlap */}
      <main className="flex-1 w-full md:ml-20 md:w-[calc(100%-5rem)] flex flex-col p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 min-w-0">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {/* Top Header */}
          <UnifiedHeader />

          {/* Spotlight Hero Banner on Home */}
          {showSpotlightHero && (
            <div className="mb-6">
              <SpotlightHero featuredPrompt={featuredPrompt} />
            </div>
          )}

          {/* Single Section Cards Layout */}
          <SingleSectionCardsLayout />
        </div>
      </main>

      {/* Interactive Detail Modal Overlay */}
      <PromptDetailModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />

      {/* Community Submit Modal */}
      <SubmitPromptModal />
    </div>
  );
}
