export type MediaType = "image" | "video";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5" | "3:2" | "2:3" | "21:9";

export interface PromptParameters {
  seed?: string;
  cfgScale?: number;
  stylize?: number;
  sampler?: string;
  steps?: number;
  negativePrompt?: string;
  version?: string;
}

export interface Prompt {
  id: string;
  slug: string;
  type: MediaType;
  title: string;
  promptText: string;
  negativePrompt?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  model: string;
  aspectRatio: AspectRatio;
  tags: string[];
  categoryId: string;
  featured: boolean;
  status: "published" | "draft";
  copyCount: number;
  viewCount: number;
  parameters?: PromptParameters;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  description?: string;
}

export type ViewTab = "discover" | "categories" | "trending" | "new" | "saved";

export type SortOption = "trending" | "newest" | "most-copied" | "alphabetical";
