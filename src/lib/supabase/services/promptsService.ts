import { getSupabaseClient } from "../client";
import { Prompt } from "@/types";

/**
 * Transform DB row to Frontend Prompt type
 */
export function mapRowToPrompt(row: any): Prompt {
  const params = row.parameters || {};
  const packItems =
    row.pack_items ||
    (Array.isArray(params.pack_items) ? params.pack_items : undefined);

  const promptKind =
    row.prompt_kind ||
    params.prompt_kind ||
    (packItems && packItems.length > 1 ? "pack" : "single");

  return {
    id: row.id,
    slug: row.slug || row.id,
    type: (row.type as "image" | "video") || "image",
    promptKind,
    title: row.title || "",
    subtitle: row.subtitle || params.subtitle || row.description || params.description || undefined,
    description: row.description || params.description || row.subtitle || params.subtitle || undefined,
    promptText: row.prompt_text || "",
    negativePrompt: row.negative_prompt || undefined,
    mediaUrl: row.media_url || "",
    mediaUrls: Array.isArray(row.media_urls)
      ? row.media_urls
      : row.media_url
      ? [row.media_url]
      : [],
    packItems,
    thumbnailUrl: row.thumbnail_url || undefined,
    model: row.model || "Midjourney v6",
    aspectRatio: row.aspect_ratio || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    categoryId: row.category_id || "",
    featured: Boolean(row.featured),
    status: (row.status as "published" | "draft") || "published",
    copyCount: Number(row.copy_count || 0),
    viewCount: Number(row.view_count || 0),
    parameters: params,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Transform Frontend Prompt to DB row
 */
export function mapPromptToRow(p: Partial<Prompt>): Record<string, any> {
  const row: Record<string, any> = {};

  if (p.id !== undefined) row.id = p.id;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.type !== undefined) row.type = p.type;
  if (p.title !== undefined) row.title = p.title;
  if (p.promptText !== undefined) row.prompt_text = p.promptText;
  if (p.negativePrompt !== undefined) row.negative_prompt = p.negativePrompt;
  if (p.mediaUrl !== undefined) row.media_url = p.mediaUrl;
  if (p.mediaUrls !== undefined) row.media_urls = p.mediaUrls;
  if (p.thumbnailUrl !== undefined) row.thumbnail_url = p.thumbnailUrl;
  if (p.model !== undefined) row.model = p.model;
  if (p.aspectRatio !== undefined) row.aspect_ratio = p.aspectRatio;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.categoryId !== undefined) row.category_id = p.categoryId;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.status !== undefined) row.status = p.status;
  if (p.copyCount !== undefined) row.copy_count = p.copyCount;
  if (p.viewCount !== undefined) row.view_count = p.viewCount;

  // Store extra metadata (subtitle, description, pack_items, prompt_kind) safely inside parameters JSONB
  const parameters = { ...(p.parameters || {}) };
  if (p.subtitle !== undefined) parameters.subtitle = p.subtitle;
  if (p.description !== undefined) parameters.description = p.description;
  if (p.packItems !== undefined) parameters.pack_items = p.packItems;
  if (p.promptKind !== undefined) parameters.prompt_kind = p.promptKind;
  row.parameters = parameters;

  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;

  return row;
}

/**
 * Fetch all prompts from Supabase
 */
export async function fetchPromptsFromDb(): Promise<Prompt[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] fetchPrompts error:", error.message);
      return null;
    }

    return (data || []).map(mapRowToPrompt);
  } catch (err) {
    console.warn("[Supabase] fetchPrompts failed:", err);
    return null;
  }
}

/**
 * Fetch a single prompt by slug or ID
 */
export async function fetchPromptBySlugFromDb(slugOrId: string): Promise<Prompt | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapRowToPrompt(data);
  } catch {
    return null;
  }
}

/**
 * Insert a new prompt into Supabase
 */
export async function insertPromptToDb(prompt: Prompt): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = mapPromptToRow(prompt);
    const { error } = await supabase.from("prompts").insert(row);
    if (error) {
      console.error("[Supabase] insertPrompt error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] insertPrompt failed:", err);
    return false;
  }
}

/**
 * Update an existing prompt in Supabase
 */
export async function updatePromptInDb(id: string, updates: Partial<Prompt>): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = mapPromptToRow({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    const { error } = await supabase.from("prompts").update(row).eq("id", id);
    if (error) {
      console.error("[Supabase] updatePrompt error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] updatePrompt failed:", err);
    return false;
  }
}

/**
 * Delete a prompt from Supabase
 */
export async function deletePromptFromDb(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) {
      console.error("[Supabase] deletePrompt error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] deletePrompt failed:", err);
    return false;
  }
}

/**
 * Atomically increment prompt copy count
 */
export async function incrementPromptCopyCountInDb(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // Attempt RPC or fallback to select + update
    const { data } = await supabase
      .from("prompts")
      .select("copy_count")
      .eq("id", id)
      .single();

    if (data) {
      const current = Number(data.copy_count || 0);
      await supabase
        .from("prompts")
        .update({ copy_count: current + 1 })
        .eq("id", id);
    }
  } catch {}
}
