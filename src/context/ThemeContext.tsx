"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export type Theme = "light" | "dark" | "grey" | "system";
export type ResolvedTheme = "light" | "dark" | "grey";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = "arenae_theme_v1";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  
  // Remove all theme classes first
  root.classList.remove("dark", "light", "grey");
  
  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else if (resolved === "grey") {
    root.classList.add("grey");
    root.setAttribute("data-theme", "grey");
    root.style.colorScheme = "light";
  } else {
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage or default to system
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "grey" || savedTheme === "system")) {
        setThemeState(savedTheme);
        const resolved = savedTheme === "system" ? getSystemTheme() : savedTheme;
        setResolvedTheme(resolved);
        applyThemeToDOM(resolved);
      } else {
        const resolved = getSystemTheme();
        setThemeState("system");
        setResolvedTheme(resolved);
        applyThemeToDOM(resolved);
      }
    } catch {
      const resolved = getSystemTheme();
      setThemeState("system");
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    }
  }, []);

  // Update resolvedTheme and document classes whenever theme changes or system preference changes
  useEffect(() => {
    const updateTheme = () => {
      const systemTheme = getSystemTheme();
      const nextResolved: ResolvedTheme =
        theme === "system" ? systemTheme : theme;

      setResolvedTheme(nextResolved);
      applyThemeToDOM(nextResolved);
    };

    updateTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Failed to persist theme:", e);
    }
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);
  }, []);


  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
