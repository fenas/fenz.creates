"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  Save,
  Eye,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Prompt, AspectRatio, MediaType, PromptKind } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";
import { uploadMediaToSupabase } from "@/lib/supabase";

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

  const [promptKind, setPromptKind] = useState<PromptKind>("single");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [packItems, setPackItems] = useState<
    Array<{
      id: string;
      imageUrl: string;
      promptText: string;
      negativePrompt?: string;
      title?: string;
    }>
  >([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [model, setModel] = useState("Midjourney v6");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isHeroBanner, setIsHeroBanner] = useState(false);
  const [status, setStatus] = useState<"published" | "draft">("published");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (promptToEdit) {
      const isPack =
        promptToEdit.promptKind === "pack" ||
        (Array.isArray(promptToEdit.packItems) && promptToEdit.packItems.length > 1);

      setPromptKind(isPack ? "pack" : "single");
      setTitle(promptToEdit.title);
      setSubtitle(promptToEdit.subtitle || promptToEdit.description || "");
      setPromptText(promptToEdit.promptText);
      setNegativePrompt(promptToEdit.negativePrompt || "");

      const existingUrls =
        promptToEdit.mediaUrls && promptToEdit.mediaUrls.length > 0
          ? promptToEdit.mediaUrls
          : promptToEdit.mediaUrl
            ? [promptToEdit.mediaUrl]
            : [];
      setMediaUrls(existingUrls);

      if (promptToEdit.packItems && promptToEdit.packItems.length > 0) {
        setPackItems(promptToEdit.packItems);
      } else {
        setPackItems(
          existingUrls.map((url, i) => ({
            id: `item-${i + 1}`,
            imageUrl: url,
            promptText: promptToEdit.promptText,
            negativePrompt: promptToEdit.negativePrompt || "",
            title: `Image ${i + 1}`,
          }))
        );
      }

      setActiveImageIndex(0);
      setMediaType(promptToEdit.type || "image");
      setModel(promptToEdit.model);
      setAspectRatio(promptToEdit.aspectRatio || "");
      setCategoryId(promptToEdit.categoryId);
      setTags(promptToEdit.tags || []);
      setFeatured(promptToEdit.featured);
      setIsHeroBanner(promptToEdit.id === bannerPromptId);
      setStatus(promptToEdit.status);
    } else {
      setPromptKind("single");
      setTitle("");
      setSubtitle("");
      setPromptText("");
      setNegativePrompt("");
      setMediaUrls([
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
      ]);
      setPackItems([
        {
          id: "item-1",
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
          promptText: "",
          negativePrompt: "",
          title: "Image 1",
        },
      ]);
      setActiveImageIndex(0);
      setMediaType("image");
      setModel("Midjourney v6");
      setAspectRatio("");
      setCategoryId(categories[0]?.id || "");
      setTags(["Featured", "Cinematic"]);
      setFeatured(false);
      setIsHeroBanner(false);
      setStatus("published");
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

  // Sync active pack item prompt text
  const handleActivePromptTextChange = (val: string) => {
    setPromptText(val);
    if (promptKind === "pack") {
      setPackItems((prev) => {
        const next = [...prev];
        if (next[activeImageIndex]) {
          next[activeImageIndex] = { ...next[activeImageIndex], promptText: val };
        }
        return next;
      });
    }
  };

  const handleActiveNegativePromptChange = (val: string) => {
    setNegativePrompt(val);
    if (promptKind === "pack") {
      setPackItems((prev) => {
        const next = [...prev];
        if (next[activeImageIndex]) {
          next[activeImageIndex] = { ...next[activeImageIndex], negativePrompt: val };
        }
        return next;
      });
    }
  };

  const handleSelectImageIndex = (idx: number) => {
    setActiveImageIndex(idx);
    if (promptKind === "pack" && packItems[idx]) {
      setPromptText(packItems[idx].promptText || "");
      setNegativePrompt(packItems[idx].negativePrompt || "");
    }
  };

  // Multiple local file uploads with Supabase Storage integration
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      showToast("Please choose valid image files", "error");
      return;
    }

    showToast(`Uploading ${validFiles.length} image(s) to Supabase Storage...`, "info");

    try {
      const uploadPromises = validFiles.map((file) =>
        uploadMediaToSupabase(file, "prompts")
      );
      const results = await Promise.all(uploadPromises);
      const validUrls = results
        .map((r: { url: string; isRemote: boolean }) => r.url)
        .filter(Boolean);

      if (validUrls.length === 0) return;

      if (promptKind === "single") {
        setMediaUrls([validUrls[0]]);
        setPackItems([
          {
            id: "item-1",
            imageUrl: validUrls[0],
            promptText,
            negativePrompt,
            title: "Cover Image",
          },
        ]);
        setActiveImageIndex(0);
        showToast("Cover photo uploaded and updated!", "success");
      } else {
        setMediaUrls((prev) => [...prev, ...validUrls]);
        setPackItems((prev) => [
          ...prev,
          ...validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: "",
            negativePrompt: "",
            title: `Image ${prev.length + i + 1}`,
          })),
        ]);
        showToast(`Added ${validUrls.length} image(s)`, "success");
      }
    } catch {
      showToast("Upload encountered an issue", "error");
    }

    e.target.value = "";
  };

  const handleDropFiles = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) return;

    showToast(`Uploading ${validFiles.length} image(s) to Supabase Storage...`, "info");

    try {
      const uploadPromises = validFiles.map((file) =>
        uploadMediaToSupabase(file, "prompts")
      );
      const results = await Promise.all(uploadPromises);
      const validUrls = results
        .map((r: { url: string; isRemote: boolean }) => r.url)
        .filter(Boolean);

      if (validUrls.length === 0) return;

      if (promptKind === "single") {
        setMediaUrls([validUrls[0]]);
        setPackItems([
          {
            id: "item-1",
            imageUrl: validUrls[0],
            promptText,
            negativePrompt,
            title: "Cover Image",
          },
        ]);
        setActiveImageIndex(0);
        showToast("Cover photo dropped and updated!", "success");
      } else {
        setMediaUrls((prev) => [...prev, ...validUrls]);
        setPackItems((prev) => [
          ...prev,
          ...validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: "",
            negativePrompt: "",
            title: `Image ${prev.length + i + 1}`,
          })),
        ]);
        showToast(`Added ${validUrls.length} image(s)`, "success");
      }
    } catch {
      showToast("Upload encountered an issue", "error");
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    if (promptKind === "single") {
      setMediaUrls([url]);
      setPackItems([
        {
          id: "item-1",
          imageUrl: url,
          promptText,
          negativePrompt,
          title: "Cover Image",
        },
      ]);
      setActiveImageIndex(0);
      showToast("Cover photo URL updated!", "success");
    } else {
      setMediaUrls((prev) => [...prev, url]);
      setPackItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          imageUrl: url,
          promptText: "",
          negativePrompt: "",
          title: `Image ${prev.length + 1}`,
        },
      ]);
      showToast("Image URL added", "success");
    }
    setUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    if (mediaUrls.length <= 1) {
      showToast("Prompt must have at least one image", "error");
      return;
    }
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setPackItems((prev) => prev.filter((_, i) => i !== index));
    if (activeImageIndex >= mediaUrls.length - 1) {
      const nextIdx = Math.max(0, mediaUrls.length - 2);
      setActiveImageIndex(nextIdx);
      if (promptKind === "pack" && packItems[nextIdx]) {
        setPromptText(packItems[nextIdx].promptText || "");
      }
    }
    showToast("Image removed", "info");
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setMediaUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setPackItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    setActiveImageIndex(0);
    showToast("Set as primary cover image", "success");
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= mediaUrls.length) return;
    setMediaUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setPackItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setActiveImageIndex(to);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast(promptKind === "pack" ? "Pack name is required" : "Title is required", "error");
      return;
    }

    const finalUrls =
      mediaUrls.length > 0
        ? mediaUrls
        : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"];
    const finalMedia = finalUrls[0];

    const formattedPackItems = packItems.map((item, i) => ({
      id: item.id || `pack-item-${i}`,
      imageUrl: item.imageUrl || finalUrls[i] || finalMedia,
      promptText: item.promptText || promptText,
      negativePrompt: item.negativePrompt || negativePrompt || undefined,
      title: item.title || `Image ${i + 1}`,
      aspectRatio,
      model,
    }));

    const promptData = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: subtitle.trim() || undefined,
      promptKind,
      promptText: promptKind === "pack" ? formattedPackItems[0]?.promptText || promptText : promptText.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      mediaUrl: finalMedia,
      mediaUrls: finalUrls,
      packItems: promptKind === "pack" ? formattedPackItems : undefined,
      type: mediaType,
      model,
      aspectRatio,
      categoryId: categoryId || categories[0]?.id || "cat-photoreal",
      tags: tags.length > 0 ? tags : ["AI Art"],
      featured,
      status,
      parameters: promptToEdit?.parameters || undefined,
    };

    if (isEditing && promptToEdit) {
      updatePrompt(promptToEdit.id, promptData);
      if (isHeroBanner) {
        setBannerPromptId(promptToEdit.id);
      }
      showToast("Prompt updated successfully", "success");
    } else {
      const created = addPrompt(promptData);
      if (isHeroBanner && created?.id) {
        setBannerPromptId(created.id);
      }
      showToast("Prompt created successfully", "success");
    }

    onClose();
  };

  const currentPreviewUrl = mediaUrls[activeImageIndex] || mediaUrls[0] || "";

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
                Upload multiple showcase images, model specifications, and search tags
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
          {/* Mode Switcher */}
          <div className="p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setPromptKind("single");
                if (mediaUrls.length > 1) {
                  setMediaUrls([mediaUrls[0]]);
                  setPackItems([packItems[0] || {
                    id: "item-1",
                    imageUrl: mediaUrls[0],
                    promptText,
                    negativePrompt,
                  }]);
                  setActiveImageIndex(0);
                }
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${promptKind === "single"
                  ? "btn-accent-gradient shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Single Prompt (1 Image + 1 Prompt)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPromptKind("pack");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${promptKind === "pack"
                  ? "btn-accent-gradient shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>Prompt Pack (Multi-Image + Prompts)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Media preview & multiple upload */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>{promptKind === "pack" ? "Pack Images" : "Showcase Image"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-bold">
                      {mediaUrls.length} image{mediaUrls.length !== 1 ? "s" : ""}
                    </span>
                  </label>
                  {mediaUrls.length > 1 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Image {activeImageIndex + 1} of {mediaUrls.length}
                    </span>
                  )}
                </div>

                {/* Main Preview Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropFiles}
                  className={`relative rounded-2xl overflow-hidden bg-slate-950 border transition-all aspect-square flex items-center justify-center group ${isDragging
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/40"
                      : "border-white/10"
                    }`}
                >
                  {currentPreviewUrl ? (
                    <Image
                      src={currentPreviewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={currentPreviewUrl.startsWith("data:")}
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No media selected
                    </div>
                  )}

                  {/* Top Left: Active badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
                    <div className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-slate-200">
                      {mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                    </div>
                    {activeImageIndex === 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-[var(--accent)] text-white text-[10px] font-bold shadow-md">
                        Cover
                      </span>
                    )}
                  </div>

                  {aspectRatio && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-xs font-mono text-slate-300 z-10">
                      {aspectRatio}
                    </div>
                  )}

                  {/* Navigation Arrows on Preview Box */}
                  {mediaUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextIdx = activeImageIndex === 0 ? mediaUrls.length - 1 : activeImageIndex - 1;
                          handleSelectImageIndex(nextIdx);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[var(--accent)] text-white backdrop-blur-md transition-all z-10 shadow-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextIdx = activeImageIndex === mediaUrls.length - 1 ? 0 : activeImageIndex + 1;
                          handleSelectImageIndex(nextIdx);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[var(--accent)] text-white backdrop-blur-md transition-all z-10 shadow-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Multiple Files & Add URL Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {promptKind === "pack" ? "Add pack images:" : "Change image:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{promptKind === "pack" ? "Upload Images" : "Upload Image"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={promptKind === "pack"}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Paste URL Input */}
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (urlInput.trim()) {
                          const url = urlInput.trim();
                          if (promptKind === "single") {
                            setMediaUrls([url]);
                            setPackItems([{
                              id: `item-1`,
                              imageUrl: url,
                              promptText,
                              negativePrompt,
                            }]);
                          } else {
                            setMediaUrls((prev) => [...prev, url]);
                            setPackItems((prev) => [
                              ...prev,
                              {
                                id: `item-${Date.now()}`,
                                imageUrl: url,
                                promptText: "",
                                negativePrompt: "",
                              },
                            ]);
                          }
                          setUrlInput("");
                          showToast("Image URL added", "success");
                        }
                      }
                    }}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Images Gallery Strip / Manager */}
              {mediaUrls.length > 0 && promptKind === "pack" && (
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Pack Gallery ({mediaUrls.length} items)</span>
                    <span className="text-[10px] text-slate-400">Click to edit its prompt</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectImageIndex(idx)}
                        className={`group/thumb relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition-all ${activeImageIndex === idx
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50 scale-[1.02]"
                            : "border-white/10 hover:border-white/30 bg-slate-950"
                          }`}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={url.startsWith("data:")}
                        />

                        {/* Order badge */}
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] font-mono text-white font-bold">
                          {idx === 0 ? "★ Cover" : `#${idx + 1}`}
                        </div>

                        {/* Prompt configured indicator */}
                        {packItems[idx]?.promptText?.trim() && (
                          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black shadow" title="Prompt configured" />
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-between p-1">
                          <div className="flex items-center justify-end w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="p-1 rounded-md bg-red-500/80 hover:bg-red-600 text-white"
                              title="Delete image"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(idx);
                                }}
                                className="px-1.5 py-0.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[9px] font-bold text-white flex items-center gap-0.5"
                                title="Make Primary Cover"
                              >
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>Cover</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between w-full">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveImage(idx, idx - 1);
                              }}
                              className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white disabled:opacity-30"
                              title="Move left"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === mediaUrls.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveImage(idx, idx + 1);
                              }}
                              className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white disabled:opacity-30"
                              title="Move right"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Type Switcher (Image vs Video) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${mediaType === "image"
                        ? "bg-[#252a3a] text-white border border-white/20 shadow-sm"
                        : "glass-pill text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${mediaType === "video"
                        ? "bg-[var(--accent)] text-white font-bold"
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
                    className={`px-3 py-1 rounded-xl text-xs font-semibold ${status === "published"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30"
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
                    className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
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
                    className="w-4 h-4 accent-[var(--accent)] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Prompt details & fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {promptKind === "pack" ? "Prompt Pack Name *" : "Artwork Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={promptKind === "pack" ? "e.g. Cinematic Product Prompts" : "e.g. Master Watchmaker in Swiss Atelier"}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-semibold"
                />
              </div>

              {promptKind === "pack" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pack Subtitle / Summary (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. 5 cohesive studio product photography prompts with lighting presets"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-300"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {promptKind === "pack" ? (
                      <span className="flex items-center gap-1.5">
                        <span>Prompt Formula for Image #{activeImageIndex + 1} *</span>
                        <span className="text-[10px] text-[var(--accent)] font-mono bg-[var(--accent-soft)] px-1.5 py-0.2 rounded">
                          Image {activeImageIndex + 1} of {mediaUrls.length}
                        </span>
                      </span>
                    ) : (
                      "Prompt Text *"
                    )}
                  </label>
                  {promptKind === "pack" && mediaUrls.length > 1 && (
                    <div className="flex items-center gap-1">
                      {mediaUrls.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectImageIndex(i)}
                          className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold transition-all ${activeImageIndex === i
                              ? "bg-[var(--accent)] text-white"
                              : "bg-white/10 text-slate-400 hover:text-white"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  required
                  rows={4}
                  value={promptText}
                  onChange={(e) => handleActivePromptTextChange(e.target.value)}
                  placeholder={
                    promptKind === "pack"
                      ? `Enter prompt formula specifically for Image #${activeImageIndex + 1}...`
                      : "Complete prompt string with lighting, camera, artist, and rendering flags..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {promptKind === "pack" ? `Negative Prompt for Image #${activeImageIndex + 1} (Optional)` : "Negative Prompt (Optional)"}
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => handleActiveNegativePromptChange(e.target.value)}
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
                    <option value="" className="bg-[#0f1117]">None / Blank (Default)</option>
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
              className="btn-accent-gradient flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg"
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
