"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Category, Prompt, SortOption, ViewTab } from "@/types";
import { initialCategories, initialPrompts } from "@/data/seedData";
import { useToast } from "@/components/ui/Toast";
import confetti from "canvas-confetti";
import { slugify } from "@/lib/utils";

interface PromptContextType {
  prompts: Prompt[];
  categories: Category[];
  savedPromptIds: string[];
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedMediaType: "all" | "image" | "video";
  setSelectedMediaType: (type: "all" | "image" | "video") => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  activeModalPrompt: Prompt | null;
  setActiveModalPrompt: (prompt: Prompt | null) => void;
  isSubmitModalOpen: boolean;
  setIsSubmitModalOpen: (open: boolean) => void;
  isAdminAuth: boolean;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  copyPrompt: (prompt: Prompt) => Promise<void>;
  toggleSave: (promptId: string) => void;
  isSaved: (promptId: string) => boolean;
  triggerRandomPrompt: () => Prompt | null;
  addPrompt: (newPrompt: Omit<Prompt, "id" | "slug" | "createdAt" | "updatedAt" | "copyCount" | "viewCount">) => Prompt;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  addCategory: (cat: Omit<Category, "id" | "slug">) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetToDefaults: () => void;
  filteredPrompts: Prompt[];
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

const LOCAL_STORAGE_PROMPTS = "fenz_prompts_v1";
const LOCAL_STORAGE_CATEGORIES = "fenz_categories_v1";
const LOCAL_STORAGE_SAVED = "fenz_saved_v1";
const LOCAL_STORAGE_ADMIN = "fenz_admin_session_v1";

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>([]);
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState<ViewTab>("discover");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "image" | "video">("all");
  const [sortBy, setSortBy] = useState<SortOption>("trending");

  // Modals
  const [activeModalPrompt, setActiveModalPrompt] = useState<Prompt | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Hydrate from LocalStorage
  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem(LOCAL_STORAGE_PROMPTS);
      const storedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      const storedSaved = localStorage.getItem(LOCAL_STORAGE_SAVED);
      const storedAdmin = localStorage.getItem(LOCAL_STORAGE_ADMIN);

