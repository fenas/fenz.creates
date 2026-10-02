"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Heart,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
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

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { showToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[28px] bg-[var(--surface)] border border-[var(--border)] shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-[var(--accent)]/15 blur-[60px] rounded-full pointer-events-none" />

        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[14px] bg-[var(--surface-recessed)] border border-[var(--border)] shadow-sm">
              <Logo className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                About & Contact
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Aistronaut • AI Prompt Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[12px] bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Bio / Mission statement */}
          <div className="p-4 rounded-[18px] bg-[var(--surface-recessed)] border border-[var(--border)]">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Curating cutting-edge AI prompt blueprints, photorealistic visual styles, and generative AI media workflows for creators, designers, and prompt engineers.
            </p>
          </div>

          {/* Social & Contact Channels */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
              Connect & Inquiries
            </div>

            {/* Instagram Card */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  <InstagramIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                    Instagram
                  </span>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {instagramHandle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[var(--surface-elevated)] group-hover:bg-[var(--accent)] group-hover:text-white border border-[var(--border)] group-hover:border-transparent text-xs font-medium text-[var(--text-primary)] transition-all">
                <span>Follow</span>
                <ExternalLink className="w-3 h-3 stroke-[2]" />
              </div>
            </a>

            {/* Email Card */}
            <div className="group flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--surface-recessed)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all shadow-sm">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="w-10 h-10 rounded-[12px] bg-blue-500/15 border border-blue-500/30 text-blue-500 flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Official Email
                  </span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] truncate">
                    {email}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[var(--surface-elevated)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] hover:border-transparent text-xs font-medium text-[var(--text-primary)] transition-all cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.2] text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[var(--surface-recessed)] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>© 2026 Aistronaut</span>
          <span className="font-mono">v2.4.0</span>
        </div>
      </div>
    </div>
  );
}
