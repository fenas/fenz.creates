"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  Save,
  Sliders,
  Eye,
} from "lucide-react";
import { Prompt, AspectRatio, MediaType } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface PromptEditorModalProps {
  promptToEdit: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptEditorModal({
  promptToEdit,
  isOpen,
  onClose,
}: PromptEditorModalProps) {
  const { categories, addPrompt, updatePrompt, bannerPromptId, setBannerPromptId } = usePromptStore();
  const { showToast } = useToast();

  const isEditing = !!promptToEdit;

  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [model, setModel] = useState("Midjourney v6");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isHeroBanner, setIsHeroBanner] = useState(false);
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Advanced parameters
  const [seed, setSeed] = useState("");
  const [stylize, setStylize] = useState("");
  const [cfgScale, setCfgScale] = useState("");
  const [sampler, setSampler] = useState("");

  useEffect(() => {
    if (promptToEdit) {
      setTitle(promptToEdit.title);
      setPromptText(promptToEdit.promptText);
      setNegativePrompt(promptToEdit.negativePrompt || "");
      setMediaUrl(promptToEdit.mediaUrl);
      setMediaType(promptToEdit.type || "image");
      setModel(promptToEdit.model);
      setAspectRatio(promptToEdit.aspectRatio);
      setCategoryId(promptToEdit.categoryId);
      setTags(promptToEdit.tags || []);
      setFeatured(promptToEdit.featured);
      setIsHeroBanner(promptToEdit.id === bannerPromptId);
      setStatus(promptToEdit.status);
      setSeed(promptToEdit.parameters?.seed || "");
      setStylize(promptToEdit.parameters?.stylize?.toString() || "");
      setCfgScale(promptToEdit.parameters?.cfgScale?.toString() || "");
      setSampler(promptToEdit.parameters?.sampler || "");
    } else {
      setTitle("");
      setPromptText("");
      setNegativePrompt("");
      setMediaUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop");
      setMediaType("image");
      setModel("Midjourney v6");
      setAspectRatio("16:9");
      setCategoryId(categories[0]?.id || "");
      setTags(["Featured", "Cinematic"]);
      setFeatured(false);
      setIsHeroBanner(false);
      setStatus("published");
      setSeed("");
      setStylize("");
      setCfgScale("");
      setSampler("");
    }
  }, [promptToEdit, categories, isOpen, bannerPromptId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Local file upload preview handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setMediaUrl(reader.result.toString());
          showToast("Image loaded into preview", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !promptText.trim()) {
      showToast("Title and prompt text are required", "error");
      return;
    }

    const finalMedia =
      mediaUrl.trim() ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop";

    const promptData = {
      title: title.trim(),
      promptText: promptText.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      mediaUrl: finalMedia,
      type: mediaType,
      model,
      aspectRatio,
      categoryId: categoryId || categories[0]?.id || "cat-photoreal",
      tags: tags.length > 0 ? tags : ["AI Art"],
      featured,
      status,
      parameters: {
        seed: seed.trim() || undefined,
        stylize: stylize ? parseFloat(stylize) : undefined,
        cfgScale: cfgScale ? parseFloat(cfgScale) : undefined,
        sampler: sampler.trim() || undefined,
      },
    };

    if (isEditing && promptToEdit) {
      updatePrompt(promptToEdit.id, promptData);
      if (isHeroBanner) {
        setBannerPromptId(promptToEdit.id);
      }
    } else {
      const created = addPrompt(promptData);
      if (isHeroBanner && created?.id) {
        setBannerPromptId(created.id);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl rounded-3xl glass-panel bg-[#0d0f17] border border-white/10 shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0c12]/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Prompt Showcase" : "Create New Prompt Showcase"}
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure artwork, model specifications, and search tags
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Media preview & upload */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Media Artwork Preview
                </label>

                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-square flex items-center justify-center group">
                  {mediaUrl ? (
                    <Image
                      src={mediaUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={mediaUrl.startsWith("data:")}
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No media selected
                    </div>
                  )}

                  {/* Media Type Overlay */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-slate-200">
                    {mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-xs font-mono text-slate-300">
                    {aspectRatio}
                  </div>
                </div>
              </div>

              {/* Upload or URL input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Upload local file or URL:</span>
                  <label className="text-violet-400 hover:text-violet-300 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Browse File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Media Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Content Type (Image vs Video)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mediaType === "image"
                        ? "bg-violet-600 text-white"
                        : "glass-pill text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      mediaType === "video"
                        ? "bg-amber-500 text-black"
                        : "glass-pill text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video Prompt
                  </button>
                </div>
              </div>

              {/* Status & Featured Toggles */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Status</div>
                    <div className="text-[10px] text-slate-400">
                      Show or hide in public discovery
                    </div>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                      status === "published"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    <option value="published" className="bg-[#0f1117] text-white">
                      Published
                    </option>
                    <option value="draft" className="bg-[#0f1117] text-white">
                      Draft (Hidden)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-white">Featured</div>
                    <div className="text-[10px] text-slate-400">
                      Pin to top of discovery gallery
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <span>🌟 Hero Banner Post</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Showcase as the main spotlight hero banner on Home
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isHeroBanner}
                    onChange={(e) => setIsHeroBanner(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Prompt details & fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Watchmaker in Swiss Atelier"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prompt Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Complete prompt string with lighting, camera, artist, and rendering flags..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Negative Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blur, deformed hands, cartoon"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    AI Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Midjourney v6, Flux.1 Pro..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  >
                    <option value="16:9" className="bg-[#0f1117]">16:9 (Cinema)</option>
                    <option value="1:1" className="bg-[#0f1117]">1:1 (Square)</option>
                    <option value="4:5" className="bg-[#0f1117]">4:5 (IG Portrait)</option>
                    <option value="9:16" className="bg-[#0f1117]">9:16 (Story)</option>
                    <option value="3:2" className="bg-[#0f1117]">3:2 (35mm)</option>
                    <option value="21:9" className="bg-[#0f1117]">21:9 (Ultrawide)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0f1117]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Parameters (Optional)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Seed"
                    className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <input
                    type="number"
                    value={stylize}
                    onChange={(e) => setStylize(e.target.value)}
                    placeholder="Stylize (s)"
                    className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(e.target.value)}
                    placeholder="CFG Scale"
                    className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={sampler}
                    onChange={(e) => setSampler(e.target.value)}
                    placeholder="Sampler"
                    className="px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Search & Filter Tags
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
                    placeholder="Type tag and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-200 hover:text-white"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
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
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Save Changes" : "Create Prompt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
