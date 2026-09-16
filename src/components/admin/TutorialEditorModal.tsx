"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Save,
  Underline,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Tutorial } from "@/types";
import { usePromptStore } from "@/context/PromptContext";
import { useToast } from "@/components/ui/Toast";

interface TutorialEditorModalProps {
  tutorialToEdit: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultCover =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character] || character);
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") id = url.pathname.slice(1);
    if (host === "youtube.com" || host === "m.youtube.com") {
      id = url.searchParams.get("v") || "";
      if (!id && (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/"))) {
        id = url.pathname.split("/")[2] || "";
      }
    }

    return /^[A-Za-z0-9_-]{6,}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

export function TutorialEditorModal({
  tutorialToEdit,
  isOpen,
  onClose,
}: TutorialEditorModalProps) {
  const { addTutorial, updateTutorial } = usePromptStore();
  const { showToast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(tutorialToEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [readTime, setReadTime] = useState("4 min read");
  const [level, setLevel] = useState<Tutorial["level"]>("Intermediate");
  const [model, setModel] = useState("Midjourney v6");
  const [mediaUrl, setMediaUrl] = useState(defaultCover);
  const [contentString, setContentString] = useState("");
  const [tipsString, setTipsString] = useState("");
  const [samplePrompt, setSamplePrompt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const tutorial = tutorialToEdit;
    setTitle(tutorial?.title || "");
    setDescription(tutorial?.description || "");
    setReadTime(tutorial?.readTime || "4 min read");
    setLevel(tutorial?.level || "Intermediate");
    setModel(tutorial?.model || "Midjourney v6");
    setMediaUrl(tutorial?.mediaUrl || defaultCover);
    setContentString(tutorial?.content.join("\n") || "");
    setTipsString(tutorial?.tips.join("\n") || "");
    setSamplePrompt(tutorial?.samplePrompt || "");
    setBody(tutorial?.body || "");
    setImageUrl("");
    setVideoUrl("");
  }, [tutorialToEdit, isOpen]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== body) {
      editorRef.current.innerHTML = body;
    }
  }, [body, isOpen]);

  if (!isOpen) return null;

  const syncBody = () => setBody(editorRef.current?.innerHTML || "");

  const format = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncBody();
  };

  const insertImage = (url: string) => {
    const source = url.trim();
    if (!source) return;
    format(
      "insertHTML",
      `<figure><img src="${escapeHtml(source)}" alt="Tutorial illustration" /><figcaption>Image caption</figcaption></figure><p><br></p>`
    );
    setImageUrl("");
  };

  const insertYouTube = () => {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (!embedUrl) {
      showToast("Use a valid YouTube video link", "error");
      return;
    }
    format(
      "insertHTML",
      `<figure><iframe src="${embedUrl}" title="YouTube video" allowfullscreen></iframe></figure><p><br></p>`
    );
    setVideoUrl("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") insertImage(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !samplePrompt.trim()) {
      showToast("Please fill in the title, summary, and sample formula", "error");
      return;
    }

    const content = contentString.split("\n").map((item) => item.trim()).filter(Boolean);
    const tips = tipsString.split("\n").map((item) => item.trim()).filter(Boolean);
    const data = {
      title: title.trim(),
      description: description.trim(),
      readTime,
      level,
      model,
      mediaUrl: mediaUrl.trim() || defaultCover,
      content: content.length ? content : ["Follow the workflow below."],
      tips,
      samplePrompt: samplePrompt.trim(),
      body: body.trim(),
    };

    if (tutorialToEdit) updateTutorial(tutorialToEdit.id, data);
    else addTutorial(data);
    onClose();
  };

  const toolbar = [
    { label: "Bold", icon: Bold, command: "bold" },
    { label: "Italic", icon: Italic, command: "italic" },
    { label: "Underline", icon: Underline, command: "underline" },
    { label: "Heading 2", icon: Heading2, command: "formatBlock", value: "h2" },
    { label: "Heading 3", icon: Heading3, command: "formatBlock", value: "h3" },
    { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
    { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
    { label: "Quote", icon: Quote, command: "formatBlock", value: "blockquote" },
    { label: "Code", icon: Code2, command: "formatBlock", value: "pre" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f17] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/90 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">{isEditing ? "Edit workflow" : "Create workflow"}</h2>
            <p className="text-[11px] text-slate-400">Build a publish-ready tutorial with text, images, and YouTube videos.</p>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/5 p-1.5 text-slate-400 hover:bg-white/15 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-300">Title *<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs glass-input" /></label>
            <label className="text-xs font-semibold text-slate-300">AI model focus<input value={model} onChange={(event) => setModel(event.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs glass-input" /></label>
          </div>
          <label className="block text-xs font-semibold text-slate-300">Summary *<textarea required rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 w-full resize-none rounded-xl px-3 py-2 text-xs glass-input" /></label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-300">Level<select value={level} onChange={(event) => setLevel(event.target.value as Tutorial["level"])} className="mt-1 w-full rounded-xl px-3 py-2 text-xs glass-input"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className="text-xs font-semibold text-slate-300">Reading time<input value={readTime} onChange={(event) => setReadTime(event.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs glass-input" /></label>
            <label className="text-xs font-semibold text-slate-300">Cover image URL<input type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 text-xs glass-input" /></label>
          </div>

          <section className="space-y-3 rounded-2xl border border-white/10 bg-[#090b10] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold text-white">Workflow editor</h3><p className="text-[11px] text-slate-400">Use the toolbar or paste formatted text directly into the canvas.</p></div><span className="rounded-full bg-[#E85002]/15 px-2 py-1 text-[10px] font-bold text-[#F16001]">Rich content</span></div>
            <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
              {toolbar.map(({ label, icon: Icon, command, value }) => <button key={label} type="button" title={label} onClick={() => format(command, value)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><Icon className="h-3.5 w-3.5" /></button>)}
              <button type="button" title="Add link" onClick={() => { const url = window.prompt("Paste a link"); if (url) format("createLink", url); }} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><LinkIcon className="h-3.5 w-3.5" /></button>
            </div>
            <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncBody} className="min-h-80 rounded-xl border border-white/10 bg-[#0d0f17] px-5 py-4 text-sm leading-7 text-slate-200 outline-none empty:before:text-slate-500 empty:before:content-[attr(data-placeholder)] [&_a]:text-[#F16001] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#E85002] [&_blockquote]:pl-4 [&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-2xl [&_img]:max-h-130 [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-cover [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-black/50 [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" data-placeholder="Write your tutorial or workflow…" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2"><input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-xs glass-input" /><button type="button" onClick={() => insertImage(imageUrl)} className="rounded-xl bg-white/10 px-3 text-slate-200 hover:bg-white/15"><ImageIcon className="h-4 w-4" /></button><button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-xl bg-white/10 px-3 text-slate-200 hover:bg-white/15"><Upload className="h-4 w-4" /></button><input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></div>
              <div className="flex gap-2"><input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Paste a YouTube link" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-xs glass-input" /><button type="button" onClick={insertYouTube} className="flex items-center gap-1 rounded-xl bg-red-500/15 px-3 text-xs font-semibold text-red-300 hover:bg-red-500/25"><Video className="h-4 w-4" />Embed</button></div>
            </div>
          </section>

          <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><summary className="cursor-pointer text-xs font-bold text-slate-200">Optional legacy cards</summary><div className="mt-4 space-y-4"><label className="block text-xs font-semibold text-slate-300">Key takeaways (one per line)<textarea rows={3} value={contentString} onChange={(event) => setContentString(event.target.value)} className="mt-1 w-full resize-none rounded-xl px-3 py-2 text-xs glass-input" /></label><label className="block text-xs font-semibold text-slate-300">Pro tips (one per line)<textarea rows={2} value={tipsString} onChange={(event) => setTipsString(event.target.value)} className="mt-1 w-full resize-none rounded-xl px-3 py-2 text-xs glass-input" /></label></div></details>
          <label className="block text-xs font-semibold text-slate-300">Sample copyable formula *<textarea required rows={2} value={samplePrompt} onChange={(event) => setSamplePrompt(event.target.value)} className="mt-1 w-full resize-none rounded-xl px-3 py-2 font-mono text-xs glass-input" /></label>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white">Cancel</button><button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E85002] to-[#F16001] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#E85002]/30"><Save className="h-4 w-4" />{isEditing ? "Save workflow" : "Publish workflow"}</button></div>
        </form>
      </div>
    </div>
  );
}
