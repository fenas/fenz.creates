/**
 * YouTube URL Parser & Embed Helper
 */

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  
  // 1. Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. youtu.be/ID
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) return youtuBeMatch[1];

  // 3. /shorts/ID, /live/ID, /embed/ID, /v/ID
  const pathMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/(?:shorts|live|embed|v)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch) return pathMatch[1];

  // 4. ?v=ID or &v=ID
  const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vParamMatch) return vParamMatch[1];

  // 5. General regex match
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  if (match) return match[1];

  return null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return Boolean(extractYouTubeId(url));
}

export function isYouTubeShorts(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.toLowerCase().includes("/shorts/");
}

export function isVideoVertical(
  aspectRatio?: string | null | undefined,
  url?: string | null | undefined
): boolean {
  if (url && isYouTubeShorts(url)) return true;
  if (!aspectRatio) return false;
  const normalized = aspectRatio.trim().toLowerCase();
  return (
    normalized === "9:16" ||
    normalized === "4:5" ||
    normalized === "2:3" ||
    normalized === "portrait" ||
    normalized === "vertical"
  );
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  controls?: boolean;
  mute?: boolean;
  loop?: boolean;
}

export function getYouTubeEmbedUrl(
  urlOrId: string | null | undefined,
  autoplayOrOptions: boolean | YouTubeEmbedOptions = false
): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;

  const options: YouTubeEmbedOptions =
    typeof autoplayOrOptions === "boolean"
      ? { autoplay: autoplayOrOptions }
      : autoplayOrOptions;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    controls: options.controls !== false ? "1" : "0",
  });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  if (options.mute) {
    params.set("mute", "1");
  }
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * Returns a muted, looping, clean borderless embed URL for card hover previews
 */
export function getYouTubeHoverPreviewUrl(urlOrId: string | null | undefined): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;

  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&showinfo=0&disablekb=1&fs=0`;
}

export function getYouTubeThumbnailUrl(
  urlOrId: string | null | undefined,
  quality: "hq" | "maxres" = "hq"
): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  return quality === "maxres"
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
