import { getSupabaseClient } from "../client";
import { ComingSoonFeature } from "@/types";

/**
 * Fetch all coming soon roadmap items from Supabase
 */
export async function fetchComingSoonFromDb(): Promise<ComingSoonFeature[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("coming_soon_features")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] fetchComingSoon error:", error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug || row.id,
      title: row.title,
      description: row.description,
      badge: row.badge || "Coming Soon",
      eta: row.eta || "Q4 2026",
      mediaUrl: row.media_url,
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("[Supabase] fetchComingSoon failed:", err);
    return null;
  }
}

/**
 * Fetch a single coming soon feature by slug or ID
 */
export async function fetchComingSoonBySlugFromDb(slugOrId: string): Promise<ComingSoonFeature | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("coming_soon_features")
      .select("*")
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      slug: data.slug || data.id,
      title: data.title,
      description: data.description,
      badge: data.badge || "Coming Soon",
      eta: data.eta || "Q4 2026",
      mediaUrl: data.media_url,
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Insert a roadmap feature into Supabase
 */
export async function insertComingSoonToDb(feat: ComingSoonFeature): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("coming_soon_features").insert({
      id: feat.id,
      slug: feat.slug,
      title: feat.title,
      description: feat.description,
      badge: feat.badge,
      eta: feat.eta,
      media_url: feat.mediaUrl,
      highlights: feat.highlights || [],
      created_at: feat.createdAt || new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Update a roadmap feature in Supabase
 */
export async function updateComingSoonInDb(
  id: string,
  updates: Partial<ComingSoonFeature>
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row: Record<string, any> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.slug !== undefined) row.slug = updates.slug;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.badge !== undefined) row.badge = updates.badge;
    if (updates.eta !== undefined) row.eta = updates.eta;
    if (updates.mediaUrl !== undefined) row.media_url = updates.mediaUrl;
    if (updates.highlights !== undefined) row.highlights = updates.highlights;

    const { error } = await supabase
      .from("coming_soon_features")
      .update(row)
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a roadmap feature from Supabase
 */
export async function deleteComingSoonFromDb(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("coming_soon_features").delete().or(`id.eq.${id},slug.eq.${id}`);
    return !error;
  } catch {
    return false;
  }
}
