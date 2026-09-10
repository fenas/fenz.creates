"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, BookOpen, Save, Upload, Image as ImageIcon } from "lucide-react";
import { Tutorial } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface TutorialEditorModalProps {
  tutorialToEdit: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialEditorModal({
  tutorialToEdit,
  isOpen,
  onClose,
}: TutorialEditorModalProps) {
  const { addTutorial, updateTutorial } = usePromptStore();
  const { showToast } = useToast();

  const isEditing = !!tutorialToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [readTime, setReadTime] = useState("4 min read");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [model, setModel] = useState("Midjourney v6");
  const [mediaUrl, setMediaUrl] = useState("");
  const [contentString, setContentString] = useState("");
  const [tipsString, setTipsString] = useState("");
  const [samplePrompt, setSamplePrompt] = useState("");

  useEffect(() => {
    if (tutorialToEdit) {
      setTitle(tutorialToEdit.title);
      setDescription(tutorialToEdit.description);
      setReadTime(tutorialToEdit.readTime);
      setLevel(tutorialToEdit.level);
      setModel(tutorialToEdit.model);
      setMediaUrl(tutorialToEdit.mediaUrl);
      setContentString(tutorialToEdit.content.join("\n"));
      setTipsString(tutorialToEdit.tips.join("\n"));
      setSamplePrompt(tutorialToEdit.samplePrompt);
    } else {
      setTitle("");
      setDescription("");
      setReadTime("4 min read");
      setLevel("Intermediate");
      setModel("Midjourney v6");
      setMediaUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop");
      setContentString("1. Define focal length and natural lighting.\n2. Use --style raw for organic textures.\n3. Avoid generic buzzwords like 8k or hyperrealistic.");
      setTipsString("Keep stylize parameter between 50 and 250.\nUse natural imperfection keywords.");
      setSamplePrompt("Candid 35mm film photograph of a woman in Tokyo, soft morning window light, natural skin texture, Kodak Portra 400 --ar 16:9 --style raw --v 6.0");
    }
  }, [tutorialToEdit, isOpen]);

  if (!isOpen) return null;

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

    if (!title.trim() || !description.trim() || !samplePrompt.trim()) {
      showToast("Please fill in tutorial title, description, and sample formula", "error");
      return;
    }

    const contentArray = contentString
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tipsArray = tipsString
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      title: title.trim(),
      description: description.trim(),
      readTime,
      level,
      model,
      mediaUrl: mediaUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      content: contentArray.length > 0 ? contentArray : ["Follow structured camera parameters."],
      tips: tipsArray.length > 0 ? tipsArray : ["Test variations of guidance scale."],
      samplePrompt: samplePrompt.trim(),
    };

    if (isEditing && tutorialToEdit) {
      updateTutorial(tutorialToEdit.id, data);
    } else {
      addTutorial(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl rounded-3xl floating-panel bg-[#0d0f17] border border-white/10 shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0c12]/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Tutorial Guide" : "Upload New Tutorial Guide"}
              </h2>
              <p className="text-[11px] text-slate-400">
                Publish a prompt engineering guide with sample blueprints
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tutorial Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mastering Midjourney v6 Photorealism"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Model Focus
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Midjourney v6, Flux.1 Pro, Universal..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Summary Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary explaining what creators will learn in this tutorial..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Skill Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="Beginner" className="bg-[#0f1117]">Beginner</option>
                <option value="Intermediate" className="bg-[#0f1117]">Intermediate</option>
                <option value="Advanced" className="bg-[#0f1117]">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reading Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="4 min read"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Content Takeaways (1 point per line)
            </label>
            <textarea
              rows={3}
              value={contentString}
              onChange={(e) => setContentString(e.target.value)}
              placeholder="1. First lesson point...&#10;2. Second lesson point...&#10;3. Third lesson point..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sample Copyable Formula *
            </label>
            <textarea
              rows={2}
              required
              value={samplePrompt}
              onChange={(e) => setSamplePrompt(e.target.value)}
              placeholder="Full copyable prompt string for readers to test..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-950/50"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Save Tutorial" : "Publish Tutorial"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
