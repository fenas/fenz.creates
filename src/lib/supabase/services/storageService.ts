import { getSupabaseClient } from "../client";

const DEFAULT_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "arenae-media";

/**
 * Upload a media file directly to Supabase Storage bucket.
 * Falls back to Base64 Data URL if Supabase client is offline.
 */
export async function uploadMediaToSupabase(
  file: File,
  folder: "prompts" | "covers" | "tutorials" | "general" = "general"
): Promise<{ url: string; isRemote: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const timestamp = Date.now();
      const filePath = `${folder}/${timestamp}-${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(filePath, file, {
          cacheControl: "31536000",
          upsert: true,
          contentType: file.type || "image/jpeg",
        });

      if (!error && data?.path) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(data.path);

        if (publicUrl) {
          return { url: publicUrl, isRemote: true };
        }
      } else if (error) {
        console.warn("[Supabase Storage] Upload error, falling back to local:", error.message);
      }
    } catch (err: any) {
      console.warn("[Supabase Storage] Upload exception:", err);
    }
  }

  // Graceful fallback to Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve({ url: reader.result, isRemote: false });
      } else {
        resolve({ url: "", isRemote: false, error: "Failed to read file" });
      }
    };
    reader.onerror = () => {
      resolve({ url: "", isRemote: false, error: "File read error" });
    };
    reader.readAsDataURL(file);
  });
}
