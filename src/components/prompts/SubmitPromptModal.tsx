"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  Send,
  Layers,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { usePromptStore } from "@/context/PromptContext";
import { AspectRatio, PromptKind, PromptPackItem } from "@/types";
import { useToast } from "@/components/ui/Toast";

import { uploadMediaToSupabase } from "@/lib/supabase";
import { LiquidAccentButton } from "@/components/ui/LiquidAccentButton";

export function SubmitPromptModal() {
  const { isSubmitModalOpen, setIsSubmitModalOpen, categories, addPrompt } =
    usePromptStore();
  const { showToast } = useToast();

  const [uploadKind, setUploadKind] = useState<PromptKind>("single");

  // Single Prompt State
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [singleHowToUse, setSingleHowToUse] = useState("");
  const [singleImageUrls, setSingleImageUrls] = useState<string[]>([]);
  const [singleUrlInput, setSingleUrlInput] = useState("");
  const [isUploadingSingle, setIsUploadingSingle] = useState(false);
  const [isDraggingSingle, setIsDraggingSingle] = useState(false);

  // Prompt Pack State
  const [packName, setPackName] = useState("");
  const [packSubtitle, setPackSubtitle] = useState("");
  const [packHowToUse, setPackHowToUse] = useState("");
  const [packItems, setPackItems] = useState<
    Array<{
      id: string;
      imageUrl: string;
      promptText: string;
      negativePrompt?: string;
    }>
  >([
    {
      id: "item-1",
      imageUrl: "",
      promptText: "",
      negativePrompt: "",
    },
    {
      id: "item-2",
      imageUrl: "",
      promptText: "",
      negativePrompt: "",
    },
  ]);

  // Shared Settings
  const [model, setModel] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "cat-photoreal");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Community", "Creative"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const packBatchFileInputRef = useRef<HTMLInputElement>(null);

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

  // Single image file handler (supports 1 or multiple files)
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setIsUploadingSingle(true);
    showToast(`Uploading ${fileList.length} showcase image(s)...`, "info");

    try {
      const uploadPromises = fileList.map((file) => uploadMediaToSupabase(file, "prompts"));
      const results = await Promise.all(uploadPromises);
      const validUrls = results
        .map((r: { url: string; isRemote: boolean }) => r.url)
        .filter(Boolean);

      if (validUrls.length > 0) {
        setSingleImageUrls((prev) => [...prev, ...validUrls]);
        showToast(`Added ${validUrls.length} image(s)!`, "success");
      }
    } catch {
      const readers = fileList.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) resolve(reader.result.toString());
          };
          reader.readAsDataURL(file);
        });
      });
      const dataUrls = await Promise.all(readers);
      setSingleImageUrls((prev) => [...prev, ...dataUrls]);
      showToast(`Added ${dataUrls.length} image(s)!`, "success");
    } finally {
      setIsUploadingSingle(false);
    }

    e.target.value = "";
  };

  // Single image drag & drop handler (supports 1 or multiple files)
  const handleSingleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSingle(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setIsUploadingSingle(true);
    showToast(`Uploading ${fileList.length} showcase image(s)...`, "info");

    try {
      const uploadPromises = fileList.map((file) => uploadMediaToSupabase(file, "prompts"));
      const results = await Promise.all(uploadPromises);
      const validUrls = results
        .map((r: { url: string; isRemote: boolean }) => r.url)
        .filter(Boolean);

      if (validUrls.length > 0) {
        setSingleImageUrls((prev) => [...prev, ...validUrls]);
        showToast(`Added ${validUrls.length} image(s)!`, "success");
      }
    } catch {
      const readers = fileList.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) resolve(reader.result.toString());
          };
          reader.readAsDataURL(file);
        });
      });
      const dataUrls = await Promise.all(readers);
      setSingleImageUrls((prev) => [...prev, ...dataUrls]);
      showToast(`Added ${dataUrls.length} image(s)!`, "success");
    } finally {
      setIsUploadingSingle(false);
    }
  };

  // Single URL add handler
  const handleSetSingleUrl = () => {
    if (!singleUrlInput.trim()) return;
    const url = singleUrlInput.trim();
    setSingleImageUrls((prev) => [...prev, url]);
    setSingleUrlInput("");
    showToast("Showcase image URL added!", "success");
  };

  const handleRemoveSingleImage = (index: number) => {
    setSingleImageUrls((prev) => prev.filter((_, i) => i !== index));
    showToast("Image removed", "info");
  };

  const handleSetPrimarySingle = (index: number) => {
    if (index === 0) return;
    setSingleImageUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
    showToast("Set as primary cover image", "success");
  };

  // Pack Item single file upload
  const handlePackItemFileUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setPackItems((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], imageUrl: reader.result?.toString() || "" };
          return updated;
        });
        showToast(`Image loaded for item ${index + 1}`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Pack batch file upload
  const handlePackBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    const readers = fileList.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) resolve(reader.result.toString());
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImageUrls) => {
      const newItems = newImageUrls.map((url, i) => ({
        id: `item-${Date.now()}-${i}`,
        imageUrl: url,
        promptText: "",
        negativePrompt: "",
      }));

      setPackItems((prev) => {
        // If current items are empty, replace; otherwise append
        const filteredPrev = prev.filter((item) => item.imageUrl || item.promptText);
        return [...filteredPrev, ...newItems];
      });

      showToast(`Added ${newImageUrls.length} image slots to pack`, "success");
    });

    e.target.value = "";
  };

  const handleAddPackSlot = () => {
    setPackItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        imageUrl: "",
        promptText: "",
        negativePrompt: "",
      },
    ]);
  };

  const handleRemovePackSlot = (index: number) => {
    if (packItems.length <= 1) {
      showToast("A pack must contain at least 1 image", "error");
      return;
    }
    setPackItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadKind === "single") {
      if (!title.trim() || !promptText.trim()) {
        showToast("Please enter prompt title and prompt formula text", "error");
        return;
      }

      const finalUrls =
        singleImageUrls.length > 0
          ? singleImageUrls
          : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"];
      const finalMedia = finalUrls[0];

      setIsSubmitting(true);

      addPrompt({
        title: title.trim(),
        promptText: promptText.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        howToUse: singleHowToUse.trim() || undefined,
        mediaUrl: finalMedia,
        mediaUrls: finalUrls,
        type: "image",
        promptKind: "single",
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
      showToast("Single Prompt uploaded successfully!", "success");
    } else {
      // Prompt Pack Validation
      if (!packName.trim()) {
        showToast("Please enter a Prompt Pack Name", "error");
        return;
      }

      const validItems = packItems.filter((item) => item.imageUrl.trim() || item.promptText.trim());
      if (validItems.length === 0) {
        showToast("Please add at least one image and prompt to the pack", "error");
        return;
      }

      // Ensure every image in pack has a prompt
      for (let i = 0; i < validItems.length; i++) {
        if (!validItems[i].promptText.trim()) {
          showToast(`Please enter the prompt formula for Image #${i + 1}`, "error");
          return;
        }
      }

      setIsSubmitting(true);

      const formattedPackItems: PromptPackItem[] = validItems.map((item, i) => ({
        id: item.id || `pack-item-${i}`,
        imageUrl:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
        promptText: item.promptText.trim(),
        negativePrompt: item.negativePrompt?.trim() || undefined,
        title: `Image ${i + 1}`,
        model,
        aspectRatio,
      }));

      const allMediaUrls = formattedPackItems.map((p) => p.imageUrl);

      addPrompt({
        title: packName.trim(),
        subtitle: packSubtitle.trim() || `Collection of ${formattedPackItems.length} prompts.`,
        description: packSubtitle.trim() || `Collection of ${formattedPackItems.length} prompt formulas.`,
        promptKind: "pack",
        promptText: formattedPackItems[0]?.promptText || "",
        negativePrompt: formattedPackItems[0]?.negativePrompt || undefined,
        howToUse: packHowToUse.trim() || undefined,
        mediaUrl: allMediaUrls[0] || "",
        mediaUrls: allMediaUrls,
        packItems: formattedPackItems,
        type: "image",
        model,
        aspectRatio,
        categoryId: categoryId || categories[0]?.id || "cat-photoreal",
        tags: tags.length > 0 ? tags : ["Prompt Pack", "Collection"],
        featured: false,
        status: "published",
        parameters: {
          version: "v1.0",
        },
      });

      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
      showToast(`Prompt Pack "${packName}" created with ${formattedPackItems.length} prompts!`, "success");
    }

    // Reset Form
    setTitle("");
    setPromptText("");
    setNegativePrompt("");
    setSingleHowToUse("");
    setSingleImageUrls([]);
    setSingleUrlInput("");
    setPackName("");
    setPackSubtitle("");
    setPackHowToUse("");
    setModel("");
    setAspectRatio("");
    setPackItems([
      { id: "item-1", imageUrl: "", promptText: "", negativePrompt: "" },
      { id: "item-2", imageUrl: "", promptText: "", negativePrompt: "" },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setIsSubmitModalOpen(false)} />

      <div className="relative w-full max-w-2xl rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-modal)] z-10 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
              {uploadKind === "pack" ? (
                <Layers className="w-5 h-5 stroke-[2]" />
              ) : (
                <Sparkles className="w-5 h-5 stroke-[2]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {uploadKind === "pack" ? "Create Prompt Pack" : "Submit Single Prompt"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {uploadKind === "pack"
                  ? "Upload multiple images where each image has its own prompt formula"
                  : "Share a single image + prompt formula with the community"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className="p-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Upload Mode Selector (2 Choices) */}
        <div className="px-6 pt-4 pb-2 bg-[var(--surface-elevated)] border-b border-[var(--border)]">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--surface-recessed)] border border-[var(--border)] gap-1">
            <button
              type="button"
              onClick={() => setUploadKind("single")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadKind === "single"
                  ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Standard Prompt (1 or more Images • 1 Prompt)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadKind("pack")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${uploadKind === "pack"
                  ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>Prompt Pack (Multi-Image + Prompts)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* ======================================================== */}
          {/* CASE 1: SINGLE PROMPT UPLOAD FLOW */}
          {/* ======================================================== */}
          {uploadKind === "single" && (
            <div className="space-y-4">
              {/* Single Image Upload / Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Showcase Images *
                  </label>
                  {singleImageUrls.length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      <span>{singleImageUrls.length} image{singleImageUrls.length !== 1 ? "s" : ""} selected</span>
                    </span>
                  )}
                </div>

                {singleImageUrls.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-white/15 group shadow-lg">
                      <Image
                        src={singleImageUrls[0]}
                        alt="Primary showcase cover"
                        fill
                        className="object-cover"
                        unoptimized={singleImageUrls[0].startsWith("data:")}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-md">
                        <span className="text-[var(--accent)]">★</span>
                        <span>Primary Cover</span>
                        {singleImageUrls.length > 1 && (
                          <span className="text-white/70 font-mono text-[9px]">
                            • 1 of {singleImageUrls.length}
                          </span>
                        )}
                      </div>

                      {/* Controls Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => singleFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Add More Images</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSingleImageUrls([])}
                          className="px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Remove all images"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All</span>
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail strip for multi-image showcase */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {singleImageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className={`group/thumb relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                            idx === 0
                              ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/50"
                              : "border-white/10"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={`Showcase ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized={url.startsWith("data:")}
                          />
                          <div className="absolute top-0.5 left-0.5 px-1 rounded bg-black/70 text-[8.5px] font-mono text-white font-bold">
                            {idx === 0 ? "★" : idx + 1}
                          </div>
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimarySingle(idx)}
                                className="p-1 rounded bg-[var(--accent)] text-white text-[8px] font-bold"
                                title="Set as primary cover"
                              >
                                ★
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSingleImage(idx)}
                              className="p-1 rounded bg-red-500/80 text-white"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => singleFileInputRef.current?.click()}
                        className="w-14 h-14 rounded-xl border border-dashed border-white/20 hover:border-[var(--accent)] flex flex-col items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all flex-shrink-0 cursor-pointer"
                        title="Add more images"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[8px] font-bold mt-0.5">Add</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="url"
                        placeholder="Add another image URL..."
                        value={singleUrlInput}
                        onChange={(e) => setSingleUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSetSingleUrl();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <button
                        type="button"
                        onClick={handleSetSingleUrl}
                        className="px-3 py-1.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingSingle(true);
                    }}
                    onDragLeave={() => setIsDraggingSingle(false)}
                    onDrop={handleSingleDrop}
                    className={`p-6 rounded-2xl border-2 border-dashed transition-all bg-[var(--surface-recessed)] flex flex-col items-center justify-center text-center gap-3 ${isDraggingSingle
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent)]/5"
                        : "border-[var(--border)] hover:border-white/30"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-sm">
                      <Upload className={`w-6 h-6 ${isUploadingSingle ? "animate-bounce" : ""}`} />
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {isUploadingSingle ? "Uploading showcase photo(s)..." : "Upload or drop showcase image(s)"}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        PNG, JPG, WEBP • Select 1 or multiple showcase variations
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-md pt-1">
                      <button
                        type="button"
                        disabled={isUploadingSingle}
                        onClick={() => singleFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl btn-accent-gradient text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse File(s)</span>
                      </button>

                      <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                        <input
                          type="url"
                          placeholder="Or paste image URL..."
                          value={singleUrlInput}
                          onChange={(e) => setSingleUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSetSingleUrl();
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          type="button"
                          onClick={handleSetSingleUrl}
                          className="px-3 py-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={singleFileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleSingleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  Prompt Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyber Geisha in Rain-Slicked Neo-Tokyo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Prompt Text */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  Prompt Formula Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Paste the master prompt formula (e.g. Candid portrait of... --ar 16:9 --v 6.0)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  Negative Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blur, deformed hands, cartoon, oversaturated"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* How to Use Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    How to Use Instructions (Optional)
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    e.g. replace [SUBJECT], upload ref image
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={singleHowToUse}
                  onChange={(e) => setSingleHowToUse(e.target.value)}
                  placeholder="Practical instructions:&#10;• Attach the reference image for style consistency&#10;• Replace [SUBJECT] with your character&#10;• Best with Midjourney v6"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)] font-mono"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CASE 2: PROMPT PACK UPLOAD FLOW */}
          {/* ======================================================== */}
          {uploadKind === "pack" && (
            <div className="space-y-5">
              {/* Pack Name & Subtitle */}
              <div className="p-4 rounded-2xl bg-[var(--surface-recessed)] border border-[var(--border)] space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Prompt Pack Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    placeholder="e.g. Cinematic Product Prompts or Long Legs Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                    Collection Subtitle / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={packSubtitle}
                    onChange={(e) => setPackSubtitle(e.target.value)}
                    placeholder="e.g. Collection of stylized 3D fashion characters and studio setups."
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      How to Use Instructions (Shared for Entire Pack)
                    </label>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      One shared guide for all pack prompts
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={packHowToUse}
                    onChange={(e) => setPackHowToUse(e.target.value)}
                    placeholder="e.g.&#10;• Attach the reference image for style consistency across generations&#10;• Replace [SUBJECT] across all prompts&#10;• Recommended engine: Flux.1 or Midjourney v6"
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>
              </div>

              {/* Batch Upload Helper Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-xs text-[var(--accent)]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">
                    Each image in this pack will have its own individual prompt.
                  </span>
                </div>

                <label className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-[11px] cursor-pointer shadow-md transition-all">
                  + Batch Upload Images
                  <input
                    ref={packBatchFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePackBatchUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* List of Individual Images & Associated Prompts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                    Pack Items ({packItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPackSlot}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {packItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[var(--surface-recessed)] border border-[var(--border)] space-y-3 relative group"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-mono font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          Image #{index + 1} Prompt
                        </span>
                      </div>

                      {packItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePackSlot(index)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
                      {/* Left: Image thumbnail or upload button */}
                      <div className="sm:col-span-4">
                        {item.imageUrl ? (
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/10 group/img">
                            <Image
                              src={item.imageUrl}
                              alt={`Image ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized={item.imageUrl.startsWith("data:")}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                              <label className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold cursor-pointer">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handlePackItemFileUpload(index, f);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="aspect-square w-full rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)]/50 bg-[var(--surface-muted)] flex flex-col items-center justify-center gap-1.5 p-2 text-center cursor-pointer transition-colors">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                            <span className="text-[10px] font-bold text-[var(--text-primary)]">Upload Image</span>
                            <span className="text-[9px] text-[var(--text-secondary)]">or paste URL below</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handlePackItemFileUpload(index, f);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}

                        <input
                          type="url"
                          value={item.imageUrl.startsWith("data:") ? "" : item.imageUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPackItems((prev) => {
                              const updated = [...prev];
                              updated[index] = { ...updated[index], imageUrl: val };
                              return updated;
                            });
                          }}
                          placeholder="Image URL..."
                          className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] text-[var(--text-primary)] outline-none"
                        />
                      </div>

                      {/* Right: Individual Prompt Text & Negative */}
                      <div className="sm:col-span-8 space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[var(--text-primary)] mb-1">
                            Prompt Formula for Image #{index + 1} *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={item.promptText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPackItems((prev) => {
                                const updated = [...prev];
                                updated[index] = { ...updated[index], promptText: val };
                                return updated;
                              });
                            }}
                            placeholder={`Enter distinct prompt for Image #${index + 1}...`}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none focus:border-[var(--accent)]"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            value={item.negativePrompt || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPackItems((prev) => {
                                const updated = [...prev];
                                updated[index] = { ...updated[index], negativePrompt: val };
                                return updated;
                              });
                            }}
                            placeholder="Negative prompt (optional)..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPackSlot}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)]/50 bg-[var(--surface-muted)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Image & Prompt to Pack</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SHARED SETTINGS (Category, Engine, Aspect Ratio, Tags) */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-[var(--border)] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] cursor-pointer outline-none focus:border-[var(--accent)]"
                >
                  <option value="" className="bg-[var(--surface-elevated)]">None / Blank (Default)</option>
                  <option value="Midjourney v6" className="bg-[var(--surface-elevated)]">Midjourney v6</option>
                  <option value="Flux.1 Pro" className="bg-[var(--surface-elevated)]">Flux.1 Pro</option>
                  <option value="SDXL" className="bg-[var(--surface-elevated)]">Stable Diffusion XL</option>
                  <option value="DALL-E 3" className="bg-[var(--surface-elevated)]">DALL-E 3</option>
                  <option value="Ideogram 2.0" className="bg-[var(--surface-elevated)]">Ideogram 2.0</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] cursor-pointer outline-none focus:border-[var(--accent)]"
                >
                  <option value="" className="bg-[var(--surface-elevated)]">None / Blank (Default)</option>
                  <option value="4:5" className="bg-[var(--surface-elevated)]">4:5 (Portrait / Card)</option>
                  <option value="1:1" className="bg-[var(--surface-elevated)]">1:1 (Square)</option>
                  <option value="16:9" className="bg-[var(--surface-elevated)]">16:9 (Landscape)</option>
                  <option value="9:16" className="bg-[var(--surface-elevated)]">9:16 (Story)</option>
                  <option value="3:2" className="bg-[var(--surface-elevated)]">3:2 (35mm Film)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--text-primary)] cursor-pointer outline-none focus:border-[var(--accent)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--surface-elevated)]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
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
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--surface-recessed)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)] text-[11px] font-mono flex items-center gap-1.5"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3 stroke-[2]" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3 sticky bottom-0 bg-[var(--surface-elevated)] py-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2.5 rounded-full bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <LiquidAccentButton
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingText="Publishing Blueprint..."
              size="sm"
              icon={<Send className="w-3.5 h-3.5 stroke-[2]" />}
            >
              {uploadKind === "pack"
                ? `Publish Prompt Pack (${packItems.length} Prompts)`
                : "Publish Single Prompt"}
            </LiquidAccentButton>
          </div>
        </form>
      </div>
    </div>
  );
}
