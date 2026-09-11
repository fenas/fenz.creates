"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Check,
  Clock,
  Sparkles,
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

export function ComingSoonDetailClient({
  initialFeature,
}: {
  initialFeature: ComingSoonFeature;
}) {
  const { comingSoon } = usePromptStore();
  const { showToast } = useToast();

  const feature =
    comingSoon.find((f) => f.slug === initialFeature.slug || f.id === initialFeature.id) ||
    initialFeature;

  const [copiedLink, setCopiedLink] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const relatedFeatures = comingSoon
    .filter((f) => f.id !== feature.id)
    .slice(0, 3);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${feature.title} - fenz.creates Roadmap`,
          text: `Check out upcoming feature "${feature.title}" launching in ${feature.eta} on fenz.creates!`,
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
    <div className="min-h-screen bg-[#07080b] text-[#F9F9F9] selection:bg-[#E85002] selection:text-white pb-24">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#090b10]/90 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#A7A7A7] hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#E85002]/40 group-hover:bg-[#E85002]/10 transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-[#E85002] group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Discovery</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E85002]/15 border border-[#E85002]/30 text-[#F16001] hover:bg-[#E85002] hover:text-white transition-all text-xs font-bold shadow-lg"
              title="Share this upcoming feature"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Feature</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header Hero */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#E85002] text-white shadow-md">
              {feature.badge}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#E85002]" />
              Target Release: {feature.eta}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85002]/10 border border-[#E85002]/20 text-xs font-semibold text-[#F16001]">
              <Rocket className="w-3.5 h-3.5" />
              Roadmap Item
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {feature.title}
            </h1>
            <p className="text-sm sm:text-base text-[#A7A7A7] leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-[#11131a] border border-white/10 shadow-2xl">
            <Image
              src={feature.mediaUrl}
              alt={feature.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
              <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#F9F9F9]">
                Interactive Preview Concept
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E85002]/90 text-white font-bold text-[11px]">
                {feature.eta}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E85002]/20 border border-[#E85002]/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#E85002]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Key Capabilities & Innovations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {feature.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-[#E85002]/40 transition-all flex items-start gap-3 shadow-lg"
              >
                <div className="w-6 h-6 rounded-lg bg-[#E85002]/15 border border-[#E85002]/30 text-[#E85002] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* VIP Early Access & Notification Card */}
        <section className="rounded-3xl bg-gradient-to-br from-[#120d0a] via-[#0e1017] to-[#0a0c12] border border-[#E85002]/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E85002]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85002]/20 border border-[#E85002]/30 text-[#F16001] text-xs font-bold">
              <Bell className="w-3 h-3" />
              <span>Early Beta Access</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Be First in Line When This Launches
            </h3>
            <p className="text-xs sm:text-sm text-[#A7A7A7] leading-relaxed">
              Get an instant email invite with developer preview credits the moment {feature.title} goes live.
            </p>
          </div>

          {subscribed ? (
            <div className="p-4 rounded-2xl bg-[#E85002]/15 border border-[#E85002]/30 flex items-center gap-3 text-xs sm:text-sm text-[#F9F9F9] font-medium relative z-10">
              <ShieldCheck className="w-5 h-5 text-[#E85002] flex-shrink-0" />
              <span>🎉 You are on the priority waitlist! We will notify you at {email}.</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/15 focus:border-[#E85002] focus:ring-1 focus:ring-[#E85002] text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E85002] to-[#F16001] text-white font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Notify Me</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </section>

        {/* Related Features */}
        {relatedFeatures.length > 0 && (
          <section className="space-y-5 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Other Upcoming Roadmap Features
              </h3>
              <Link
                href="/"
                className="text-xs text-[#E85002] hover:text-[#F16001] font-semibold flex items-center gap-1"
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
                  className="rounded-2xl bg-[#0e1017] border border-white/5 p-4 space-y-3 hover:border-[#E85002]/40 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                      <Image
                        src={f.mediaUrl}
                        alt={f.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#E85002]">
                        {f.badge}
                      </span>
                      <span className="text-[10px] font-mono text-[#A7A7A7]">
                        ETA: {f.eta}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-[#F16001] transition-colors">
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
