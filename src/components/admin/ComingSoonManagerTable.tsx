"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Clock, Search } from "lucide-react";
import { ComingSoonFeature } from "@/types";
import { usePromptStore } from "@/context/PromptContext";

interface ComingSoonManagerTableProps {
  onOpenCreate: () => void;
  onEditFeature: (feat: ComingSoonFeature) => void;
}

export function ComingSoonManagerTable({
  onOpenCreate,
  onEditFeature,
}: ComingSoonManagerTableProps) {
  const { comingSoon, deleteComingSoon } = usePromptStore();
  const [search, setSearch] = useState("");

  const filtered = comingSoon.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete roadmap feature "${title}"?`)) {
      deleteComingSoon(id);
    }
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
            placeholder="Search roadmap features..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Roadmap Feature</span>
        </button>
      </div>

      <div className="rounded-2xl floating-panel bg-[#0c0e15] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/5 text-[11px] font-semibold text-[#A7A7A7] uppercase tracking-wider">
              <tr>
                <th className="p-4">Roadmap Feature</th>
                <th className="p-4">Badge / Status</th>
                <th className="p-4">Estimated Release (ETA)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#A7A7A7]">
                    No roadmap features added yet. Click &quot;Add Roadmap Feature&quot; to publish one.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                          <Image
                            src={f.mediaUrl}
                            alt={f.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <div className="font-semibold text-white truncate">
                            {f.title}
                          </div>
                          <div className="text-[11px] text-[#A7A7A7] truncate mt-0.5">
                            {f.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E85002]/20 text-[#F16001] border border-[#E85002]/30">
                        {f.badge}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{f.eta}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditFeature(f)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.title)}
                          className="p-1.5 rounded-lg hover:bg-[#E85002]/10 text-slate-400 hover:text-[#E85002]"
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
