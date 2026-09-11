"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  BookOpen,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Tutorial } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

export function TutorialDetailClient({
  initialTutorial,
}: {
  initialTutorial: Tutorial;
}) {
  const { tutorials } = usePromptStore();
  const { showToast } = useToast();

  // Find latest from store or fallback to initialTutorial
  const tutorial =
    tutorials.find((t) => t.slug === initialTutorial.slug || t.id === initialTutorial.id) ||
    initialTutorial;

  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedTutorials = tutorials
    .filter((t) => t.id !== tutorial.id)
    .slice(0, 3);

  const handleCopyFormula = async () => {
    try {
      await navigator.clipboard.writeText(tutorial.samplePrompt);
      setCopiedFormula(true);
      showToast("Formula Blueprint Copied!", "success", tutorial.samplePrompt.slice(0, 50) + "...");
      setTimeout(() => setCopiedFormula(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tutorial.title} - fenz.creates`,
          text: `Read this AI Prompt Engineering Guide for ${tutorial.model}: "${tutorial.title}"`,
          url,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      if (url) {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        showToast("Tutorial Link Copied!", "success", url);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
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
              title="Share this guide"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Guide</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header Section */}
        <div className="space-y-6">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E85002] text-white shadow-md">
              {tutorial.model}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#A7A7A7]">
              <Clock className="w-3.5 h-3.5 text-[#E85002]" />
              {tutorial.readTime}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-[#F16001]" />
              {tutorial.level} Level
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {tutorial.title}
            </h1>
            <p className="text-sm sm:text-base text-[#A7A7A7] leading-relaxed">
              {tutorial.description}
            </p>
          </div>

          {/* Featured Visual Media */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-[#11131a] border border-white/10 shadow-2xl">
            <Image
              src={tutorial.mediaUrl}
              alt={tutorial.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono">
                Formula Guide Blueprint
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Step-by-Step Breakdown */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E85002]/20 border border-[#E85002]/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-[#E85002]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Core Principles & Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {tutorial.content.map((point, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-[#E85002]/40 transition-all flex items-start gap-4 shadow-lg"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E85002] to-[#C10801] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                  {index + 1}
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-0.5">
                  {point}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Pro Tips & Gotchas */}
        {tutorial.tips && tutorial.tips.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Pro Tips & Best Practices
              </h2>
            </div>

            <div className="p-5 rounded-2xl bg-[#13100d] border border-amber-500/20 space-y-3 shadow-lg">
              {tutorial.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#E85002] flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Master Formula Blueprint Box */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E85002]/20 border border-[#E85002]/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#E85002]" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Prompt Formula Blueprint
              </h2>
            </div>

            <span className="text-[11px] text-[#A7A7A7] font-mono hidden sm:inline">
              Ready to copy & paste
            </span>
          </div>

          <div className="rounded-3xl bg-[#0e1017] border border-[#E85002]/30 p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85002]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-all">
              &ldquo;{tutorial.samplePrompt}&rdquo;
            </div>

            <button
              onClick={handleCopyFormula}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                copiedFormula
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-[#E85002] to-[#F16001] hover:opacity-95 text-white hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {copiedFormula ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Prompt Formula Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt Formula Blueprint</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Section 4: Explore Related Tutorials */}
        {relatedTutorials.length > 0 && (
          <section className="space-y-5 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">
                More Prompt Engineering Guides
              </h3>
              <Link
                href="/"
                className="text-xs text-[#E85002] hover:text-[#F16001] font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTutorials.map((tut) => (
                <Link
                  key={tut.id}
                  href={`/tutorial/${tut.slug}`}
                  className="rounded-2xl bg-[#0e1017] border border-white/5 p-4 space-y-3 hover:border-[#E85002]/40 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                      <Image
                        src={tut.mediaUrl}
                        alt={tut.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#E85002]">
                      {tut.model}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-[#F16001] transition-colors">
                      {tut.title}
                    </h4>
                  </div>

                  <span className="text-[10px] text-[#A7A7A7] font-mono">
                    {tut.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
