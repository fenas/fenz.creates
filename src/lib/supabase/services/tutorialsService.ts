import { getSupabaseClient } from "../client";
import { Tutorial } from "@/types";

/**
 * Transform DB row to Frontend Tutorial type
 */
export function mapRowToTutorial(row: any): Tutorial {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title || "",
    subtitle: row.subtitle || undefined,
    description: row.description || "",
    readTime: row.read_time || "3 min read",
    level: row.level || "Intermediate",
    model: row.model || "Midjourney v6",
    mediaUrl: row.media_url || "",
    coverAlt: row.cover_alt || undefined,
    status: (row.status as "published" | "draft") || "published",
    tags: Array.isArray(row.tags) ? row.tags : [],
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    content: Array.isArray(row.content) ? row.content : [],
    tips: Array.isArray(row.tips) ? row.tips : [],
    samplePrompt: row.sample_prompt || "",
    body: row.body || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform Frontend Tutorial to DB row
 */
export function mapTutorialToRow(t: Partial<Tutorial>): Record<string, any> {
  const row: Record<string, any> = {};

  if (t.id !== undefined) row.id = t.id;
  if (t.slug !== undefined) row.slug = t.slug;
  if (t.title !== undefined) row.title = t.title;
  if (t.subtitle !== undefined) row.subtitle = t.subtitle;
  if (t.description !== undefined) row.description = t.description;
  if (t.readTime !== undefined) row.read_time = t.readTime;
  if (t.level !== undefined) row.level = t.level;
  if (t.model !== undefined) row.model = t.model;
  if (t.mediaUrl !== undefined) row.media_url = t.mediaUrl;
  if (t.coverAlt !== undefined) row.cover_alt = t.coverAlt;
  if (t.status !== undefined) row.status = t.status;
  if (t.tags !== undefined) row.tags = t.tags;
  if (t.blocks !== undefined) row.blocks = t.blocks;
  if (t.content !== undefined) row.content = t.content;
  if (t.tips !== undefined) row.tips = t.tips;
  if (t.samplePrompt !== undefined) row.sample_prompt = t.samplePrompt;
  if (t.body !== undefined) row.body = t.body;
  if (t.createdAt !== undefined) row.created_at = t.createdAt;
  if (t.updatedAt !== undefined) row.updated_at = t.updatedAt;

  return row;
}

/**
 * Fetch all tutorials/workflows from Supabase
 */
export async function fetchTutorialsFromDb(): Promise<Tutorial[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] fetchTutorials error:", error.message);
      return null;
    }

    return (data || []).map(mapRowToTutorial);
  } catch (err) {
    console.warn("[Supabase] fetchTutorials failed:", err);
    return null;
  }
}

/**
 * Fetch a single tutorial by slug or ID
 */
export async function fetchTutorialBySlugFromDb(slugOrId: string): Promise<Tutorial | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToTutorial(data);
  } catch {
    return null;
  }
}

/**
 * Insert a new tutorial into Supabase
 */
export async function insertTutorialToDb(tutorial: Tutorial): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = mapTutorialToRow(tutorial);
    const { error } = await supabase.from("tutorials").insert(row);
    if (error) {
      console.error("[Supabase] insertTutorial error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] insertTutorial failed:", err);
    return false;
  }
}

/**
 * Update an existing tutorial in Supabase
 */
export async function updateTutorialInDb(id: string, updates: Partial<Tutorial>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = mapTutorialToRow({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    const { error } = await supabase.from("tutorials").update(row).eq("id", id);
    if (error) {
      console.error("[Supabase] updateTutorial error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] updateTutorial failed:", err);
    return false;
  }
}

/**
 * Delete a tutorial from Supabase
 */
export async function deleteTutorialFromDb(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("tutorials").delete().eq("id", id);
    if (error) {
      console.error("[Supabase] deleteTutorial error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] deleteTutorial failed:", err);
    return false;
  }
}
