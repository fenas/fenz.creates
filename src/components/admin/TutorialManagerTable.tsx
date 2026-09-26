"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit2, Trash2, BookOpen, Search, ExternalLink, Share2 } from "lucide-react";
import { Tutorial } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface TutorialManagerTableProps {
  onOpenCreate: () => void;
  onEditTutorial: (tut: Tutorial) => void;
}

export function TutorialManagerTable({
  onOpenCreate,
  onEditTutorial,
}: TutorialManagerTableProps) {
  const { tutorials, deleteTutorial } = usePromptStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.model?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.level?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete tutorial guide "${title}"?`)) {
      deleteTutorial(id);
    }
  };

  const handleCopyLink = async (t: Tutorial) => {
    const url = `${window.location.origin}/tutorial/${t.slug}`;
    await navigator.clipboard.writeText(url);
    showToast("Tutorial Link Copied!", "success", url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-accent-gradient text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Tutorial</span>
        </button>
      </div>

      <div className="rounded-2xl floating-panel bg-[#0c0e15] border border-white/5 overflow-hidden shadow-xl w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-300 table-auto">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[11px] font-semibold text-[#A7A7A7] uppercase tracking-wider">
              <tr>
                <th className="p-4 min-w-[320px]">Tutorial Guide</th>
                <th className="p-4 w-[160px]">Model Focus</th>
                <th className="p-4 w-[120px]">Level</th>
                <th className="p-4 w-[140px]">Read Time</th>
                <th className="p-4 w-[180px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#A7A7A7]">
                    No tutorials uploaded yet. Click &quot;Upload Tutorial&quot; to publish one.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/tutorial/${t.slug}`}
                          target="_blank"
                          className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 hover:border-[var(--accent)]/40 transition-colors"
                        >
                          <Image
                            src={t.mediaUrl}
                            alt={t.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized={t.mediaUrl?.startsWith("data:")}
                          />
                        </Link>
                        <div className="min-w-0 flex-1 max-w-sm sm:max-w-md lg:max-w-xl">
                          <Link
                            href={`/tutorial/${t.slug}`}
                            target="_blank"
                            className="font-semibold text-white truncate hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
                          >
                            <span className="truncate">{t.title}</span>
                            <ExternalLink className="w-3 h-3 text-[#A7A7A7] opacity-60 flex-shrink-0" />
                          </Link>
                          <div className="text-[11px] text-[#A7A7A7] truncate mt-0.5 font-mono">
                            /tutorial/{t.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[var(--accent)] whitespace-nowrap">
                      {t.model || <span className="text-slate-500 font-normal">Universal</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300">
                        {t.level || "Beginner"}
                      </span>
                    </td>
                    <td className="p-4 text-[#A7A7A7] font-mono whitespace-nowrap">{t.readTime || "—"}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(t)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7A7A7] hover:text-[var(--accent)]"
                          title="Copy Sharable URL"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/tutorial/${t.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7A7A7] hover:text-white"
                          title="Open Live Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => onEditTutorial(t)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7A7A7] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.title)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#A7A7A7] hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
