"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check, CircleDot } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";

interface ThemeOption {
  id: Theme;
  label: string;
  icon: React.ElementType;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: Sun,
    description: "Warm neutral & editorial",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon,
    description: "Charcoal & graphite matte",
  },
  {
    id: "grey",
    label: "Grey",
    icon: CircleDot,
    description: "Studio clay & tactile",
  },
  {
    id: "system",
    label: "System",
    icon: Monitor,
    description: "Follows OS preference",
  },
];

interface ThemeSelectorProps {
  className?: string;
  triggerClassName?: string;
  direction?: "down" | "up" | "right";
  variant?: "default" | "dark-squircle";
}

export function ThemeSelector({
  className = "",
  triggerClassName = "",
  direction = "down",
  variant = "default",
}: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.id === theme);
      const nextIndex =
        e.key === "ArrowDown"
          ? (currentIndex + 1) % THEME_OPTIONS.length
          : (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
      setTheme(THEME_OPTIONS[nextIndex].id);
    }
  };

  // Determine which icon to display on the trigger button
  const ActiveIcon =
    theme === "system"
      ? Monitor
      : resolvedTheme === "light"
      ? Sun
      : resolvedTheme === "grey"
      ? CircleDot
      : Moon;

  // Positioning classes based on direction prop
  const getPositionClasses = () => {
    switch (direction) {
      case "right":
        return "left-full bottom-0 ml-3";
      case "up":
        return "right-0 bottom-full mb-2";
      case "down":
      default:
        return "right-0 top-full mt-2";
    }
  };

  const getTriggerClasses = () => {
    if (triggerClassName) return triggerClassName;

    if (variant === "dark-squircle") {
      return `w-9 h-9 rounded-[14px] flex items-center justify-center transition-all duration-150 cursor-pointer ${
        isOpen
          ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-icon)] shadow-sm border border-[var(--active-btn-border)]"
          : "bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--icon-primary)] shadow-sm border border-[var(--border)]"
      } focus:outline-none`;
    }

    return `h-9 w-9 flex items-center justify-center rounded-[10px] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-all duration-150 cursor-pointer ${
      isOpen ? "border-[var(--border-strong)] bg-[var(--surface-elevated)]" : ""
    } focus:outline-none`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (${resolvedTheme})`}
        className={getTriggerClasses()}
      >
        <ActiveIcon className="w-4 h-4 stroke-[1.75]" />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select website theme"
          className={`absolute ${getPositionClasses()} w-48 p-1.5 rounded-[14px] bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-[0_12px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.12)] z-[9999] animate-in fade-in duration-100`}
        >
          <div className="px-2.5 py-1 text-[9.5px] font-mono tracking-wider uppercase text-[var(--text-muted)] font-semibold">
            Appearance
          </div>

          <div className="space-y-0.5 mt-0.5">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[10px] text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[var(--active-btn-bg)] text-[var(--active-btn-text)] border border-[var(--active-btn-border)] shadow-sm font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent font-normal"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${isSelected ? "text-[var(--active-btn-icon)]" : "text-[var(--icon-secondary)]"}`} />
                    <div className="text-left">
                      <div className="leading-tight font-medium">{opt.label}</div>
                      <div className={`text-[9.5px] ${isSelected ? "text-[var(--active-btn-text)]/75" : "text-[var(--text-muted)]"}`}>
                        {opt.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
