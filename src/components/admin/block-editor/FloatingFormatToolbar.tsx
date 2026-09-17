"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
} from "lucide-react";

interface FloatingFormatToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingFormatToolbar({ containerRef }: FloatingFormatToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setVisible(false);
        return;
      }

      // Check if selection is within our editor container
      if (containerRef.current && containerRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0) {
          setPosition({
            top: rect.top - 48,
            left: rect.left + rect.width / 2,
          });
          setVisible(true);
          return;
        }
      }

      setVisible(false);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [containerRef]);

  if (!visible) return null;

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleLink = () => {
    const url = window.prompt("Enter destination URL (e.g. https://...):");
    if (url) {
      applyFormat("createLink", url);
    }
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-2xl bg-[#141722]/95 border border-white/15 shadow-2xl backdrop-blur-xl text-slate-200 animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      <button
        type="button"
        title="Bold (Ctrl+B)"
        onClick={() => applyFormat("bold")}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Italic (Ctrl+I)"
        onClick={() => applyFormat("italic")}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Underline (Ctrl+U)"
        onClick={() => applyFormat("underline")}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Strikethrough"
        onClick={() => applyFormat("strikeThrough")}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-white/10 mx-1" />

      <button
        type="button"
        title="Inline Code"
        onClick={() => {
          const selection = window.getSelection();
          if (selection && !selection.isCollapsed) {
            applyFormat("insertHTML", `<code>${selection.toString()}</code>`);
          }
        }}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Add Link"
        onClick={handleLink}
        className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        title="Highlight"
        onClick={() => {
          applyFormat("hiliteColor", "rgba(232, 80, 2, 0.3)");
        }}
        className="p-1.5 rounded-lg hover:bg-white/15 text-[#F16001] transition-colors"
      >
        <Highlighter className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
