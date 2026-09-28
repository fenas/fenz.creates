import React from "react";

const THEME_STORAGE_KEY = "arenae_theme_v1";

const themeInitScript = `
(function() {
  try {
    var storageKey = "${THEME_STORAGE_KEY}";
    var storedTheme = localStorage.getItem(storageKey);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolvedTheme = "dark";

    if (storedTheme === "light") {
      resolvedTheme = "light";
    } else if (storedTheme === "dark") {
      resolvedTheme = "dark";
    } else if (storedTheme === "grey") {
      resolvedTheme = "grey";
    } else {
      resolvedTheme = prefersDark ? "dark" : "light";
    }

    var root = document.documentElement;
    root.classList.remove("dark", "light", "grey");
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else if (resolvedTheme === "grey") {
      root.classList.add("grey");
      root.setAttribute("data-theme", "grey");
      root.style.colorScheme = "light";
    } else {
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
      suppressHydrationWarning
    />
  );
}
