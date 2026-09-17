import { getSupabaseClient } from "../client";

/**
 * Fetch application setting by key
 */
export async function fetchAppSettingFromDb<T = any>(key: string): Promise<T | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

/**
 * Upsert application setting by key
 */
export async function saveAppSettingToDb(key: string, value: any): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("app_settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch banner prompt id specifically
 */
export async function fetchBannerPromptIdFromDb(): Promise<string | null> {
  const val = await fetchAppSettingFromDb<string>("banner_prompt_id");
  return typeof val === "string" ? val : null;
}

/**
 * Save banner prompt id specifically
 */
export async function saveBannerPromptIdToDb(id: string): Promise<boolean> {
  return saveAppSettingToDb("banner_prompt_id", id);
}
