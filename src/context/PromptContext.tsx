"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Category, Prompt, SortOption, ViewTab, Tutorial, ComingSoonFeature } from "@/types";
import { initialCategories, initialPrompts } from "@/data/seedData";
import { initialTutorials, initialComingSoon } from "@/data/tutorialsData";
import { useToast } from "@/components/ui/Toast";
import confetti from "canvas-confetti";
import { slugify } from "@/lib/utils";
import {
  isSupabaseConfigured,
  getSupabaseClient,
  signInAdmin,
  signOutAdmin,
  getCurrentAdminSession,
  isAuthorizedAdminUser,
  AUTHORIZED_ADMIN_USER_ID,
  AdminProfile,
  AdminRole,
  fetchPromptsFromDb,
  insertPromptToDb,
  updatePromptInDb,
  deletePromptFromDb,
  incrementPromptCopyCountInDb,
  fetchTutorialsFromDb,
  insertTutorialToDb,
  updateTutorialInDb,
  deleteTutorialFromDb,
  fetchCategoriesFromDb,
  insertCategoryToDb,
  updateCategoryInDb,
  deleteCategoryFromDb,
  fetchComingSoonFromDb,
  insertComingSoonToDb,
  updateComingSoonInDb,
  deleteComingSoonFromDb,
  fetchBannerPromptIdFromDb,
  saveBannerPromptIdToDb,
} from "@/lib/supabase";

interface PromptContextType {
  prompts: Prompt[];
  categories: Category[];
  tutorials: Tutorial[];
  comingSoon: ComingSoonFeature[];
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
  
  // Auth & Roles (Restricted to Authorized Admin ID)
  isAdminAuth: boolean;
  adminEmail: string;
  adminRole: AdminRole;
  adminProfile: AdminProfile | null;
  isDatabaseConnected: boolean;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  
  copyPrompt: (prompt: Prompt) => Promise<void>;
  toggleSave: (promptId: string) => void;
  isSaved: (promptId: string) => boolean;
  triggerRandomPrompt: () => Prompt | null;
  bannerPromptId: string;
  setBannerPromptId: (id: string) => void;
  
  // Prompts CRUD
  addPrompt: (newPrompt: Omit<Prompt, "id" | "slug" | "createdAt" | "updatedAt" | "copyCount" | "viewCount">) => Prompt;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  
  // Categories CRUD
  addCategory: (cat: Omit<Category, "id" | "slug">) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Tutorials CRUD
  addTutorial: (tut: Omit<Tutorial, "id" | "slug"> & { slug?: string }) => Tutorial;
  updateTutorial: (id: string, updates: Partial<Tutorial>) => void;
  deleteTutorial: (id: string) => void;
  
  // Coming Soon CRUD
  addComingSoon: (feat: Omit<ComingSoonFeature, "id" | "slug"> & { slug?: string }) => ComingSoonFeature;
  updateComingSoon: (id: string, updates: Partial<ComingSoonFeature>) => void;
  deleteComingSoon: (id: string) => void;
  
  resetToDefaults: () => void;
  filteredPrompts: Prompt[];
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

const LOCAL_STORAGE_PROMPTS = "fenz_prompts_v6";
const LOCAL_STORAGE_CATEGORIES = "fenz_categories_v4";
const LOCAL_STORAGE_TUTORIALS = "fenz_tutorials_v4";
const LOCAL_STORAGE_COMING_SOON = "fenz_coming_soon_v4";
const LOCAL_STORAGE_SAVED = "fenz_saved_v4";
const LOCAL_STORAGE_ADMIN = "fenz_admin_session_v4";
const LOCAL_STORAGE_BANNER = "fenz_banner_prompt_id_v4";

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [comingSoon, setComingSoon] = useState<ComingSoonFeature[]>([]);
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>([]);
  
  // Admin and Auth State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("fenas.fnz@gmail.com");
  const [adminRole, setAdminRole] = useState<AdminRole>("super_admin");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(false);
  
  const [bannerPromptId, setBannerPromptIdState] = useState<string>("prompt-1");
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState<ViewTab>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "image" | "video">("all");
  const [sortBy, setSortBy] = useState<SortOption>("trending");

