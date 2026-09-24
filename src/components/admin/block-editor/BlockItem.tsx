"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Video,
  Code2,
  ExternalLink,
  Zap,
  MoreHorizontal,
  Maximize2,
  Check,
  RotateCcw,
  Type,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { ArticleBlock, BlockType, CalloutVariant, ImageSize } from "@/types/blocks";
import { AddBlockMenu, AddBlockOption, BLOCK_OPTIONS } from "./AddBlockMenu";
import { useToast } from "@/components/ui/Toast";
import { uploadMediaToSupabase } from "@/lib/supabase";

interface BlockItemProps {
  block: ArticleBlock;
  index: number;
  totalBlocks: number;
  onChange: (updated: ArticleBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertAfter: (option: AddBlockOption) => void;
}

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") id = parsed.pathname.slice(1);
    if (host === "youtube.com" || host === "m.youtube.com") {
      id = parsed.searchParams.get("v") || "";
      if (!id && (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/"))) {
        id = parsed.pathname.split("/")[2] || "";
      }
    }
    if (host === "vimeo.com") {
      id = parsed.pathname.slice(1);
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export function BlockItem({
  block,
  index,
  totalBlocks,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onInsertAfter,
}: BlockItemProps) {
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [isConvertMenuOpen, setIsConvertMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  // Close delete confirmation when clicking outside
  useEffect(() => {
    if (!showDeleteConfirm) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(e.target as Node)) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteConfirm]);

  // Auto-resize textarea
  const handleAutoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Handle Slash Command Trigger inside text blocks
  const handleTextChange = (value: string) => {
    onChange({ ...block, content: value });

    if (value.startsWith("/")) {
      setSlashQuery(value.slice(1));
      setIsSlashMenuOpen(true);
    } else {
      setIsSlashMenuOpen(false);
    }
  };

  // File upload for Image Block with Supabase Storage
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    showToast("Uploading image to Supabase Storage...", "info");
    try {
      const { url, isRemote } = await uploadMediaToSupabase(file, "tutorials");
      if (url) {
        onChange({ ...block, url });
        showToast(isRemote ? "Image uploaded to Supabase" : "Image loaded", "success");
      }
    } catch {
      showToast("Image upload encountered an error", "error");
    }
  };

  // Convert current block type
  const handleConvertType = (opt: AddBlockOption) => {
    onChange({
      ...block,
      type: opt.type,
      ...opt.initialData,
    });
    setIsConvertMenuOpen(false);
    setIsSlashMenuOpen(false);
  };

  return (
    <div
      data-block-id={block.id}
      data-block-type={block.type}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group py-2"
    >
      {/* Block Layout: Left Controls + Content Canvas */}
      <div className="flex items-start gap-2 relative">
        {/* Left Action Gutter - CONSTANTLY VISIBLE */}
        <div className="flex items-center gap-1.5 pt-0.5 -ml-24 sm:-ml-28 w-24 justify-end select-none opacity-80 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200">
          {/* Add Block button (+) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              title="Add block below (+)"
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#11131c] hover:bg-[#E85002]/20 text-slate-400 hover:text-[#F16001] border border-white/10 hover:border-[#E85002]/40 shadow-sm hover:shadow-md hover:shadow-[#E85002]/20 hover:scale-110 active:scale-95 transition-all duration-200 ease-out cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <AddBlockMenu
                  onSelect={(opt) => {
                    onInsertAfter(opt);
                    setIsAddMenuOpen(false);
                  }}
                  onClose={() => setIsAddMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Block Options & Move Menu (⋮⋮) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsConvertMenuOpen(!isConvertMenuOpen)}
              title="Move & options"
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#11131c] hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 hover:border-white/25 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 ease-out cursor-grab"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>

            {isConvertMenuOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-52 p-1.5 rounded-2xl bg-[#11131c] border border-white/10 shadow-2xl backdrop-blur-xl text-xs space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Block Actions
                </div>

                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] text-slate-300">Move block</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        onMoveUp();
                        setIsConvertMenuOpen(false);
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 transition-all hover:scale-105"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === totalBlocks - 1}
                      onClick={() => {
                        onMoveDown();
                        setIsConvertMenuOpen(false);
                      }}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 transition-all hover:scale-105"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onDuplicate();
                    setIsConvertMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate block</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsConvertMenuOpen(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete block...</span>
                </button>

                <div className="h-[1px] bg-white/5 my-1" />
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Turn into...
                </div>

                {BLOCK_OPTIONS.slice(0, 6).map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleConvertType(opt)}
                    className="w-full flex items-center gap-2 px-2.5 py-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-[11px] transition-colors"
                  >
                    <opt.icon className="w-3 h-3 text-[#E85002]" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete Block Button (🗑️) with Warning Confirmation */}
          <div className="relative" ref={deleteConfirmRef}>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              title="Delete block"
              className={`w-7 h-7 flex items-center justify-center rounded-xl border shadow-sm transition-all duration-200 ease-out cursor-pointer ${showDeleteConfirm
                  ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30 scale-105"
                  : "bg-[#11131c] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border-white/10 hover:border-red-500/40 hover:shadow-red-500/20 hover:scale-110 active:scale-95"
                }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Warning Confirmation Popover Message */}
            {showDeleteConfirm && (
              <div className="absolute right-0 bottom-full mb-2.5 z-50 w-60 p-3 rounded-2xl bg-[#11131d] border border-red-500/40 shadow-2xl backdrop-blur-2xl text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-2.5 text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-[11px]">Delete Block?</div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      This will remove this content block from your tutorial guide.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      onDelete();
                    }}
                    className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold shadow-md shadow-red-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Delete Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Canvas */}
        <div className="flex-1 min-w-0">
          {/* 1. PARAGRAPH BLOCK */}
          {block.type === "paragraph" && (
            <div className="relative">
              <textarea
                ref={(el) => {
                  (textRef as any).current = el;
                  handleAutoResize(el);
                }}
                rows={1}
                value={block.content || ""}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type text or enter '/' for commands..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-200 placeholder:text-slate-600 outline-none border-none resize-none leading-relaxed focus:ring-0 p-0"
              />

              {isSlashMenuOpen && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <AddBlockMenu
                    searchFilter={slashQuery}
                    onSelect={(opt) => {
                      onChange({
                        ...block,
                        type: opt.type,
                        content: "",
                        ...opt.initialData,
                      });
                      setIsSlashMenuOpen(false);
                    }}
                    onClose={() => setIsSlashMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. HEADING 1 BLOCK */}
          {block.type === "heading" && (
            <textarea
              ref={handleAutoResize}
              rows={1}
              value={block.content || ""}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Heading 1"
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder:text-slate-600 outline-none border-none resize-none leading-snug tracking-tight focus:ring-0 p-0"
            />
          )}

          {/* 3. SUBHEADING BLOCK */}
          {block.type === "subheading" && (
            <textarea
              ref={handleAutoResize}
              rows={1}
              value={block.content || ""}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Heading 2"
              className="w-full bg-transparent text-lg sm:text-xl font-bold text-slate-100 placeholder:text-slate-600 outline-none border-none resize-none leading-snug focus:ring-0 p-0"
            />
          )}

          {/* 4. QUOTE BLOCK */}
          {block.type === "quote" && (
            <div className="relative border-l-2 border-[#E85002] bg-[#E85002]/5 rounded-r-2xl px-4 py-3">
              <textarea
                ref={handleAutoResize}
                rows={2}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Enter quote or key insight..."
                className="w-full bg-transparent text-sm sm:text-base italic text-slate-200 placeholder:text-slate-500 outline-none border-none resize-none leading-relaxed focus:ring-0 p-0"
              />
            </div>
          )}

          {/* 5. BULLETED LIST BLOCK */}
          {block.type === "bulleted-list" && (
            <div className="space-y-2 pl-2">
              {(block.items || [""]).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#E85002] font-bold text-sm select-none pt-0.5">•</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [""])];
                      newItems[i] = e.target.value;
                      onChange({ ...block, items: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newItems = [...(block.items || [""])];
                        newItems.splice(i + 1, 0, "");
                        onChange({ ...block, items: newItems });
                      } else if (e.key === "Backspace" && item === "" && (block.items || []).length > 1) {
                        e.preventDefault();
                        const newItems = (block.items || []).filter((_, idx) => idx !== i);
                        onChange({ ...block, items: newItems });
                      }
                    }}
                    placeholder="List item..."
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none border-none focus:ring-0 p-0"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 6. NUMBERED LIST BLOCK */}
          {block.type === "numbered-list" && (
            <div className="space-y-2 pl-2">
              {(block.items || [""]).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#E85002] font-mono font-bold text-xs select-none pt-0.5 min-w-[18px]">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [""])];
                      newItems[i] = e.target.value;
                      onChange({ ...block, items: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newItems = [...(block.items || [""])];
                        newItems.splice(i + 1, 0, "");
                        onChange({ ...block, items: newItems });
                      } else if (e.key === "Backspace" && item === "" && (block.items || []).length > 1) {
                        e.preventDefault();
                        const newItems = (block.items || []).filter((_, idx) => idx !== i);
                        onChange({ ...block, items: newItems });
                      }
                    }}
                    placeholder="Step item..."
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none border-none focus:ring-0 p-0"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 7. IMAGE BLOCK */}
          {block.type === "image" && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#090b10] p-4">
              {block.url ? (
                <div className="space-y-2">
                  <div
                    className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 group/img ${block.size === "wide"
                        ? "aspect-[16/9] w-full"
                        : block.size === "full"
                          ? "aspect-[21/9] w-full"
                          : "aspect-[16/10] max-w-xl mx-auto"
                      }`}
                  >
                    <Image
                      src={block.url}
                      alt={block.alt || block.caption || "Image"}
                      fill
                      className="object-cover"
                      unoptimized={block.url.startsWith("data:")}
                    />

                    {/* Image Controls Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/15">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...block,
                            size: block.size === "normal" ? "wide" : block.size === "wide" ? "full" : "normal",
                          })
                        }
                        className="px-2 py-1 rounded-lg hover:bg-white/15 text-[11px] font-semibold text-slate-200"
                        title="Toggle Size (Normal / Wide / Full)"
                      >
                        {block.size?.toUpperCase() || "NORMAL"}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 rounded-lg hover:bg-white/15 text-slate-200"
                        title="Replace Image"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onChange({ ...block, url: "" })}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-red-400"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => onChange({ ...block, caption: e.target.value })}
                    placeholder="Type a caption for this image (optional)..."
                    className="w-full text-center text-xs text-slate-400 placeholder:text-slate-600 bg-transparent outline-none border-none p-1"
                  />
                </div>
              ) : (
                /* Upload Prompt for Image */
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E85002]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Upload Article Image</div>
                      <div className="text-[11px] text-slate-400">Drag file here or browse from device</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                    >
                      Browse File
                    </button>
                    <input
                      type="text"
                      placeholder="Or paste URL..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                          onChange({ ...block, url: (e.target as HTMLInputElement).value.trim() });
                        }
                      }}
                      className="flex-1 sm:w-44 px-2.5 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          )}