      if (storedPrompts) {
        setPrompts(JSON.parse(storedPrompts));
      } else {
        setPrompts(initialPrompts);
        localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(initialPrompts));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(initialCategories);
        localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(initialCategories));
      }

      if (storedSaved) {
        setSavedPromptIds(JSON.parse(storedSaved));
      }

      if (storedAdmin === "true") {
        setIsAdminAuth(true);
      }
    } catch (e) {
      console.error("Failed to load local state", e);
      setPrompts(initialPrompts);
      setCategories(initialCategories);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(prompts));
    } catch (e) {
      console.error("Failed to persist prompts", e);
    }
  }, [prompts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to persist categories", e);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(savedPromptIds));
    } catch (e) {
      console.error("Failed to persist saved prompts", e);
    }
  }, [savedPromptIds, isLoaded]);

  // Auth
  const loginAdmin = useCallback((passcode: string): boolean => {
    // Default admin code is "fenz2026" or "admin"
    if (passcode.trim() === "fenz2026" || passcode.trim().toLowerCase() === "admin") {
      setIsAdminAuth(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN, "true");
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuth(false);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN);
  }, []);

  // Copy Prompt with Toast & Confetti
  const copyPrompt = useCallback(
    async (prompt: Prompt) => {
      try {
        await navigator.clipboard.writeText(prompt.promptText);

        // Burst micro confetti from bottom center
        if (typeof window !== "undefined") {
          try {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.85 },
              colors: ["#8B5CF6", "#C084FC", "#F59E0B", "#38BDF8"],
              disableForReducedMotion: true,
            });
          } catch {
            // Ignore confetti errors
          }
        }

        // Increment copyCount in state
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p
          )
        );

        if (activeModalPrompt && activeModalPrompt.id === prompt.id) {
          setActiveModalPrompt((prev) =>
            prev ? { ...prev, copyCount: (prev.copyCount || 0) + 1 } : null
          );
        }

        showToast("Prompt Copied to Clipboard!", "success", prompt.title);
      } catch (err) {
        console.error("Copy failed", err);
        showToast("Failed to copy", "error", "Please try selecting the text manually.");
      }
    },
    [showToast, activeModalPrompt]
  );

  // Toggle Save / Favorite
  const toggleSave = useCallback(
    (promptId: string) => {
      const exists = savedPromptIds.includes(promptId);
      if (exists) {
        setSavedPromptIds((prev) => prev.filter((id) => id !== promptId));
        showToast("Removed from Saved", "info");
      } else {
        setSavedPromptIds((prev) => [...prev, promptId]);
        showToast("Saved to Favorites", "success", "You can find it in the Saved tab.");
      }
    },
    [savedPromptIds, showToast]
  );

  const isSaved = useCallback(
    (promptId: string) => savedPromptIds.includes(promptId),
    [savedPromptIds]
  );

  // Surprise Me / Random prompt
  const triggerRandomPrompt = useCallback((): Prompt | null => {
    const published = prompts.filter((p) => p.status === "published");
    if (published.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * published.length);
    const chosen = published[randomIndex];
    setActiveModalPrompt(chosen);
    showToast("🎲 Surprise Prompt!", "info", chosen.title);
    return chosen;
  }, [prompts, showToast]);

  // Admin / Creator actions
  const addPrompt = useCallback(
    (
      newPromptData: Omit<
        Prompt,
        "id" | "slug" | "createdAt" | "updatedAt" | "copyCount" | "viewCount"
      >
    ): Prompt => {
      const id = `prompt-${Date.now()}`;
      const slug = slugify(newPromptData.title) || `prompt-${Date.now()}`;
      const newPrompt: Prompt = {
        ...newPromptData,
        id,
        slug,
        copyCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPrompts((prev) => [newPrompt, ...prev]);
      showToast("Prompt Published!", "success", newPrompt.title);
      return newPrompt;
    },
    [showToast]
  );

  const updatePrompt = useCallback(
    (id: string, updates: Partial<Prompt>) => {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...updates,
                slug: updates.title ? slugify(updates.title) : p.slug,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      showToast("Prompt Updated", "success");
    },
    [showToast]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setSavedPromptIds((prev) => prev.filter((savedId) => savedId !== id));
      if (activeModalPrompt?.id === id) {
        setActiveModalPrompt(null);
      }
      showToast("Prompt Removed", "info");
    },
    [activeModalPrompt, showToast]
  );

  const addCategory = useCallback(
    (catData: Omit<Category, "id" | "slug">): Category => {
      const id = `cat-${Date.now()}`;
      const slug = slugify(catData.name);
      const newCat: Category = {
        ...catData,
        id,
        slug,
      };
      setCategories((prev) => [...prev, newCat]);
      showToast("Category Created", "success", newCat.name);
      return newCat;
    },
    [showToast]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                slug: updates.name ? slugify(updates.name) : c.slug,
              }
            : c
        )
      );
      showToast("Category Updated", "success");
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category Deleted", "info");
    },
    [showToast]
  );

  const resetToDefaults = useCallback(() => {
    setPrompts(initialPrompts);
    setCategories(initialCategories);
    setSavedPromptIds([]);
    localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(initialPrompts));
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(initialCategories));
    localStorage.removeItem(LOCAL_STORAGE_SAVED);
    showToast("Reset to Default Prompts", "info");
  }, [showToast]);

  // Compute filtered & sorted prompts for the main showcase
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => {
        // Status check for public site
        if (prompt.status !== "published") return false;

        // ViewTab check
        if (activeTab === "saved" && !savedPromptIds.includes(prompt.id)) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "all" && prompt.categoryId !== selectedCategory) {
          return false;
        }

        // Media Type filter
        if (selectedMediaType !== "all" && prompt.type !== selectedMediaType) {
          return false;
        }

        // Model filter
        if (selectedModel !== "all" && prompt.model !== selectedModel) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = prompt.title.toLowerCase().includes(q);
          const matchPrompt = prompt.promptText.toLowerCase().includes(q);
          const matchModel = prompt.model.toLowerCase().includes(q);
          const matchTags = prompt.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchPrompt && !matchModel && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (activeTab === "trending" || sortBy === "trending" || sortBy === "most-copied") {
          return (b.copyCount || 0) - (a.copyCount || 0);
        }
        if (activeTab === "new" || sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "alphabetical") {
          return a.title.localeCompare(b.title);
        }
        // Default: featured first, then newest
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.copyCount || 0) - (a.copyCount || 0);
      });
  }, [
    prompts,
    activeTab,
    savedPromptIds,
    selectedCategory,
    selectedMediaType,
    selectedModel,
    searchQuery,
    sortBy,
  ]);

  return (
    <PromptContext.Provider
      value={{
        prompts,
        categories,
        savedPromptIds,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedModel,
        setSelectedModel,
        selectedMediaType,
        setSelectedMediaType,
        sortBy,
        setSortBy,
        activeModalPrompt,
        setActiveModalPrompt,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        isAdminAuth,
        loginAdmin,
        logoutAdmin,
        copyPrompt,
        toggleSave,
        isSaved,
        triggerRandomPrompt,
        addPrompt,
        updatePrompt,
        deletePrompt,
        addCategory,
        updateCategory,
        deleteCategory,
        resetToDefaults,
        filteredPrompts,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptStore() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePromptStore must be used within a PromptProvider");
  }
  return context;
}
