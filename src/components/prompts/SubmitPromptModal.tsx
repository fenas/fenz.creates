"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
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
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    const readers = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) resolve(reader.result.toString());
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      setMediaUrls((prev) => [...prev, ...newImages]);
      showToast(`Added ${newImages.length} image(s)`, "success");
    });
    e.target.value = "";
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setMediaUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
      showToast("Image URL added", "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      showToast("Please fill in prompt title and prompt text", "error");
      return;
    }

    setIsSubmitting(true);

    const finalUrls =
      mediaUrls.length > 0
        ? mediaUrls
        : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"];

    addPrompt({
      title: title.trim(),
      promptText: promptText.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      mediaUrl: finalUrls[0],
      mediaUrls: finalUrls,
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
    setMediaUrls([]);
    setUrlInput("");
    setTags(["Community", "Creative"]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setIsSubmitModalOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-[22px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] z-10 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--icon-secondary)] stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Submit Prompt Blueprint</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Share your formulas with the community</p>
            </div>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className="p-1.5 rounded-[8px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              Artwork Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyberpunk Samurai in Neon Rain"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              Prompt Blueprint Text *
            </label>
            <textarea
              required
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste the exact prompt text including parameters (e.g. cinematic lighting, 8k, --ar 16:9)..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              Negative Parameters (Optional)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. blur, low quality, deformed hands"
              className="w-full px-3.5 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                AI Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--text-secondary)]"
              >
                <option value="Midjourney v6" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">Midjourney v6</option>
                <option value="Flux.1 Pro" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">Flux.1 Pro</option>
                <option value="SDXL" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">Stable Diffusion XL</option>
                <option value="DALL-E 3" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">DALL-E 3</option>
                <option value="Ideogram 2.0" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">Ideogram 2.0</option>
                <option value="Runway Gen-3" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">Runway Gen-3 (Video)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono cursor-pointer focus:outline-none focus:border-[var(--text-secondary)]"
              >
                <option value="1:1" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">1:1 (Square)</option>
                <option value="16:9" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">16:9 (Landscape / Cinema)</option>
                <option value="9:16" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">9:16 (Story / Reels)</option>
                <option value="4:5" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">4:5 (Instagram Portrait)</option>
                <option value="3:2" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">3:2 (Classic 35mm)</option>
                <option value="21:9" className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">21:9 (Ultrawide)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--text-secondary)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-primary)]">
                  Artwork Files ({mediaUrls.length})
                </label>
                <label className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-[11px] font-mono">
                  + Upload Image
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="Paste image URL..."
                  className="w-full px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3 py-1 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              Style Tags
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
                className="flex-1 px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)] text-[11px] font-mono flex items-center gap-1.5"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3 stroke-[1.75]" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="btn-secondary px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Submit Blueprint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
