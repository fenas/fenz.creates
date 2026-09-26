import { getSupabaseClient } from "../client";
import { Category } from "@/types";

/**
 * Fetch all categories from Supabase
 */
export async function fetchCategoriesFromDb(): Promise<Category[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("[Supabase] fetchCategories error:", error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon || "Sparkles",
      order: row.order_index ?? 0,
      description: row.description || undefined,
    }));
  } catch (err) {
    console.warn("[Supabase] fetchCategories failed:", err);
    return null;
  }
}

/**
 * Insert a category into Supabase
 */
export async function insertCategoryToDb(cat: Category): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("categories").insert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description || null,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Update a category in Supabase
 */
export async function updateCategoryInDb(id: string, updates: Partial<Category>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row: Record<string, any> = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.slug !== undefined) row.slug = updates.slug;
    if (updates.icon !== undefined) row.icon = updates.icon;
    if (updates.description !== undefined) row.description = updates.description;

    const { error } = await supabase.from("categories").update(row).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a category from Supabase
 */
export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("categories").delete().or(`id.eq.${id},slug.eq.${id}`);
    return !error;
  } catch {
    return false;
  }
}
