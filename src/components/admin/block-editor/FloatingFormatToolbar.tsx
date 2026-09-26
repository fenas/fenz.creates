"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Code,
  Link as LinkIcon,
  Highlighter,
  Strikethrough,
  Check,
  X,
  Type,
  ExternalLink,
} from "lucide-react";
import { BlockType } from "@/types/blocks";

interface FloatingFormatToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingFormatToolbar({ containerRef }: FloatingFormatToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [activeEl, setActiveEl] = useState<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeBlockType, setActiveBlockType] = useState<BlockType | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  // Track mouse coordinates for exact floating placement above selection
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  const evaluateSelection = useCallback(() => {
    if (!containerRef.current) return;

    // 1. Check if active element is an input/textarea inside the container
    const focused = document.activeElement;
    if (
      focused &&
      containerRef.current.contains(focused) &&
      (focused instanceof HTMLTextAreaElement || focused instanceof HTMLInputElement)
    ) {
      const start = focused.selectionStart ?? 0;
      const end = focused.selectionEnd ?? 0;

      if (start !== end && end > start) {
        const selText = focused.value.substring(start, end);
        if (selText.trim()) {
          setActiveEl(focused);
          setSelectedText(selText);

          // Find enclosing block details
          const blockWrapper = focused.closest("[data-block-id]");
          if (blockWrapper) {
            setActiveBlockId(blockWrapper.getAttribute("data-block-id"));
            setActiveBlockType((blockWrapper.getAttribute("data-block-type") as BlockType) || null);
          } else {
            setActiveBlockId(null);
            setActiveBlockType(null);
          }

          // Compute toolbar position
          const rect = focused.getBoundingClientRect();
          let x = lastPointerPos.current?.x || rect.left + rect.width / 2;
          let y = (lastPointerPos.current?.y || rect.top) - 48;

          // Clamp coordinates within container/viewport
          x = Math.max(160, Math.min(window.innerWidth - 160, x));
          y = Math.max(60, y);

          setPosition({ top: y, left: x });
          setVisible(true);
          return;
        }
      }
    }

    // 2. Fallback to standard window selection
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) {
      if (containerRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0) {
          setActiveEl(null);
          setSelectedText(selection.toString());
          setActiveBlockId(null);
          setActiveBlockType(null);

          let x = rect.left + rect.width / 2;
          let y = rect.top - 48;

          x = Math.max(160, Math.min(window.innerWidth - 160, x));
          y = Math.max(60, y);

          setPosition({ top: y, left: x });
          setVisible(true);
          return;
        }
      }
    }

    // If no active selection and not currently editing link
    if (!showLinkInput) {
      setVisible(false);
    }
  }, [containerRef, showLinkInput]);

  useEffect(() => {
    const handleEvents = () => {
      // Small timeout to allow browser caret update
      setTimeout(evaluateSelection, 10);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseup", handleEvents);
      container.addEventListener("keyup", handleEvents);
      container.addEventListener("select", handleEvents);
    }

    document.addEventListener("selectionchange", handleEvents);

    return () => {
      if (container) {
        container.removeEventListener("mouseup", handleEvents);
        container.removeEventListener("keyup", handleEvents);
        container.removeEventListener("select", handleEvents);
      }
      document.removeEventListener("selectionchange", handleEvents);
    };
  }, [containerRef, evaluateSelection]);

  // Focus link input when opened
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
  }, [showLinkInput]);

  // Apply wrapper formatting (Bold, Italic, Code, Strikethrough, Highlight, Link)
  const applyWrapper = (prefix: string, suffix: string) => {
    if (!activeEl) {
      // Fallback: document.execCommand if contenteditable
      if (prefix === "**") document.execCommand("bold");
      else if (prefix === "*") document.execCommand("italic");
      else if (prefix === "~~") document.execCommand("strikeThrough");
      return;
    }

    const start = activeEl.selectionStart ?? 0;
    const end = activeEl.selectionEnd ?? 0;
    const val = activeEl.value;
    const selected = val.substring(start, end);

    let newText = "";
    let newStart = start;
    let newEnd = end;

    // Case 1: selection already starts with prefix and ends with suffix (e.g. `**text**`)
    if (
      selected.startsWith(prefix) &&
      selected.endsWith(suffix) &&
      selected.length >= prefix.length + suffix.length
    ) {
      const unwrapped = selected.slice(prefix.length, selected.length - suffix.length);
      newText = val.substring(0, start) + unwrapped + val.substring(end);
      newStart = start;
      newEnd = start + unwrapped.length;
    }
    // Case 2: surrounding text contains prefix and suffix (e.g. cursor inside `**|text|**`)
    else if (
      start >= prefix.length &&
      end + suffix.length <= val.length &&
      val.substring(start - prefix.length, start) === prefix &&
      val.substring(end, end + suffix.length) === suffix
    ) {
      newText =
        val.substring(0, start - prefix.length) + selected + val.substring(end + suffix.length);
      newStart = start - prefix.length;
      newEnd = newStart + selected.length;
    }
    // Case 3: Wrap selected text
    else {
      const wrapped = `${prefix}${selected}${suffix}`;
      newText = val.substring(0, start) + wrapped + val.substring(end);
      newStart = start + prefix.length;
      newEnd = newStart + selected.length;
    }

    // Set value React-compatibly
    const prototype =
      activeEl instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (nativeSetter) {
      nativeSetter.call(activeEl, newText);
    } else {
      activeEl.value = newText;
    }

    activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    activeEl.dispatchEvent(new Event("change", { bubbles: true }));

    // Refocus with selection maintained
    setTimeout(() => {
      activeEl.focus();
      activeEl.setSelectionRange(newStart, newEnd);
    }, 20);
  };

  // Convert current block type (Heading 1, Heading 2, Paragraph)
  const handleConvertBlockType = (newType: BlockType) => {
    if (!activeBlockId) return;

    // Dispatch global event caught by TutorialEditorModal
    window.dispatchEvent(
      new CustomEvent("editor-convert-block-type", {
        detail: {
          blockId: activeBlockId,
          newType,
        },
      })
    );

    setActiveBlockType(newType);
  };

  // Handle Link Insertion
  const handleApplyLink = () => {
    const formattedUrl = linkUrl.trim();
    if (!formattedUrl) {
      setShowLinkInput(false);
      return;
    }

    const finalUrl =
      formattedUrl.startsWith("http://") ||
        formattedUrl.startsWith("https://") ||
        formattedUrl.startsWith("/") ||
        formattedUrl.startsWith("#")
        ? formattedUrl
        : `https://${formattedUrl}`;

    applyWrapper("[", `](${finalUrl})`);
    setShowLinkInput(false);
    setLinkUrl("");
  };

  // Keyboard shortcut listener for active editor inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      const target = document.activeElement;
      if (
        !target ||
        !containerRef.current?.contains(target) ||
        (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement))
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "b") {
        e.preventDefault();
        applyWrapper("**", "**");
      } else if (key === "i") {
        e.preventDefault();
        applyWrapper("*", "*");
      } else if (key === "k") {
        e.preventDefault();
        setShowLinkInput(true);
      } else if (key === "e" || e.key === "`") {
        e.preventDefault();
        applyWrapper("`", "`");
      } else if (e.shiftKey && (key === "x" || key === "s")) {
        e.preventDefault();
        applyWrapper("~~", "~~");
      } else if (e.shiftKey && key === "h") {
        e.preventDefault();
        applyWrapper("<mark>", "</mark>");
      } else if (e.shiftKey && e.key === "1") {
        e.preventDefault();
        handleConvertBlockType("heading");
      } else if (e.shiftKey && e.key === "2") {
        e.preventDefault();
        handleConvertBlockType("subheading");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, applyWrapper, handleConvertBlockType]);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      style={{
        top: `${Math.max(12, position.top)}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="fixed z-50 flex items-center gap-1 p-1 rounded-2xl bg-[#0f1118]/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-slate-200 animate-in fade-in zoom-in-95 duration-150 select-none ring-1 ring-black/40"
      onMouseDown={(e) => {
        // Prevent losing textarea focus and selection when clicking toolbar buttons
        if ((e.target as HTMLElement).tagName !== "INPUT") {
          e.preventDefault();
        }
      }}
    >
      {showLinkInput ? (
        /* Inline Link Form */
        <div className="flex items-center gap-1.5 px-1 py-0.5 animate-in fade-in duration-100">
          <LinkIcon className="w-3.5 h-3.5 text-[var(--accent)] ml-1 flex-shrink-0" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyLink();
              } else if (e.key === "Escape") {
                setShowLinkInput(false);
              }
            }}
            placeholder="Paste or type URL (e.g. https://...)"
            className="w-56 px-2 py-1 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="p-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors"
            title="Apply Link (Enter)"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Main Formatting Tools */
        <>
          {/* Block Type Quick Converters: H1 / H2 / Paragraph */}
          {activeBlockId && (
            <>
              <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 mr-0.5">
                <button
                  type="button"
                  title="Convert to Heading 1 (Ctrl+Shift+1)"
                  onClick={() =>
                    handleConvertBlockType(activeBlockType === "heading" ? "paragraph" : "heading")
                  }
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black transition-all ${activeBlockType === "heading"
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Heading1 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">H1</span>
                </button>

                <button
                  type="button"
                  title="Convert to Heading 2 (Ctrl+Shift+2)"
                  onClick={() =>
                    handleConvertBlockType(
                      activeBlockType === "subheading" ? "paragraph" : "subheading"
                    )
                  }
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black transition-all ${activeBlockType === "subheading"
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Heading2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">H2</span>
                </button>

                {activeBlockType !== "paragraph" && (
                  <button
                    type="button"
                    title="Convert to Paragraph"
                    onClick={() => handleConvertBlockType("paragraph")}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Type className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-[1px] h-4 bg-white/15 mx-0.5" />
            </>
          )}

          {/* 1. Bold Button */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => applyWrapper("**", "**")}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <Bold className="w-3.5 h-3.5 font-bold" />
          </button>

          {/* 2. Italic Button */}
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => applyWrapper("*", "*")}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* 3. Inline Code Button */}
          <button
            type="button"
            title="Inline Code (Ctrl+E)"
            onClick={() => applyWrapper("`", "`")}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* 4. Strikethrough Button */}
          <button
            type="button"
            title="Strikethrough (Ctrl+Shift+X)"
            onClick={() => applyWrapper("~~", "~~")}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* 5. Highlight Button */}
          <button
            type="button"
            title="Highlight (Ctrl+Shift+H)"
            onClick={() => applyWrapper("<mark>", "</mark>")}
            className="p-1.5 rounded-xl hover:bg-[var(--accent-soft)] text-[var(--accent)] transition-all active:scale-95"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          {/* 6. Link Button */}
          <button
            type="button"
            title="Add Link (Ctrl+K)"
            onClick={() => {
              setLinkUrl("");
              setShowLinkInput(true);
            }}
            className="p-1.5 rounded-xl hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