          {/* 8. VIDEO BLOCK */}
          {block.type === "video" && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#090b10] p-4">
              {block.embedUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 group/vid">
                    <iframe
                      src={block.embedUrl}
                      title="Video Embed"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => onChange({ ...block, embedUrl: "" })}
                      className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/80 hover:bg-red-500 text-white backdrop-blur-md border border-white/15 opacity-0 group-hover/vid:opacity-100 transition-all"
                      title="Change Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => onChange({ ...block, caption: e.target.value })}
                    placeholder="Video title / caption..."
                    className="w-full text-center text-xs text-slate-400 placeholder:text-slate-600 bg-transparent outline-none border-none p-1"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#E85002]" />
                    <span className="text-xs font-bold text-white">Embed Video (YouTube / Vimeo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value;
                          const embed = getEmbedUrl(val) || val;
                          onChange({ ...block, embedUrl: embed });
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const embed = getEmbedUrl(input.value) || input.value;
                          onChange({ ...block, embedUrl: embed });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#E85002] hover:bg-[#F16001] text-white font-bold text-xs shadow-md"
                    >
                      Embed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 9. PROMPT BLOCK (Dedicated Aistronaut AI Prompt Blueprint) */}
          {block.type === "prompt" && (
            <div className="rounded-2xl border border-[#E85002]/30 bg-gradient-to-br from-[#121016] to-[#090b10] p-4 sm:p-5 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E85002] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md shadow-[#E85002]/30">
                    AI PROMPT FORMULA
                  </span>
                  <input
                    type="text"
                    value={block.promptTitle || ""}
                    onChange={(e) => onChange({ ...block, promptTitle: e.target.value })}
                    placeholder="Formula Name (e.g. Cyberpunk Cinematic Portrait)"
                    className="text-xs font-bold text-white bg-transparent outline-none border-b border-white/10 hover:border-white/30 focus:border-[#E85002] pb-0.5 px-1 min-w-[200px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={block.promptModel || "Midjourney v6"}
                    onChange={(e) => onChange({ ...block, promptModel: e.target.value })}
                    className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 outline-none"
                  >
                    <option value="Midjourney v6" className="bg-[#0f1117]">Midjourney v6</option>
                    <option value="Flux.1 Pro" className="bg-[#0f1117]">Flux.1 Pro</option>
                    <option value="SDXL" className="bg-[#0f1117]">SDXL</option>
                    <option value="Runway Gen-3" className="bg-[#0f1117]">Runway Gen-3</option>
                    <option value="Sora" className="bg-[#0f1117]">OpenAI Sora</option>
                    <option value="Claude 3.7" className="bg-[#0f1117]">Claude 3.7 Sonnet</option>
                    <option value="ChatGPT 4o" className="bg-[#0f1117]">ChatGPT 4o</option>
                  </select>

                  <button
                    type="button"
                    onClick={async () => {
                      if (block.promptText) {
                        await navigator.clipboard.writeText(block.promptText);
                        setCopiedPrompt(true);
                        setTimeout(() => setCopiedPrompt(false), 2000);
                        showToast("Prompt copied to clipboard!", "success");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Monospace Prompt Body */}
              <textarea
                ref={handleAutoResize}
                rows={3}
                value={block.promptText || ""}
                onChange={(e) => onChange({ ...block, promptText: e.target.value })}
                placeholder="Enter the exact master prompt formula here (e.g. Master portrait of... --ar 16:9 --v 6.0)..."
                className="w-full rounded-xl bg-black/60 border border-white/10 p-3.5 text-xs sm:text-sm font-mono text-emerald-300 placeholder:text-slate-600 outline-none resize-none leading-relaxed focus:border-[#E85002]/50"
              />

              {/* Optional parameters row */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="font-mono">Aspect ratio:</span>
                <input
                  type="text"
                  value={block.promptAspectRatio || "16:9"}
                  onChange={(e) => onChange({ ...block, promptAspectRatio: e.target.value })}
                  className="w-16 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 10. CALLOUT BLOCK */}
          {block.type === "callout" && (
            <div
              className={`rounded-2xl p-4 sm:p-5 border space-y-2 transition-all ${block.calloutVariant === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : block.calloutVariant === "important"
                    ? "bg-red-500/10 border-red-500/30 text-red-200"
                    : block.calloutVariant === "note"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                      : "bg-[#E85002]/10 border-[#E85002]/30 text-[#F16001]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={block.calloutVariant || "tip"}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        calloutVariant: e.target.value as CalloutVariant,
                        calloutTitle:
                          e.target.value === "warning"
                            ? "⚠️ WARNING"
                            : e.target.value === "important"
                              ? "⚡ IMPORTANT"
                              : e.target.value === "note"
                                ? "📝 NOTE"
                                : "💡 PRO TIP",
                      })
                    }
                    className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/15 text-[11px] font-bold uppercase tracking-wider outline-none text-white"
                  >
                    <option value="tip" className="bg-[#11131a] text-white">💡 Tip</option>
                    <option value="note" className="bg-[#11131a] text-white">📝 Note</option>
                    <option value="warning" className="bg-[#11131a] text-white">⚠️ Warning</option>
                    <option value="important" className="bg-[#11131a] text-white">⚡ Important</option>
                  </select>

                  <input
                    type="text"
                    value={block.calloutTitle || "PRO TIP"}
                    onChange={(e) => onChange({ ...block, calloutTitle: e.target.value })}
                    className="text-xs font-bold bg-transparent border-none outline-none text-white focus:ring-0 p-0"
                  />
                </div>
              </div>

              <textarea
                ref={handleAutoResize}
                rows={2}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="Enter callout explanation, pro tip, or warning..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-none border-none resize-none leading-relaxed p-0 focus:ring-0"
              />
            </div>
          )}

          {/* 11. CODE BLOCK */}
          {block.type === "code" && (
            <div className="rounded-2xl border border-white/10 bg-[#06080d] p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-[#E85002]" />
                  <select
                    value={block.language || "python"}
                    onChange={(e) => onChange({ ...block, language: e.target.value })}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 outline-none"
                  >
                    <option value="python" className="bg-[#11131a]">Python</option>
                    <option value="javascript" className="bg-[#11131a]">JavaScript</option>
                    <option value="typescript" className="bg-[#11131a]">TypeScript</option>
                    <option value="bash" className="bg-[#11131a]">Bash / CLI</option>
                    <option value="json" className="bg-[#11131a]">JSON</option>
                    <option value="prompt" className="bg-[#11131a]">Prompt Formula</option>
                    <option value="html" className="bg-[#11131a]">HTML / CSS</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (block.content) {
                      await navigator.clipboard.writeText(block.content);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                      showToast("Code copied", "success");
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <textarea
                ref={handleAutoResize}
                rows={4}
                value={block.content || ""}
                onChange={(e) => onChange({ ...block, content: e.target.value })}
                placeholder="# Enter code or prompt script here..."
                className="w-full bg-transparent text-xs font-mono text-cyan-300 placeholder:text-slate-600 outline-none border-none resize-none leading-relaxed p-0 focus:ring-0"
              />
            </div>
          )}

          {/* 12. DIVIDER BLOCK */}
          {block.type === "divider" && (
            <div className="py-4 flex items-center justify-center">
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
            </div>
          )}

          {/* 13. BUTTON BLOCK */}
          {block.type === "button" && (
            <div className="p-3 rounded-2xl border border-white/10 bg-[#090b10] flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={block.buttonText || ""}
                onChange={(e) => onChange({ ...block, buttonText: e.target.value })}
                placeholder="Button Label (e.g. Try Formula in Arena)"
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
              />
              <input
                type="url"
                value={block.buttonUrl || ""}
                onChange={(e) => onChange({ ...block, buttonUrl: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs"
              />
              <select
                value={block.buttonVariant || "primary"}
                onChange={(e) => onChange({ ...block, buttonVariant: e.target.value as any })}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
              >
                <option value="primary" className="bg-[#11131a]">Primary Glow</option>
                <option value="secondary" className="bg-[#11131a]">Glass Pill</option>
                <option value="outline" className="bg-[#11131a]">Border Outline</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Bottom Insertion Bar between blocks */}
      <div className="relative my-1.5 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out">
        <div className="absolute inset-x-0 h-[1px] bg-white/5" />
        <button
          type="button"
          onClick={() => setIsAddMenuOpen(true)}
          title="Insert block here"
          className="relative z-10 w-5 h-5 rounded-full bg-[#181a24] hover:bg-[#E85002] border border-white/15 hover:border-[#E85002] text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 ease-out hover:scale-125 active:scale-95 shadow-lg shadow-black/40 hover:shadow-[#E85002]/30 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