  // Modals
  const [activeModalPrompt, setActiveModalPrompt] = useState<Prompt | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // 1. Initial Data Hydration from Supabase (with fallback to LocalStorage/Seed)
  useEffect(() => {
    async function hydrateData() {
      const isConfigured = isSupabaseConfigured();
      setIsDatabaseConnected(isConfigured);

      // Restore LocalStorage defaults first for instantaneous initial paint
      let initialLocalPrompts: Prompt[] = initialPrompts;
      let initialLocalCategories: Category[] = initialCategories;
      let initialLocalTutorials: Tutorial[] = initialTutorials;
      let initialLocalComingSoon: ComingSoonFeature[] = initialComingSoon;

      try {
        const storedPrompts = localStorage.getItem(LOCAL_STORAGE_PROMPTS);
        const storedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
        const storedTutorials = localStorage.getItem(LOCAL_STORAGE_TUTORIALS);
        const storedComingSoon = localStorage.getItem(LOCAL_STORAGE_COMING_SOON);
        const storedSaved = localStorage.getItem(LOCAL_STORAGE_SAVED);
        const storedAdmin = localStorage.getItem(LOCAL_STORAGE_ADMIN);
        const storedBanner = localStorage.getItem(LOCAL_STORAGE_BANNER);

        if (storedBanner) setBannerPromptIdState(storedBanner);
        if (storedPrompts) {
          const parsed = JSON.parse(storedPrompts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialLocalPrompts = parsed;
          }
        }
        setPrompts(initialLocalPrompts);

        if (storedCategories) {
          const parsed = JSON.parse(storedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialLocalCategories = parsed;
          }
        }
        setCategories(initialLocalCategories);

        if (storedTutorials) {
          const parsed = JSON.parse(storedTutorials);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialLocalTutorials = parsed;
          }
        }
        setTutorials(initialLocalTutorials);

        if (storedComingSoon) {
          const parsed = JSON.parse(storedComingSoon);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialLocalComingSoon = parsed;
          }
        }
        setComingSoon(initialLocalComingSoon);

        if (storedSaved) setSavedPromptIds(JSON.parse(storedSaved));
      } catch (e) {
        console.error("Local storage load error:", e);
      } finally {
        setIsLoaded(true);
      }

      // If Supabase is configured, fetch live production data
      if (isConfigured) {
        try {
          // Check Auth Session for strict authorized admin ID
          const { user, profile } = await getCurrentAdminSession();
          if (user && isAuthorizedAdminUser(user.id)) {
            setIsAdminAuth(true);
            setAdminEmail(user.email || "fenas.fnz@gmail.com");
            if (profile) {
              setAdminRole(profile.role);
              setAdminProfile(profile);
            }
          } else {
            setIsAdminAuth(false);
            setAdminProfile(null);
          }

          // Fetch all database tables in parallel
          const [dbPrompts, dbCategories, dbTutorials, dbComingSoon, dbBannerId] =
            await Promise.all([
              fetchPromptsFromDb(),
              fetchCategoriesFromDb(),
              fetchTutorialsFromDb(),
              fetchComingSoonFromDb(),
              fetchBannerPromptIdFromDb(),
            ]);

          if (dbCategories && dbCategories.length > 0) {
            setCategories((currentCats) => {
              const dbIds = new Set(dbCategories.map((c) => c.id));
              const dbSlugs = new Set(dbCategories.map((c) => c.slug));
              const localBase = currentCats.length > 0 ? currentCats : initialLocalCategories;
              const localOnly = localBase.filter(
                (c: Category) => !dbIds.has(c.id) && !dbSlugs.has(c.slug)
              );
              return [...dbCategories, ...localOnly];
            });
          }

          if (dbPrompts && dbPrompts.length > 0) {
            setPrompts((currentPrompts) => {
              const dbIds = new Set(dbPrompts.map((p) => p.id));
              const dbSlugs = new Set(dbPrompts.map((p) => p.slug));
              const localBase = currentPrompts.length > 0 ? currentPrompts : initialLocalPrompts;
              const localOnly = localBase.filter(
                (p: Prompt) => !dbIds.has(p.id) && !dbSlugs.has(p.slug)
              );
              return [...dbPrompts, ...localOnly];
            });
          }

          if (dbTutorials && dbTutorials.length > 0) {
            setTutorials((currentTuts) => {
              const dbIds = new Set(dbTutorials.map((t) => t.id));
              const dbSlugs = new Set(dbTutorials.map((t) => t.slug));
              const localBase = currentTuts.length > 0 ? currentTuts : initialLocalTutorials;
              const localOnly = localBase.filter(
                (t: Tutorial) => !dbIds.has(t.id) && !dbSlugs.has(t.slug)
              );
              return [...dbTutorials, ...localOnly];
            });
          }

          if (dbComingSoon && dbComingSoon.length > 0) {
            setComingSoon((currentCS) => {
              const dbIds = new Set(dbComingSoon.map((cs) => cs.id));
              const dbSlugs = new Set(dbComingSoon.map((cs) => cs.slug));
              const localBase = currentCS.length > 0 ? currentCS : initialLocalComingSoon;
              const localOnly = localBase.filter(
                (cs: ComingSoonFeature) => !dbIds.has(cs.id) && !dbSlugs.has(cs.slug)
              );
              return [...dbComingSoon, ...localOnly];
            });
          }

          if (dbBannerId) {
            setBannerPromptIdState(dbBannerId);
          }
        } catch (err) {
          console.warn("[Supabase] Data sync error:", err);
        }
      }
    }

