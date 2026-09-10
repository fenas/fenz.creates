"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Sparkles,
  Image as ImageIcon,
  Check,
  Send,
  Layers,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { AspectRatio } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function SubmitPromptModal() {
  const { isSubmitModalOpen, setIsSubmitModalOpen, categories, addPrompt } =
    usePromptStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [model, setModel] = useState("Midjourney v6");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "cat-photoreal");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Community", "Creative"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSubmitModalOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      showToast("Please fill in prompt title and prompt text", "error");
      return;
    }

    setIsSubmitting(true);

    const fallbackImage =
      mediaUrl.trim() ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop";

    addPrompt({
      title: title.trim(),
      promptText: promptText.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      mediaUrl: fallbackImage,
      type: "image",
      model,
      aspectRatio,
      categoryId: categoryId || categories[0]?.id || "cat-photoreal",
      tags: tags.length > 0 ? tags : ["AI Art", "Creative"],
      featured: false,
      status: "published",
      parameters: {
        version: "v1.0",
      },
    });

    setIsSubmitting(false);
    setIsSubmitModalOpen(false);

    // Reset form
    setTitle("");
    setPromptText("");
    setNegativePrompt("");
    setMediaUrl("");
    setTags(["Community", "Creative"]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => setIsSubmitModalOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-3xl glass-panel bg-[#0d0f17] border border-white/10 shadow-2xl z-10 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0c12]/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submit AI Prompt</h2>
              <p className="text-[11px] text-slate-400">Share your best prompt formulas with creators</p>
            </div>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Artwork Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyberpunk Samurai in Neon Rain"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full AI Prompt Text *
            </label>
            <textarea
              required
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste the exact prompt text including modifiers (e.g. cinematic lighting, 8k, --ar 16:9)..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Negative Prompt (Optional)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. blur, low quality, deformed hands, cartoon"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                AI Model / Tool
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs appearance-none cursor-pointer"
              >
                <option value="Midjourney v6" className="bg-[#0f1117]">Midjourney v6</option>
                <option value="Flux.1 Pro" className="bg-[#0f1117]">Flux.1 Pro</option>
                <option value="SDXL" className="bg-[#0f1117]">Stable Diffusion XL</option>
                <option value="DALL-E 3" className="bg-[#0f1117]">DALL-E 3</option>
                <option value="Ideogram 2.0" className="bg-[#0f1117]">Ideogram 2.0</option>
                <option value="Runway Gen-3" className="bg-[#0f1117]">Runway Gen-3 (Video)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs appearance-none cursor-pointer font-mono"
              >
                <option value="1:1" className="bg-[#0f1117]">1:1 (Square)</option>
                <option value="16:9" className="bg-[#0f1117]">16:9 (Landscape / Cinema)</option>
                <option value="9:16" className="bg-[#0f1117]">9:16 (Story / Reels)</option>
                <option value="4:5" className="bg-[#0f1117]">4:5 (Instagram Portrait)</option>
                <option value="3:2" className="bg-[#0f1117]">3:2 (Classic 35mm)</option>
                <option value="21:9" className="bg-[#0f1117]">21:9 (Ultrawide)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f1117]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Image Preview URL (Optional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... (or leave blank for placeholder)"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
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
                placeholder="Add tags (press Enter)..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-200 hover:text-white"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 text-[11px] flex items-center gap-1.5"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-violet-950/60 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Prompt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
