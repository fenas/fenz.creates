"use client";

import React, { useState } from "react";
import {
  X,
  Sliders,
  Sparkles,
  Clock,
  Gauge,
  Tag,
  Globe,
  Trash2,
  Check,
} from "lucide-react";
import { Tutorial } from "@/types";

interface BlockEditorSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  onChangeModel: (model: string) => void;
  level: Tutorial["level"];
  onChangeLevel: (level: Tutorial["level"]) => void;
  readTime: string;
  onChangeReadTime: (readTime: string) => void;
  slug: string;
  onChangeSlug: (slug: string) => void;
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  status: "published" | "draft";
  onChangeStatus: (status: "published" | "draft") => void;
  onDeleteArticle?: () => void;
}

export function BlockEditorSettingsDrawer({
  isOpen,
  onClose,
  model,
  onChangeModel,
  level,
  onChangeLevel,
  readTime,
  onChangeReadTime,
  slug,
  onChangeSlug,
  tags,
  onChangeTags,
  status,
  onChangeStatus,
  onDeleteArticle,
}: BlockEditorSettingsDrawerProps) {
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChangeTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChangeTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0a0c12]/98 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#08090e]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#E85002]" />
          <h3 className="text-sm font-bold text-white">Article Settings</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Options */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
        {/* Status Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Publishing Status</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeStatus("published")}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                status === "published"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {status === "published" && <Check className="w-3 h-3" />}
              <span>Published</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeStatus("draft")}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                status === "draft"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {status === "draft" && <Check className="w-3 h-3" />}
              <span>Draft</span>
            </button>
          </div>
        </div>

        {/* AI Model Target */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E85002]" />
            <span>AI Model Focus</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => onChangeModel(e.target.value)}
            placeholder="e.g. Midjourney v6, Flux.1 Pro, SDXL..."
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Difficulty Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Difficulty Level</span>
          </label>
          <select
            value={level}
            onChange={(e) => onChangeLevel(e.target.value as Tutorial["level"])}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          >
            <option value="Beginner" className="bg-[#11131a]">Beginner</option>
            <option value="Intermediate" className="bg-[#11131a]">Intermediate</option>
            <option value="Advanced" className="bg-[#11131a]">Advanced</option>
          </select>
        </div>

        {/* Reading Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Reading Time</span>
          </label>
          <input
            type="text"
            value={readTime}
            onChange={(e) => onChangeReadTime(e.target.value)}
            placeholder="e.g. 4 min read"
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* URL Slug */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Custom URL Slug</span>
          </label>
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-400">
            <span className="text-slate-600 font-mono select-none">/tutorial/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => onChangeSlug(e.target.value)}
              placeholder="article-slug"
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none border-none p-0"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Tags & Keywords</span>
          </label>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter..."
              className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px]"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        {onDeleteArticle && (
          <div className="pt-6 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              Danger Zone
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to permanently delete this article?")) {
                  onDeleteArticle();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Article</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
