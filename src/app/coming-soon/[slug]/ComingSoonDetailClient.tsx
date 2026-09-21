"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Check,
  Clock,
  Rocket,
  Bell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ComingSoonFeature } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

export function ComingSoonDetailClient({
  initialFeature,
  slug,
}: {
  initialFeature?: ComingSoonFeature | null;
  slug: string;
}) {
  const { comingSoon } = usePromptStore();
  const { showToast } = useToast();

  const feature =
    comingSoon.find(
      (f) =>
        f.slug === slug ||
        f.id === slug ||
        (initialFeature && (f.slug === initialFeature.slug || f.id === initialFeature.id))
    ) || initialFeature;

  const [copiedLink, setCopiedLink] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (!feature) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--accent)] shadow-sm">
          <Clock className="w-8 h-8 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-medium mb-2 text-[var(--text-primary)]">Roadmap Feature Not Found</h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mb-6">
          This feature may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="btn-primary px-5 py-2.5 rounded-[12px] text-xs font-medium"
        >
          Return to Discovery
        </Link>
      </div>
    );
  }

  const relatedFeatures = comingSoon
    .filter((f) => f.id !== feature.id)
    .slice(0, 3);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${feature.title} - Arenae Roadmap`,
          text: `Check out upcoming feature "${feature.title}" launching in ${feature.eta} on Arenae!`,
          url,
        });
      } catch {
        // Dismissed
      }
    } else {
      if (url) {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        showToast("Feature Link Copied!", "success", url);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    setSubscribed(true);
    showToast("You're on the early access VIP list!", "success", email);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pb-24 transition-colors duration-200">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface-elevated)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--border-strong)] transition-all">
              <ArrowLeft className="w-4 h-4 text-[var(--accent)] group-hover:-translate-x-0.5 transition-transform stroke-[1.75]" />
            </div>
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all text-xs font-medium cursor-pointer"
              title="Share this upcoming feature"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Share Feature</span>
                </>
              )}
            </button>

            {/* Theme Selector */}
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header Hero */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-[7px] text-xs font-medium bg-[var(--accent)] text-white shadow-sm font-mono">
              {feature.badge}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[7px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] font-mono">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
              Target Release: {feature.eta}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[7px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] font-mono">
              <Rocket className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
              Roadmap Item
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-medium text-[var(--text-primary)] tracking-tight leading-tight">
              {feature.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[22px] overflow-hidden bg-[#141619] border border-[var(--border)] shadow-[var(--shadow-panel)]">
            <Image
              src={feature.mediaUrl}
              alt={feature.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="px-3 py-1 rounded-[7px] bg-[#141619]/80 border border-white/10 text-xs font-mono text-white/90">
                Interactive Preview Concept
              </span>
              <span className="px-2.5 py-1 rounded-[7px] bg-[#141619]/80 border border-white/10 text-white/80 font-mono text-[11px]">
                {feature.eta}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.75]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] tracking-tight">
              Key Capabilities & Innovations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {feature.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all flex items-start gap-3 shadow-[var(--shadow-card)]"
              >
                <div className="w-6 h-6 rounded-[6px] bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <span className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* VIP Early Access & Notification Card */}
        <section className="rounded-[22px] bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 space-y-6 shadow-[var(--shadow-panel)] relative overflow-hidden">
          <div className="max-w-xl space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[7px] bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)] text-xs font-mono font-medium">
              <Bell className="w-3 h-3 stroke-[1.75]" />
              <span>Early Beta Access</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
              Be First in Line When This Launches
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Get an instant email invite with developer preview credits the moment {feature.title} goes live.
            </p>
          </div>

          {subscribed ? (
            <div className="p-4 rounded-[12px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center gap-3 text-xs sm:text-sm text-[var(--text-primary)] font-medium relative z-10">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)] flex-shrink-0 stroke-[1.75]" />
              <span>🎉 You are on the priority waitlist! We will notify you at {email}.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-[12px] bg-[var(--surface-recessed)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all"
                required
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 rounded-[12px] text-xs sm:text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
              >
                <span>Notify Me</span>
                <ArrowRight className="w-4 h-4 stroke-[1.75]" />
              </button>
            </form>
          )}
        </section>

        {/* Related Features */}
        {relatedFeatures.length > 0 && (
          <section className="space-y-5 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                Other Upcoming Roadmap Features
              </h3>
              <Link
                href="/"
                className="text-xs text-[var(--accent)] hover:opacity-90 font-medium flex items-center gap-1 cursor-pointer font-mono"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedFeatures.map((f) => (
                <Link
                  key={f.id}
                  href={`/coming-soon/${f.slug}`}
                  className="rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-4 space-y-3 hover:border-[var(--border-strong)] transition-all group flex flex-col justify-between shadow-[var(--shadow-card)] cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-28 rounded-[12px] overflow-hidden bg-[#141619] border border-[var(--border)]">
                      <Image
                        src={f.mediaUrl}
                        alt={f.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--accent)] font-medium">
                        {f.badge}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        ETA: {f.eta}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                      {f.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

