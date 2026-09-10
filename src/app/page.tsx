"use client";

import React, { useState } from "react";
import { UnifiedSidePanel } from "@/components/layout/UnifiedSidePanel";
import { UnifiedHeader } from "@/components/layout/UnifiedHeader";
import { SpotlightHero } from "@/components/prompts/SpotlightHero";
import { SingleSectionCardsLayout } from "@/components/prompts/SingleSectionCardsLayout";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { SubmitPromptModal } from "@/components/prompts/SubmitPromptModal";
import { usePromptStore } from "@/context/PromptContext";

export default function Home() {
  const { activeModalPrompt, setActiveModalPrompt, prompts, activeTab, selectedCategory } =
    usePromptStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Top featured prompt for hero spotlight on Home view
  const featuredPrompt =
    prompts.find((p) => p.featured && p.status === "published") ||
    prompts[0] ||
    null;

  const showSpotlightHero =
    (activeTab === "home" || activeTab === "discover") &&
    selectedCategory === "all";

  return (
    <div className="min-h-screen room-backdrop bg-[#06070a] text-white flex relative">
      {/* Single Collapsible Sidebar Panel */}
      <UnifiedSidePanel
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area with Single Section Cards Layout */}
      <div
        className={`flex-1 transition-all duration-300 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8 ${
          isCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {/* Top Header */}
          <UnifiedHeader />

          {/* Optional Spotlight Hero on Home */}
          {showSpotlightHero && (
            <div className="mb-6">
              <SpotlightHero featuredPrompt={featuredPrompt} />
            </div>
          )}

          {/* Single Section Cards Layout */}
          <SingleSectionCardsLayout />
        </div>
      </div>

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