    hydrateData();

    // Listen to Supabase Auth state changes
    const supabase = getSupabaseClient();
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && isAuthorizedAdminUser(session.user.id)) {
          setIsAdminAuth(true);
          setAdminEmail(session.user.email || "fenas.fnz@gmail.com");
          const { profile } = await getCurrentAdminSession();
          if (profile) {
            setAdminRole(profile.role);
            setAdminProfile(profile);
          }
        } else {
          setIsAdminAuth(false);
          setAdminProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Save cache changes to LocalStorage for offline resilience
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(prompts));
    } catch {}
  }, [prompts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_TUTORIALS, JSON.stringify(tutorials));
    } catch {}
  }, [tutorials, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_COMING_SOON, JSON.stringify(comingSoon));
    } catch {}
  }, [comingSoon, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(savedPromptIds));
    } catch {}
  }, [savedPromptIds, isLoaded]);

  // Auth: Supabase Auth Login strictly allowing only AUTHORIZED_ADMIN_USER_ID
  const loginAdmin = useCallback(
    async (email: string, pass: string): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = pass.trim();

      if (!isSupabaseConfigured()) {
        showToast("Supabase is not configured", "error");
        return false;
      }

      const { user, session, error } = await signInAdmin(cleanEmail, cleanPass);
      if (error) {
        showToast("Authentication Failed", "error", error);
        return false;
      }

      if (user && session && isAuthorizedAdminUser(user.id)) {
        setIsAdminAuth(true);
        setAdminEmail(user.email || cleanEmail);
        const { profile } = await getCurrentAdminSession();
        if (profile) {
          setAdminRole(profile.role);
          setAdminProfile(profile);
        }
        showToast(
          `Welcome back, ${profile?.displayName || "Admin"}!`,
          "success",
          "Administrator session active"
        );
        return true;
      }

      showToast(
        "Access Denied",
        "error",
        "Only the authorized administrator account can access this panel."
      );
      return false;
    },
    [showToast]
  );

  const logoutAdmin = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await signOutAdmin();
    }
    setIsAdminAuth(false);
    setAdminProfile(null);
    showToast("Signed Out", "info", "Admin session ended");
  }, [showToast]);

  const setBannerPromptId = useCallback(
    (id: string) => {
      setBannerPromptIdState(id);
      localStorage.setItem(LOCAL_STORAGE_BANNER, id);
      saveBannerPromptIdToDb(id);
      showToast("Updated Home Hero Banner!", "success");
    },
    [showToast]
  );

  // Copy Prompt with Toast & Confetti
  const copyPrompt = useCallback(
    async (prompt: Prompt) => {
      try {
        await navigator.clipboard.writeText(prompt.promptText);

        if (typeof window !== "undefined") {
          try {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.85 },
              colors: ["#E85002", "#F16001", "#ffffff", "#38BDF8"],
              disableForReducedMotion: true,
            });
          } catch {}
        }

        // Optimistic local update
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

        // Async Database increment
        incrementPromptCopyCountInDb(prompt.id);

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
        showToast("Saved to Favorites", "success");
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

  // Prompts CRUD (Optimistic + Supabase Sync)
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

      setPrompts((prev) => {
        const updated = [newPrompt, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      insertPromptToDb(newPrompt).catch((err) => {
        console.warn("[Supabase] insertPrompt notice:", err);
      });

      showToast("Prompt Published!", "success", newPrompt.title);
      return newPrompt;
    },
    [showToast]
  );

  const updatePrompt = useCallback(
    (id: string, updates: Partial<Prompt>) => {
      setPrompts((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...updates,
                slug: updates.title ? slugify(updates.title) : p.slug,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      updatePromptInDb(id, updates).catch((err) => {
        console.warn("[Supabase] updatePrompt notice:", err);
      });

      showToast("Prompt Updated", "success");
    },
    [showToast]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      setPrompts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_PROMPTS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setSavedPromptIds((prev) => prev.filter((savedId) => savedId !== id));
      if (activeModalPrompt?.id === id) {
        setActiveModalPrompt(null);
      }
      deletePromptFromDb(id).catch((err) => {
        console.warn("[Supabase] deletePrompt notice:", err);
      });
      showToast("Prompt Removed", "info");
    },
    [activeModalPrompt, showToast]
  );

  // Categories CRUD (Optimistic + Supabase Sync)
  const addCategory = useCallback(
    (catData: Omit<Category, "id" | "slug">): Category => {
      const id = `cat-${Date.now()}`;
      const slug = slugify(catData.name);
      const newCat: Category = {
        ...catData,
        id,
        slug,
      };
      setCategories((prev) => {
        const updated = [...prev, newCat];
        try {
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      insertCategoryToDb(newCat).catch((err) => {
        console.warn("[Supabase] insertCategory notice:", err);
      });
      showToast("Category Created", "success", newCat.name);
      return newCat;
    },
    [showToast]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) => {
        const updated = prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                slug: updates.name ? slugify(updates.name) : c.slug,
              }
            : c
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      updateCategoryInDb(id, updates).catch((err) => {
        console.warn("[Supabase] updateCategory notice:", err);
      });
      showToast("Category Updated", "success");
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      deleteCategoryFromDb(id).catch((err) => {
        console.warn("[Supabase] deleteCategory notice:", err);
      });
      showToast("Category Deleted", "info");
    },
    [showToast]
  );

  // Tutorials CRUD (Optimistic + Supabase Sync)
  const addTutorial = useCallback(
    (tutData: Omit<Tutorial, "id" | "slug"> & { slug?: string }): Tutorial => {
      const id = `tut-${Date.now()}`;
      const slug = tutData.slug || slugify(tutData.title) || `tut-${Date.now()}`;
      const newTut: Tutorial = {
        ...tutData,
        id,
        slug,
        status: tutData.status || "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTutorials((prev) => {
        const updated = [newTut, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_TUTORIALS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      insertTutorialToDb(newTut).catch((err) => {
        console.warn("[Supabase] insertTutorial notice:", err);
      });
      showToast("Workflow Guide Published!", "success", newTut.title);
      return newTut;
    },
    [showToast]
  );

  const updateTutorial = useCallback(
    (id: string, updates: Partial<Tutorial>) => {
      setTutorials((prev) => {
        const updated = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                slug: updates.slug || (updates.title ? slugify(updates.title) : t.slug),
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_TUTORIALS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      updateTutorialInDb(id, updates).catch((err) => {
        console.warn("[Supabase] updateTutorial notice:", err);
      });
      showToast("Workflow Guide Updated", "success");
    },
    [showToast]
  );

  const deleteTutorial = useCallback(
    (id: string) => {
      setTutorials((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_TUTORIALS, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      deleteTutorialFromDb(id).catch((err) => {
        console.warn("[Supabase] deleteTutorial notice:", err);
      });
      showToast("Workflow Removed", "info");
    },
    [showToast]
  );

  // Coming Soon CRUD (Optimistic + Supabase Sync)
  const addComingSoon = useCallback(
    (
      featData: Omit<ComingSoonFeature, "id" | "slug"> & { slug?: string }
    ): ComingSoonFeature => {
      const id = `feat-${Date.now()}`;
      const slug = featData.slug || slugify(featData.title) || `feat-${Date.now()}`;
      const newFeat: ComingSoonFeature = {
        ...featData,
        id,
        slug,
        createdAt: new Date().toISOString(),
      };
      setComingSoon((prev) => {
        const updated = [newFeat, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_COMING_SOON, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      insertComingSoonToDb(newFeat).catch((err) => {
        console.warn("[Supabase] insertComingSoon notice:", err);
      });
      showToast("Roadmap Feature Created!", "success", newFeat.title);
      return newFeat;
    },
    [showToast]
  );

  const updateComingSoon = useCallback(
    (id: string, updates: Partial<ComingSoonFeature>) => {
      setComingSoon((prev) => {
        const updated = prev.map((f) =>
          f.id === id
            ? {
                ...f,
                ...updates,
                slug: updates.slug || (updates.title ? slugify(updates.title) : f.slug),
              }
            : f
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_COMING_SOON, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      updateComingSoonInDb(id, updates).catch((err) => {
        console.warn("[Supabase] updateComingSoon notice:", err);
      });
      showToast("Roadmap Item Updated", "success");
    },
    [showToast]
  );

  const deleteComingSoon = useCallback(
    (id: string) => {
      setComingSoon((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_COMING_SOON, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      deleteComingSoonFromDb(id).catch((err) => {
        console.warn("[Supabase] deleteComingSoon notice:", err);
      });
      showToast("Roadmap Item Deleted", "info");
    },
    [showToast]
  );

  const resetToDefaults = useCallback(() => {
    setPrompts(initialPrompts);
    setCategories(initialCategories);
    setTutorials(initialTutorials);
    setComingSoon(initialComingSoon);
    setSavedPromptIds([]);
    setBannerPromptIdState("prompt-1");
    showToast("Reset to Default Seed Data", "info");
  }, [showToast]);

  // Filtered prompts computed
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      // For visitors, only show published prompts
      if (!isAdminAuth && prompt.status === "draft") {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && prompt.categoryId !== selectedCategory) {
        return false;
      }

      // Media type filter
      if (selectedMediaType !== "all" && prompt.type !== selectedMediaType) {
        return false;
      }

      // Model filter
      if (selectedModel !== "all" && prompt.model !== selectedModel) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prompt.title.toLowerCase().includes(query);
        const matchesPrompt = prompt.promptText.toLowerCase().includes(query);
        const matchesModel = prompt.model.toLowerCase().includes(query);
        const matchesTags = prompt.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesPrompt && !matchesModel && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [
    prompts,
    isAdminAuth,
    selectedCategory,
    selectedMediaType,
    selectedModel,
    searchQuery,
  ]);

  const value = useMemo(
    () => ({
      prompts,
      categories,
      tutorials,
      comingSoon,
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
      adminEmail,
      adminRole,
      adminProfile,
      isDatabaseConnected,
      loginAdmin,
      logoutAdmin,
      copyPrompt,
      toggleSave,
      isSaved,
      triggerRandomPrompt,
      bannerPromptId,
      setBannerPromptId,
      addPrompt,
      updatePrompt,
      deletePrompt,
      addCategory,
      updateCategory,
      deleteCategory,
      addTutorial,
      updateTutorial,
      deleteTutorial,
      addComingSoon,
      updateComingSoon,
      deleteComingSoon,
      resetToDefaults,
      filteredPrompts,
    }),
    [
      prompts,
      categories,
      tutorials,
      comingSoon,
      savedPromptIds,
      activeTab,
      selectedCategory,
      searchQuery,
      selectedModel,
      selectedMediaType,
      sortBy,
      activeModalPrompt,
      isSubmitModalOpen,
      isAdminAuth,
      adminEmail,
      adminRole,
      adminProfile,
      isDatabaseConnected,
      loginAdmin,
      logoutAdmin,
      copyPrompt,
      toggleSave,
      isSaved,
      triggerRandomPrompt,
      bannerPromptId,
      setBannerPromptId,
      addPrompt,
      updatePrompt,
      deletePrompt,
      addCategory,
      updateCategory,
      deleteCategory,
      addTutorial,
      updateTutorial,
      deleteTutorial,
      addComingSoon,
      updateComingSoon,
      deleteComingSoon,
      resetToDefaults,
      filteredPrompts,
    ]
  );

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

export function usePromptStore() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePromptStore must be used within a PromptProvider");
  }
  return context;
}
