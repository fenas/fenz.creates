"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Type,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Code2,
  Minus,
  Sparkles,
  Terminal,
  HelpCircle,
  ExternalLink,
  Search,
  Zap,
} from "lucide-react";
import { BlockType, CalloutVariant } from "@/types/blocks";

export interface AddBlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Basic" | "Media" | "Creative / AI";
  badge?: string;
  initialData?: Record<string, any>;
}

export const BLOCK_OPTIONS: AddBlockOption[] = [
  // Basic
  {
    type: "paragraph",
    label: "Text",
    description: "Start writing with plain body text",
    icon: Type,
    category: "Basic",
  },
  {
    type: "heading",
    label: "Heading 1",
    description: "Large section heading",
    icon: Heading2,
    category: "Basic",
  },
  {
    type: "subheading",
    label: "Heading 2",
    description: "Medium subsection heading",
    icon: Heading3,
    category: "Basic",
  },
  {
    type: "bulleted-list",
    label: "Bulleted list",
    description: "Create a simple bulleted list",
    icon: List,
    category: "Basic",
  },
  {
    type: "numbered-list",
    label: "Numbered list",
    description: "Create an ordered step-by-step list",
    icon: ListOrdered,
    category: "Basic",
  },
  {
    type: "quote",
    label: "Quote",
    description: "Capture a prominent quote or insight",
    icon: Quote,
    category: "Basic",
  },

  // Media
  {
    type: "image",
    label: "Image",
    description: "Upload an artwork or embed via URL",
    icon: ImageIcon,
    category: "Media",
  },
  {
    type: "video",
    label: "Video / YouTube",
    description: "Embed YouTube, Vimeo, or upload video",
    icon: Video,
    category: "Media",
  },

  // Creative / AI
  {
    type: "prompt",
    label: "Arenae Prompt Block",
    description: "Copyable AI prompt card with parameters & model badge",
    icon: Sparkles,
    category: "Creative / AI",
    badge: "AI Native",
  },
  {
    type: "callout",
    label: "Pro Tip Callout",
    description: "Highlighted callout box for tips, notes, or warnings",
    icon: Zap,
    category: "Creative / AI",
    initialData: { calloutVariant: "tip" as CalloutVariant, calloutTitle: "💡 PRO TIP" },
  },
  {
    type: "code",
    label: "Code Block",
    description: "Monospace code block with syntax language picker",
    icon: Code2,
    category: "Creative / AI",
  },
  {
    type: "divider",
    label: "Divider",
    description: "Visually separate article sections",
    icon: Minus,
    category: "Creative / AI",
  },
  {
    type: "button",
    label: "Action Link / Button",
    description: "Call-to-action button or resource link",
    icon: ExternalLink,
    category: "Creative / AI",
  },
];

interface AddBlockMenuProps {
  onSelect: (option: AddBlockOption) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  searchFilter?: string;
}

export function AddBlockMenu({
  onSelect,
  onClose,
  searchFilter = "",
}: AddBlockMenuProps) {
  const [query, setQuery] = useState(searchFilter);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = BLOCK_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.description.toLowerCase().includes(query.toLowerCase()) ||
      opt.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      onSelect(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const categories: Array<"Basic" | "Media" | "Creative / AI"> = ["Basic", "Media", "Creative / AI"];

  return (
    <div
      ref={menuRef}
      onKeyDown={handleKeyDown}
      className="w-80 rounded-2xl bg-[#0f1118]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden z-50 text-white animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[380px]"
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-white/10 flex items-center gap-2 bg-[#090b10]">
        <Search className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Filter block types..."
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none border-none p-0"
        />
        <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
          ESC
        </span>
      </div>

      {/* Block Options List */}
      <div className="overflow-y-auto p-1.5 space-y-3 flex-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No matching blocks found
          </div>
        ) : (
          categories.map((cat) => {
            const catItems = filtered.filter((opt) => opt.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {cat}
                </div>
                {catItems.map((opt) => {
                  const Icon = opt.icon;
                  const currentIndex = filtered.indexOf(opt);
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => onSelect(opt)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white translate-x-0.5"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#E85002] text-white shadow-md shadow-[#E85002]/30"
                            : "bg-white/5 text-slate-300 border border-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{opt.label}</span>
                          {opt.badge && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#E85002]/20 border border-[#E85002]/40 text-[#F16001] text-[9px] font-bold">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
