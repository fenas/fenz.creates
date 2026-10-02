"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Clock,
  BookOpen,
  Images,
  Info,
  Mail,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePromptStore } from "@/context/PromptContext";
import { ViewTab } from "@/types";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { AboutModal } from "@/components/layout/AboutModal";
import { useToast } from "@/components/ui/Toast";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SlimIconSidebar() {
  const {
    activeTab,
    setActiveTab,
    setSelectedCategory,
  } = usePromptStore();

  const { showToast } = useToast();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const email = "contact@aistronaut.in";
  const instagramHandle = "@aistronaut.in";
  const instagramUrl = "https://www.instagram.com/aistronaut.in";

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      showToast("Email copied to clipboard!", "success", email);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      showToast("Failed to copy email", "error");
    }
  };

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
      {/* Desktop & Tablet Segmented Capsule Sidebar */}
      <aside className="hidden md:flex flex-col justify-between items-center fixed top-4 bottom-4 left-4 z-40 w-16 select-none pointer-events-auto">
        {/* Top Floating Capsule */}
        <div className="w-full rounded-[24px] bg-[var(--surface-recessed)] border border-[var(--border)] shadow-[var(--shadow-dock)] p-1.5 pb-3 flex flex-col items-center justify-between flex-1 max-h-[calc(100vh-160px)] min-h-[380px] transition-all">
          {/* Top Navigation Island */}
          <div className="w-full bg-[var(--surface)] text-[var(--text-primary)] rounded-[18px] p-2 flex flex-col items-center gap-2 shadow-[var(--shadow-panel)] border border-[var(--border)]">
            {/* Top Logo */}
            <Link
              href="/"
              onClick={() => {
                setActiveTab("home");
                setSelectedCategory("all");
              }}
              className="group relative flex items-center justify-center focus:outline-none p-0.5 transition-transform hover:scale-105"
              title="Aistronaut"
            >
              <Logo className="w-8 h-8 transition-transform duration-200" />

              {/* Hover Tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-[8px] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-medium shadow-xl border border-[var(--border)] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50">
                Aistronaut
              </div>
            </Link>

            {/* Subtle Divider */}
            <div className="w-4 h-[1px] bg-[var(--border)] my-0.5" />

            {/* Navigation Icon Buttons */}
            <nav className="flex flex-col items-center gap-1.5 w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentTab(item.id);

                return (
                  <div key={item.id} className="relative group flex items-center justify-center w-full">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      aria-label={item.label}
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all duration-150 relative cursor-pointer ${active
                          ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-icon)] shadow-[var(--active-btn-shadow)] border border-[var(--active-btn-border)]"
                          : "text-[var(--icon-secondary)] hover:text-[var(--icon-primary)] hover:bg-[var(--surface-elevated)]"
                        }`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.75]" />

                      {/* Small Coral Accent Indicator */}
                      {active && (
                        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-full bg-[var(--accent)] shadow-[0_0_8px_rgba(255,84,84,0.6)]" />
                      )}

                      {/* Notification Badge */}
                      {item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      )}
                    </button>

                    {/* Hover Popup Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-[8px] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-medium shadow-xl border border-[var(--border)] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 z-50 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-[6px] bg-[var(--surface-recessed)] text-[var(--accent)] text-[9px] font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Vertical Micro-Typography */}
          <div className="py-4 flex items-center justify-center [writing-mode:vertical-rl] rotate-180 select-none text-[7px] font-mono tracking-[0.24em] font-medium text-[var(--text-muted)] uppercase opacity-70">
            AISTRONAUT 2026
          </div>
        </div>

        {/* Bottom Floating Capsule (About & Settings / Theme Selector) */}
        <div className="w-full rounded-[22px] bg-[var(--surface-recessed)] border border-[var(--border)] shadow-[var(--shadow-panel)] p-1.5 py-2.5 flex flex-col items-center justify-between gap-1.5 mt-3 transition-all">
          {/* About / Contact Squircle Button with Popover Flyout */}
          <div className="relative group/about flex items-center justify-center w-full">
            <button
              onClick={() => setIsAboutModalOpen(true)}
              aria-label="About & Contact"
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--icon-secondary)] hover:text-[var(--icon-primary)] hover:bg-[var(--surface-elevated)] transition-all cursor-pointer relative"
              title="About & Contact"
            >
              <Info className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Hover Flyout Popover Card displaying Email & Instagram */}
            <div className="absolute left-full bottom-0 ml-3 w-64 p-3.5 rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md opacity-0 pointer-events-none group-hover/about:opacity-100 group-hover/about:pointer-events-auto transition-all duration-200 z-50 space-y-2.5 -translate-x-2 group-hover/about:translate-x-0 before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">About & Contact</span>
                </div>
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="text-[10px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                >
                  View Details
                </button>
              </div>

              {/* Instagram Quick Link */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-[12px] bg-[var(--surface-recessed)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs transition-all cursor-pointer group/insta hover:border-[var(--accent)]/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[8px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white flex-shrink-0 group-hover/insta:scale-110 transition-transform">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-primary)] group-hover/insta:text-[var(--accent)] font-medium transition-colors">{instagramHandle}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/insta:text-[var(--accent)] transition-colors" />
              </a>

              {/* Email Quick Action */}
              <div className="flex items-center justify-between p-2 rounded-[12px] bg-[var(--surface-recessed)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs transition-all hover:border-[var(--accent)]/40 hover:shadow-sm group/email">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 min-w-0 flex-1 hover:text-[var(--accent)] transition-colors"
                >
                  <div className="w-6 h-6 rounded-[8px] bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover/email:scale-110 transition-transform">
                    <Mail className="w-3.5 h-3.5 stroke-[1.75]" />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)] group-hover/email:text-[var(--text-primary)] truncate transition-colors">{email}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded-[6px] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ml-1"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="w-4 h-[1px] bg-[var(--border)] my-0.5" />

          {/* Theme Selector Squircle Button */}
          <ThemeSelector direction="right" variant="dark-squircle" />
        </div>
      </aside>

      {/* About & Contact Full Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-recessed)] border-t border-[var(--border)] px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentTab(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-[10px] transition-all relative ${active
                    ? "text-[var(--text-primary)] font-medium bg-[var(--surface)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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

          {/* Mobile About Button */}
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-[10px] transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Info className="w-4.5 h-4.5 stroke-[1.75]" />
            <span className="text-[10px] mt-1">About</span>
          </button>
        </div>
      </nav>
    </>
  );
}
