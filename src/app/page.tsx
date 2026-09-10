"use client";

import React from "react";
import { LeftDock } from "@/components/layout/LeftDock";
import { MainDashboard } from "@/components/layout/MainDashboard";
import { RightCompanionPanel } from "@/components/layout/RightCompanionPanel";
import { PromptDetailModal } from "@/components/prompts/PromptDetailModal";
import { SubmitPromptModal } from "@/components/prompts/SubmitPromptModal";
import { usePromptStore } from "@/context/PromptContext";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  const { activeModalPrompt, setActiveModalPrompt } = usePromptStore();

  return (
    <div className="min-h-screen room-backdrop bg-[#06070a] text-white flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 xl:pl-24 relative overflow-x-hidden">
      {/* Far Left Floating Dock */}
      <LeftDock />

      {/* Main Multi-Panel Floating Container */}
      <div className="w-full max-w-[1600px] flex flex-col lg:flex-row gap-5 xl:gap-6 items-stretch justify-center">
        {/* Center Main Dashboard Panel */}
        <MainDashboard />

        {/* Right Companion Panel */}
        <RightCompanionPanel />
      </div>

      {/* Mobile Bottom Navigation Bar (for small screens) */}
      <div className="block md:hidden">
        <Sidebar />
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
