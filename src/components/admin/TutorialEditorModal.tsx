"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Sliders,
  Sparkles,
  Plus,
  Check,
  RotateCcw,
  BookOpen,
  X,
  Layers,
  Clock,
  Send,
} from "lucide-react";
import { Tutorial } from "@/types";
import { ArticleBlock, BlockType } from "@/types/blocks";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";
import {
  createBlock,
  convertTutorialToBlocks,
  calculateBlocksReadTime,
  extractSummaryFromBlocks,
  convertBlocksToHtml,
} from "@/lib/blockConverter";
import { slugify } from "@/lib/utils";
import { ArticleHeaderEditor } from "./block-editor/ArticleHeaderEditor";
import { BlockItem } from "./block-editor/BlockItem";
import { AddBlockMenu, AddBlockOption } from "./block-editor/AddBlockMenu";
import { FloatingFormatToolbar } from "./block-editor/FloatingFormatToolbar";
import { BlockEditorSettingsDrawer } from "./block-editor/BlockEditorSettingsDrawer";
import { StructuredArticleRenderer } from "@/components/tutorials/StructuredArticleRenderer";

interface TutorialEditorModalProps {
  tutorialToEdit: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultCover = "";

export function TutorialEditorModal({
  tutorialToEdit,
  isOpen,
  onClose,
}: TutorialEditorModalProps) {
  const { addTutorial, updateTutorial, deleteTutorial } = usePromptStore();
  const { showToast } = useToast();

  const isEditing = Boolean(tutorialToEdit);

  // Core Article State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  // Metadata Settings State
  const [model, setModel] = useState("");
  const [level, setLevel] = useState<Tutorial["level"]>("Beginner");
  const [readTime, setReadTime] = useState("1 min read");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [tags, setTags] = useState<string[]>(["Prompting", "Workflow"]);
  const [status, setStatus] = useState<"published" | "draft">("published");

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBottomAddMenuOpen, setIsBottomAddMenuOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize or Reset State
  useEffect(() => {
    if (!isOpen) return;

    if (tutorialToEdit) {
      const initTitle = tutorialToEdit.title || "";
      const initSlug = tutorialToEdit.slug || slugify(initTitle);
      setTitle(initTitle);
      setSubtitle(tutorialToEdit.subtitle || tutorialToEdit.description || "");
      setCoverImage(tutorialToEdit.mediaUrl || "");
      setCoverAlt(tutorialToEdit.coverAlt || "");
      setModel(tutorialToEdit.model || "");
      setLevel(tutorialToEdit.level || "Beginner");
      setReadTime(tutorialToEdit.readTime || "1 min read");
      setSlug(initSlug);
      setIsSlugCustomized(!!tutorialToEdit.slug && tutorialToEdit.slug !== slugify(initTitle));
      setTags(tutorialToEdit.tags || ["Prompting", "Workflow"]);
      setStatus(tutorialToEdit.status || "published");
      setBlocks(convertTutorialToBlocks(tutorialToEdit));
    } else {
      setTitle("");
      setSubtitle("");
      setCoverImage("");
      setCoverAlt("");
      setModel("");
      setLevel("Beginner");
      setReadTime("1 min read");
      setSlug("");
      setIsSlugCustomized(false);
      setTags(["Prompting", "Workflow"]);
      setStatus("published");
      setBlocks([
        createBlock("paragraph", {
          content: "",
        }),
      ]);
    }

    setIsPreviewMode(false);
    setIsSettingsOpen(false);
    setLastSavedTime(null);
  }, [tutorialToEdit, isOpen]);

  // Auto-calculate read time when blocks change
  useEffect(() => {
    if (blocks.length > 0) {
      const calculated = calculateBlocksReadTime(blocks);
      setReadTime(calculated);
    }
  }, [blocks]);

  // Listen for block type conversions triggered by FloatingFormatToolbar (H1, H2, Paragraph)
  useEffect(() => {
    const handleConvertBlockEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ blockId: string; newType: BlockType }>;
      if (!customEvent.detail) return;
      const { blockId, newType } = customEvent.detail;

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              type: newType,
            };
          }
          return b;
        })
      );
    };

    window.addEventListener("editor-convert-block-type", handleConvertBlockEvent);
    return () => window.removeEventListener("editor-convert-block-type", handleConvertBlockEvent);
  }, []);

  // Reactive Title & Auto-Slug Handler
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugCustomized) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    if (!newSlug.trim() || newSlug === slugify(title)) {
      setIsSlugCustomized(false);
    } else {
      setIsSlugCustomized(true);
    }
  };

  const handleResetSlugToAuto = () => {
    const autoSlug = slugify(title);
    setSlug(autoSlug);
    setIsSlugCustomized(false);
    showToast("Slug reset to auto-generated title", "info");
  };

  if (!isOpen) return null;

  // Block Operations
  const handleUpdateBlock = (updated: ArticleBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      setBlocks([createBlock("paragraph", { content: "" })]);
      showToast("Block cleared", "info");
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    showToast("Block removed", "info");
  };

  const handleDuplicateBlock = (block: ArticleBlock, index: number) => {
    const duplicate = {
      ...block,
      id: `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, duplicate);
    setBlocks(next);
    showToast("Block duplicated", "success");
  };

  const handleMoveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setBlocks(next);
  };

  const handleInsertBlock = (option: AddBlockOption, targetIndex: number) => {
    const newBlock = createBlock(option.type, option.initialData);
    const next = [...blocks];
    next.splice(targetIndex + 1, 0, newBlock);
    setBlocks(next);
    showToast(`Added ${option.label}`, "success");
  };

  // Submission handler
  const handleSave = (targetStatus: "published" | "draft" = status) => {
    if (!title.trim()) {
      showToast("Please provide an article title", "error");
      return;
    }

    setIsSaving(true);

    const finalSlug = slug.trim() || slugify(title) || `tutorial-${Date.now()}`;
    const description =
      subtitle.trim() || extractSummaryFromBlocks(blocks, "Aistronaut AI Prompt Masterclass & Workflow Guide");
    const htmlBody = convertBlocksToHtml(blocks);

    // Extract prompt formula if present
    const promptBlock = blocks.find((b) => b.type === "prompt");
    const samplePrompt = promptBlock?.promptText || "";

    const data: Partial<Tutorial> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description,
      readTime,
      level,
      model,
      mediaUrl: coverImage.trim() || defaultCover,
      coverAlt: coverAlt.trim() || title.trim(),
      status: targetStatus,
      tags,
      slug: finalSlug,
      blocks,
      body: htmlBody,
      samplePrompt,
      content: blocks
        .filter((b) => b.type === "paragraph" || b.type === "heading")
        .map((b) => b.content || "")
        .filter(Boolean),
      tips: blocks
        .filter((b) => b.type === "callout")
        .map((b) => b.content || "")
        .filter(Boolean),
    };

    try {
      if (tutorialToEdit) {
        updateTutorial(tutorialToEdit.id, data);
        showToast(
          targetStatus === "published" ? "Workflow Published!" : "Draft Saved!",
          "success",
          `/tutorial/${finalSlug}`
        );
      } else {
        addTutorial(data as any);
        showToast(
          targetStatus === "published" ? "Workflow Published!" : "Draft Created!",
          "success",
          `/tutorial/${finalSlug}`
        );
      }

      setLastSavedTime(new Date().toLocaleTimeString());
      onClose();
    } catch (e) {
      console.error(e);
      showToast("Failed to save workflow", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07080b] text-[#F9F9F9] overflow-hidden select-text">
      {/* 1. Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#090b10]/95 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Studio</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === "published"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
            >
              ● {status === "published" ? "Published" : "Draft"}
            </span>

            {lastSavedTime && (
              <span className="text-[11px] text-slate-500 hidden md:inline">
                Saved at {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${isPreviewMode
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? "Edit Mode" : "Preview"}</span>
          </button>

          {/* Settings Drawer Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Publish Action Button */}
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="btn-accent-gradient flex items-center gap-2 px-5 py-1.5 rounded-xl text-xs font-extrabold shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEditing ? "Update Article" : "Publish Article"}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Writing & Block Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 custom-scrollbar relative"
      >
        {/* Floating Text Formatting Toolbar */}
        <FloatingFormatToolbar containerRef={containerRef} />

        {/* 750px Centered Article Container */}
        <div className="max-w-[760px] w-full mx-auto space-y-8 pb-32">
          {isPreviewMode ? (
            /* LIVE PREVIEW MODE */
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Reader Preview Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="btn-accent-gradient px-3 py-1 rounded-xl text-xs font-bold"
                >
                  Return to Editor
                </button>
              </div>

              {/* Cover */}
              {coverImage && (
                <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
                  <img
                    src={coverImage}
                    alt={coverAlt || title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {title || "Untitled Article"}
                </h1>
                {subtitle && (
                  <p className="text-lg text-slate-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Body */}
              <StructuredArticleRenderer blocks={blocks} />
            </div>
          ) : (
            /* BLOCK EDITING MODE */
            <>
              {/* Top Article Header (Cover, Title, Subtitle) */}
              <ArticleHeaderEditor
                title={title}
                onChangeTitle={handleTitleChange}
                subtitle={subtitle}
                onChangeSubtitle={setSubtitle}
                coverImage={coverImage}
                onChangeCoverImage={setCoverImage}
                coverAlt={coverAlt}
                onChangeCoverAlt={setCoverAlt}
              />

              {/* Block List Section */}
              <div className="space-y-1">
                {blocks.map((block, i) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    index={i}
                    totalBlocks={blocks.length}
                    onChange={handleUpdateBlock}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onDuplicate={() => handleDuplicateBlock(block, i)}
                    onMoveUp={() => handleMoveBlock(i, i - 1)}
                    onMoveDown={() => handleMoveBlock(i, i + 1)}
                    onInsertAfter={(opt) => handleInsertBlock(opt, i)}
                  />
                ))}
              </div>

              {/* Bottom Big Add Block Trigger */}
              <div className="relative pt-6 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsBottomAddMenuOpen(!isBottomAddMenuOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all hover:scale-105 shadow-xl"
                >
                  <Plus className="w-4 h-4 text-[var(--accent)]" />
                  <span>Add Content Block</span>
                </button>

                {isBottomAddMenuOpen && (
                  <div className="absolute bottom-full mb-3 z-50">
                    <AddBlockMenu
                      onSelect={(opt) => {
                        handleInsertBlock(opt, blocks.length - 1);
                        setIsBottomAddMenuOpen(false);
                      }}
                      onClose={() => setIsBottomAddMenuOpen(false)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Settings Right Side Drawer */}
      <BlockEditorSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        model={model}
        onChangeModel={setModel}
        level={level}
        onChangeLevel={setLevel}
        slug={slug}
        onChangeSlug={handleSlugChange}
        isSlugCustomized={isSlugCustomized}
        onResetSlugToAuto={handleResetSlugToAuto}
        articleTitle={title}
        tags={tags}
        onChangeTags={setTags}
        status={status}
        onChangeStatus={setStatus}
        onDeleteArticle={
          tutorialToEdit ? () => deleteTutorial(tutorialToEdit.id) : undefined
        }
      />
    </div>
  );
}
