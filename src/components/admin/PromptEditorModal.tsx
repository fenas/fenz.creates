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
import {
  isYouTubeUrl,
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  isVideoVertical,
} from "@/lib/youtube";

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
  const [howToUse, setHowToUse] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [refUrlInput, setRefUrlInput] = useState("");
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCoverUrl, setVideoCoverUrl] = useState("");
  const [videoCoverInputText, setVideoCoverInputText] = useState("");
  const videoCoverFileInputRef = useRef<HTMLInputElement>(null);
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
  const [model, setModel] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isHeroBanner, setIsHeroBanner] = useState(false);
  const [status, setStatus] = useState<"published" | "draft">("published");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (promptToEdit) {
      const isPack =
        promptToEdit.promptKind === "pack" ||
        (Array.isArray(promptToEdit.packItems) && promptToEdit.packItems.length > 1);

      const isVideo = promptToEdit.type === "video" || isYouTubeUrl(promptToEdit.mediaUrl);

      setPromptKind(isPack ? "pack" : "single");
      setMediaType(isVideo ? "video" : "image");
      setTitle(promptToEdit.title);
      setSubtitle(promptToEdit.subtitle || promptToEdit.description || "");
      setPromptText(promptToEdit.promptText);
      setNegativePrompt(promptToEdit.negativePrompt || "");
      setHowToUse(promptToEdit.howToUse || (promptToEdit.parameters?.how_to_use as string) || (promptToEdit.parameters?.howToUse as string) || "");

      const existingRefImages =
        promptToEdit.referenceImages ||
        (promptToEdit.parameters?.reference_images as string[]) ||
        (promptToEdit.parameters?.referenceImages as string[]) ||
        [];
      setReferenceImages(existingRefImages);

      if (isVideo) {
        setVideoUrl(promptToEdit.mediaUrl);
        const ytThumb = getYouTubeThumbnailUrl(promptToEdit.mediaUrl, "maxres") || getYouTubeThumbnailUrl(promptToEdit.mediaUrl, "hq") || promptToEdit.mediaUrl;
        const customCover = promptToEdit.thumbnailUrl || (promptToEdit.mediaUrls && promptToEdit.mediaUrls.length > 0 && !isYouTubeUrl(promptToEdit.mediaUrls[0]) ? promptToEdit.mediaUrls[0] : "");
        setVideoCoverUrl(customCover);
        setMediaUrls([customCover || ytThumb]);
      } else {
        setVideoUrl("");
        setVideoCoverUrl("");
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
      }

      setActiveImageIndex(0);
      setModel(promptToEdit.model || "");
      setAspectRatio(promptToEdit.aspectRatio || "");
      setCategoryId(promptToEdit.categoryId);
      setTags(promptToEdit.tags || []);
      setFeatured(promptToEdit.featured);
      setIsHeroBanner(promptToEdit.id === bannerPromptId);
      setStatus(promptToEdit.status);
    } else {
      setPromptKind("single");
      setMediaType("image");
      setVideoUrl("");
      setVideoCoverUrl("");
      setVideoCoverInputText("");
      setTitle("");
      setSubtitle("");
      setPromptText("");
      setNegativePrompt("");
      setHowToUse("");
      setReferenceImages([]);
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
      setModel("");
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

      if (mediaUrls.length === 1 && mediaUrls[0].includes("unsplash.com")) {
        setMediaUrls(validUrls);
        setPackItems(
          validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: promptKind === "pack" ? "" : promptText,
            negativePrompt: promptKind === "pack" ? "" : negativePrompt,
            title: `Image ${i + 1}`,
          }))
        );
      } else {
        setMediaUrls((prev) => [...prev, ...validUrls]);
        setPackItems((prev) => [
          ...prev,
          ...validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: promptKind === "pack" ? "" : promptText,
            negativePrompt: promptKind === "pack" ? "" : negativePrompt,
            title: `Image ${prev.length + i + 1}`,
          })),
        ]);
      }
      showToast(`Added ${validUrls.length} image(s)`, "success");
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

      if (mediaUrls.length === 1 && mediaUrls[0].includes("unsplash.com")) {
        setMediaUrls(validUrls);
        setPackItems(
          validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: promptKind === "pack" ? "" : promptText,
            negativePrompt: promptKind === "pack" ? "" : negativePrompt,
            title: `Image ${i + 1}`,
          }))
        );
      } else {
        setMediaUrls((prev) => [...prev, ...validUrls]);
        setPackItems((prev) => [
          ...prev,
          ...validUrls.map((url, i) => ({
            id: `item-${Date.now()}-${i}`,
            imageUrl: url,
            promptText: promptKind === "pack" ? "" : promptText,
            negativePrompt: promptKind === "pack" ? "" : negativePrompt,
            title: `Image ${prev.length + i + 1}`,
          })),
        ]);
      }
      showToast(`Added ${validUrls.length} image(s)`, "success");
    } catch {
      showToast("Upload encountered an issue", "error");
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    setMediaUrls((prev) => [...prev, url]);
    setPackItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        imageUrl: url,
        promptText: promptKind === "pack" ? "" : promptText,
        negativePrompt: promptKind === "pack" ? "" : negativePrompt,
        title: `Image ${prev.length + 1}`,
      },
    ]);
    showToast("Image URL added", "success");
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

  const handleRefFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setIsUploadingRef(true);
    showToast(`Uploading ${fileList.length} reference image(s)...`, "info");
    try {
      const uploadPromises = fileList.map((file) => uploadMediaToSupabase(file, "prompts"));
      const results = await Promise.all(uploadPromises);
      const validUrls = results
        .map((r: { url: string; isRemote: boolean }) => r.url)
        .filter(Boolean);

      if (validUrls.length > 0) {
        setReferenceImages((prev) => [...prev, ...validUrls]);
        showToast(`Added ${validUrls.length} reference image(s)`, "success");
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
      setReferenceImages((prev) => [...prev, ...dataUrls]);
      showToast(`Added ${dataUrls.length} reference image(s)`, "success");
    } finally {
      setIsUploadingRef(false);
    }
    e.target.value = "";
  };

  const handleAddRefUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refUrlInput.trim()) return;
    setReferenceImages((prev) => [...prev, refUrlInput.trim()]);
    setRefUrlInput("");
    showToast("Reference image URL added", "success");
  };

  const handleRemoveRefImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
    showToast("Reference image removed", "info");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast(promptKind === "pack" ? "Pack name is required" : "Title is required", "error");
      return;
    }

    let finalMedia = "";
    let finalUrls: string[] = [];

    if (mediaType === "video") {
      if (!videoUrl.trim()) {
        showToast("Please enter a valid YouTube video link", "error");
        return;
      }
      finalMedia = videoUrl.trim();
      const ytThumb =
        getYouTubeThumbnailUrl(videoUrl, "maxres") ||
        getYouTubeThumbnailUrl(videoUrl, "hq") ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop";
      const finalCover = videoCoverUrl.trim() || ytThumb;
      finalUrls = [finalCover];
    } else {
      finalUrls =
        mediaUrls.length > 0
          ? mediaUrls
          : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"];
      finalMedia = finalUrls[0];
    }

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
      howToUse: howToUse.trim() || undefined,
      mediaUrl: finalMedia,
      mediaUrls: finalUrls,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      thumbnailUrl: mediaType === "video" ? (videoCoverUrl.trim() || getYouTubeThumbnailUrl(videoUrl, "maxres") || getYouTubeThumbnailUrl(videoUrl, "hq") || undefined) : undefined,
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
              {mediaType === "video" ? (
                <Video className="w-4 h-4 text-red-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Prompt Showcase" : "Create New Prompt Showcase"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {mediaType === "video"
                  ? "Showcase an AI video generation prompt using a YouTube video link"
                  : "Upload showcase images, model specifications, and search tags"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Switcher (3 Choices: Image Prompt, Video Prompt, Prompt Pack) */}
          <div className="p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMediaType("image");
                setPromptKind("single");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mediaType === "image" && promptKind === "single"
                  ? "btn-accent-gradient shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Standard Image Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMediaType("video");
                setPromptKind("single");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mediaType === "video"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Prompt (YouTube)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMediaType("image");
                setPromptKind("pack");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mediaType === "image" && promptKind === "pack"
                  ? "btn-accent-gradient shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Prompt Pack</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Media preview & upload or YouTube player */}
            <div className="lg:col-span-5 space-y-4">
              {mediaType === "video" ? (
                /* VIDEO PROMPT SOURCE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-red-400" />
                      <span>YouTube Video Player</span>
                    </label>
                    {extractYouTubeId(videoUrl) && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        ID: {extractYouTubeId(videoUrl)}
                      </span>
                    )}
                  </div>

                  {extractYouTubeId(videoUrl) ? (
                    <div className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl flex items-center justify-center mx-auto ${
                      isVideoVertical(aspectRatio, videoUrl) ? "aspect-[9/16] max-h-[420px] max-w-[240px]" : "aspect-video w-full"
                    }`}>
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl) || ""}
                        title="YouTube Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className={`rounded-2xl bg-slate-950 border border-dashed border-white/15 flex flex-col items-center justify-center p-6 text-center text-slate-400 mx-auto ${
                      isVideoVertical(aspectRatio, videoUrl) ? "aspect-[9/16] max-h-[420px] max-w-[240px]" : "aspect-video w-full"
                    }`}>
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2.5 text-red-400 shadow-lg">
                        <Video className="w-6 h-6 stroke-[1.75]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">YouTube Video Preview</span>
                      <span className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                        Paste a YouTube video or shorts link below to preview the stream
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      YouTube Video Link *
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVideoUrl(val);
                        const thumb = getYouTubeThumbnailUrl(val, "maxres") || getYouTubeThumbnailUrl(val, "hq");
                        if (thumb && !videoCoverUrl) {
                          setMediaUrls([thumb]);
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400">
                      Supports YouTube watch links, shorts, and youtu.be shortlinks.
                    </p>
                  </div>

                  {/* Optional Custom Cover Image Upload */}
                  <div className="space-y-2.5 rounded-xl bg-slate-950/70 border border-white/10 p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Custom Cover Image (Optional)</span>
                      </label>
                      {videoCoverUrl ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                          Custom Cover Active
                        </span>
                      ) : extractYouTubeId(videoUrl) ? (
                        <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                          YouTube Auto-Thumbnail
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload an optional custom poster image to display on prompt cards before hover video playback:
                    </p>

                    {/* Hidden File Input */}
                    <input
                      ref={videoCoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setVideoCoverUrl(reader.result.toString());
                            setMediaUrls([reader.result.toString()]);
                            showToast("Custom cover image uploaded", "success");
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      {videoCoverUrl ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/20 flex-shrink-0 shadow-sm">
                          <Image
                            src={videoCoverUrl}
                            alt="Custom cover preview"
                            fill
                            className="object-cover"
                            unoptimized={videoCoverUrl.startsWith("data:")}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVideoCoverUrl("");
                              const ytThumb = getYouTubeThumbnailUrl(videoUrl, "maxres") || getYouTubeThumbnailUrl(videoUrl, "hq");
                              if (ytThumb) setMediaUrls([ytThumb]);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-red-500 text-white transition-colors"
                            title="Remove custom cover image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : extractYouTubeId(videoUrl) ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0 opacity-80">
                          <Image
                            src={getYouTubeThumbnailUrl(videoUrl, "hq") || ""}
                            alt="Default YouTube Thumbnail"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : null}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => videoCoverFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{videoCoverUrl ? "Change Cover Image" : "Upload Cover Image"}</span>
                          </button>

                          {videoCoverUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setVideoCoverUrl("");
                                const ytThumb = getYouTubeThumbnailUrl(videoUrl, "maxres") || getYouTubeThumbnailUrl(videoUrl, "hq");
                                if (ytThumb) setMediaUrls([ytThumb]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
                            >
                              Use YouTube Thumbnail
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={videoCoverInputText}
                            onChange={(e) => setVideoCoverInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (videoCoverInputText.trim()) {
                                  setVideoCoverUrl(videoCoverInputText.trim());
                                  setMediaUrls([videoCoverInputText.trim()]);
                                  setVideoCoverInputText("");
                                  showToast("Custom cover URL applied", "success");
                                }
                              }
                            }}
                            placeholder="Or paste image URL (https://...)"
                            className="flex-1 px-3 py-1.5 rounded-lg glass-input text-[11px] font-mono"
                          />
                          {videoCoverInputText.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setVideoCoverUrl(videoCoverInputText.trim());
                                setMediaUrls([videoCoverInputText.trim()]);
                                setVideoCoverInputText("");
                                showToast("Custom cover URL applied", "success");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
                            >
                              Set
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* IMAGE PROMPT SOURCE */
                <>
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
                      className={`relative rounded-2xl overflow-hidden bg-slate-950 border transition-all aspect-square flex items-center justify-center group ${
                        isDragging
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
                          🖼️ Image
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[var(--accent)] text-white backdrop-blur-md transition-all z-10 shadow-lg cursor-pointer"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[var(--accent)] text-white backdrop-blur-md transition-all z-10 shadow-lg cursor-pointer"
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
                        {promptKind === "pack" ? "Add pack images:" : "Add showcase images:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image(s)</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
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
                                setMediaUrls((prev) => [...prev, url]);
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
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Images Gallery Strip / Manager */}
                  {mediaUrls.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-white/5">
                      <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                        <span>
                          {promptKind === "pack"
                            ? `Pack Gallery (${mediaUrls.length} items)`
                            : `Showcase Images (${mediaUrls.length})`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {promptKind === "pack"
                            ? "Click to edit its prompt"
                            : "All showcase this single prompt"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        {mediaUrls.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectImageIndex(idx)}
                            className={`group/thumb relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition-all ${
                              activeImageIndex === idx
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
                              <div
                                className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black shadow"
                                title="Prompt configured"
                              />
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
                                  className="p-1 rounded-md bg-red-500/80 hover:bg-red-600 text-white cursor-pointer"
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
                                    className="px-1.5 py-0.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[9px] font-bold text-white flex items-center gap-0.5 cursor-pointer"
                                    title="Make Primary Cover"
                                  >
                                    <Star className="w-2.5 h-2.5 fill-white" />
                                    <span>Cover</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {promptKind === "pack" ? "How to Use Instructions (Shared for entire pack)" : "How to Use Instructions (Optional)"}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {promptKind === "pack" ? "One shared guide for all pack prompts" : "Placeholders, reference images, tips"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  placeholder={
                    promptKind === "pack"
                      ? "e.g. • Attach reference image for character consistency&#10;• Replace [SUBJECT] across all prompts&#10;• Recommended settings: --ar 4:5 --v 6.0"
                      : "e.g. • Attach the reference image&#10;• Replace [SUBJECT] with your character&#10;• Upload a character sheet before generating"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono leading-relaxed resize-none text-slate-200"
                />
              </div>

              {/* Reference Images Section */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Reference Images / Input Samples (Optional)</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Showcase source images used to guide style, character, or image-to-video motion
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => refFileInputRef.current?.click()}
                    disabled={isUploadingRef}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] font-semibold flex items-center gap-1.5 border border-sky-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Ref</span>
                  </button>
                  <input
                    ref={refFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleRefFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Paste URL Input for Reference */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="url"
                    value={refUrlInput}
                    onChange={(e) => setRefUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRefUrl();
                      }
                    }}
                    placeholder="Paste reference image URL (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddRefUrl}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Reference Images Strip */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                    {referenceImages.map((refUrl, idx) => (
                      <div
                        key={idx}
                        className="group/ref relative rounded-xl overflow-hidden aspect-square border border-white/15 bg-black"
                      >
                        <Image
                          src={refUrl}
                          alt={`Reference ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={refUrl.startsWith("data:")}
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-sky-300 font-bold">
                          Ref #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRefImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover/ref:opacity-100 transition-opacity cursor-pointer"
                          title="Remove reference"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
