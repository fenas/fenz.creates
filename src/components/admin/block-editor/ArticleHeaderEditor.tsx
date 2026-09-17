"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

import { uploadMediaToSupabase } from "@/lib/supabase";

interface ArticleHeaderEditorProps {
  title: string;
  onChangeTitle: (title: string) => void;
  subtitle: string;
  onChangeSubtitle: (subtitle: string) => void;
  coverImage: string;
  onChangeCoverImage: (url: string) => void;
  coverAlt: string;
  onChangeCoverAlt: (alt: string) => void;
}

export function ArticleHeaderEditor({
  title,
  onChangeTitle,
  subtitle,
  onChangeSubtitle,
  coverImage,
  onChangeCoverImage,
  coverAlt,
  onChangeCoverAlt,
}: ArticleHeaderEditorProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isAltOpen, setIsAltOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please choose a valid image file", "error");
      return;
    }

    setIsUploading(true);
    showToast("Uploading cover image to Supabase Storage...", "info");

    try {
      const { url, isRemote } = await uploadMediaToSupabase(file, "covers");
      if (url) {
        onChangeCoverImage(url);
        showToast(
          isRemote ? "Cover photo stored on Supabase" : "Cover photo loaded",
          "success"
        );
      } else {
        showToast("Could not load image", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChangeCoverImage(urlInput.trim());
      setUrlInput("");
      setIsUrlModalOpen(false);
      showToast("Cover image URL applied", "success");
    }
  };

  return (
    <div className="w-full space-y-6 pt-2 pb-6 border-b border-white/10">
      {/* 1. Cover Image Section */}
      <div className="relative group">
        {coverImage ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl group">
            <Image
              src={coverImage}
              alt={coverAlt || title || "Cover Image"}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
              unoptimized={coverImage.startsWith("data:")}
              priority
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17]/90 via-transparent to-black/30" />

            {/* Top right floating actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={() => setIsAltOpen(!isAltOpen)}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/15 transition-colors"
                title="Edit Alt Text"
              >
                Alt Text {coverAlt ? "✓" : ""}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/15 flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeCoverImage("")}
                className="p-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md border border-red-400/30 transition-colors"
                title="Remove Cover Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom tag info */}
            <div className="absolute bottom-4 left-5 text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white">
                Cover Photo
              </span>
              {coverAlt && (
                <span className="text-slate-300 italic truncate max-w-xs sm:max-w-md">
                  &ldquo;{coverAlt}&rdquo;
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Upload State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center group cursor-pointer ${
              isDragging
                ? "border-[#E85002] bg-[#E85002]/10 scale-[1.01]"
                : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[#E85002]/40 group-hover:bg-[#E85002]/10 transition-all text-slate-400 group-hover:text-[#E85002]">
              <Upload className="w-5 h-5" />
            </div>

            <div className="text-sm font-bold text-slate-200 group-hover:text-white mb-1">
              + Add Cover Image
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Drag & drop a high-resolution banner photo, or click to browse (PNG, JPG, WEBP)
            </p>

            {/* URL shortcut */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsUrlModalOpen(true);
              }}
              className="mt-3 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-400 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <LinkIcon className="w-3 h-3 text-[#E85002]" />
              <span>Or paste image URL</span>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Alt text popover */}
        {isAltOpen && (
          <div className="mt-3 p-3.5 rounded-2xl bg-[#131620] border border-white/10 flex items-center gap-2 animate-in fade-in">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Image Alt Text:
            </span>
            <input
              type="text"
              value={coverAlt}
              onChange={(e) => onChangeCoverAlt(e.target.value)}
              placeholder="Describe this image for accessibility and SEO..."
              className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
            />
            <button
              type="button"
              onClick={() => setIsAltOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>
        )}

        {/* URL Modal Dialog */}
        {isUrlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-3xl bg-[#11131a] border border-white/15 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#E85002]" />
                  <span>Insert Cover Image URL</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyUrl} className="space-y-4">
                <input
                  type="url"
                  required
                  autoFocus
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUrlModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] text-white font-bold text-xs shadow-lg shadow-[#E85002]/30"
                  >
                    Set Cover Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 2. Article Title & Subtitle Section */}
      <div className="space-y-3">
        {/* Title Input */}
        <textarea
          rows={1}
          value={title}
          onChange={(e) => {
            onChangeTitle(e.target.value);
            // Auto-adjust height
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Article title"
          className="w-full bg-transparent text-3xl sm:text-4xl md:text-5xl font-extrabold text-white placeholder:text-slate-600 outline-none border-none resize-none leading-tight tracking-tight focus:ring-0 p-0"
        />

        {/* Subtitle / Short Description Input */}
        <textarea
          rows={2}
          value={subtitle}
          onChange={(e) => {
            onChangeSubtitle(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Add a short description or subtitle..."
          className="w-full bg-transparent text-base sm:text-lg text-slate-400 placeholder:text-slate-600 outline-none border-none resize-none leading-relaxed focus:ring-0 p-0"
        />
      </div>
    </div>
  );
}
