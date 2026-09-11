"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Clock, Save } from "lucide-react";
import { ComingSoonFeature } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface ComingSoonEditorModalProps {
  featureToEdit: ComingSoonFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonEditorModal({
  featureToEdit,
  isOpen,
  onClose,
}: ComingSoonEditorModalProps) {
  const { addComingSoon, updateComingSoon } = usePromptStore();
  const { showToast } = useToast();

  const isEditing = !!featureToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("In Development");
  const [eta, setEta] = useState("Q4 2026");
  const [mediaUrl, setMediaUrl] = useState("");
  const [highlightsString, setHighlightsString] = useState("");

  useEffect(() => {
    if (featureToEdit) {
      setTitle(featureToEdit.title);
      setDescription(featureToEdit.description);
      setBadge(featureToEdit.badge);
      setEta(featureToEdit.eta);
      setMediaUrl(featureToEdit.mediaUrl);
      setHighlightsString(featureToEdit.highlights.join("\n"));
    } else {
      setTitle("");
      setDescription("");
      setBadge("In Development");
      setEta("Q4 2026");
      setMediaUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop");
      setHighlightsString("Real-time video player\nCamera motion prompt generator\nMulti-engine presets");
    }
  }, [featureToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showToast("Title and description are required", "error");
      return;
    }

    const highlightsArray = highlightsString
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const data = {
      title: title.trim(),
      description: description.trim(),
      badge: badge.trim() || "In Development",
      eta: eta.trim() || "Soon",
      mediaUrl: mediaUrl.trim() || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
      highlights: highlightsArray.length > 0 ? highlightsArray : ["Upcoming release."],
    };

    if (isEditing && featureToEdit) {
      updateComingSoon(featureToEdit.id, data);
    } else {
      addComingSoon(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl floating-panel bg-[#0d0f17] border border-white/10 shadow-2xl z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0c12]/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E85002]/20 border border-[#E85002]/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#E85002]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Roadmap Feature" : "Upload Coming Soon Feature"}
              </h2>
              <p className="text-[11px] text-[#A7A7A7]">
                Announce upcoming tools, video prompt engines, and roadmap items
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Feature Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Video Prompt Studio (Runway Gen-3 / Sora)"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What functionality will this feature provide creators..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Badge / Status
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="In Development, Beta, Planned..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Release (ETA)
              </label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="Q4 2026, Next Month..."
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preview Artwork URL
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
              Feature Highlights (1 per line)
            </label>
            <textarea
              rows={3}
              value={highlightsString}
              onChange={(e) => setHighlightsString(e.target.value)}
              placeholder="4K Video Previews&#10;Camera Pan/Orbit Controls&#10;Motion Presets"
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#F16001] hover:to-[#E85002] text-white font-bold text-xs shadow-lg shadow-[#E85002]/40"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Save Feature" : "Publish to Roadmap"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
