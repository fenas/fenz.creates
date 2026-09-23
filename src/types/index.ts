export type MediaType = "image" | "video";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5" | "3:2" | "2:3" | "21:9" | "" | string;

export interface PromptParameters {
  seed?: string;
  cfgScale?: number;
  stylize?: number;
  sampler?: string;
  steps?: number;
  negativePrompt?: string;
  version?: string;
  pack_items?: unknown;
  prompt_kind?: string;
  [key: string]: unknown;
}

export type PromptKind = "single" | "pack";

export interface PromptPackItem {
  id: string;
  imageUrl: string;
  promptText: string;
  negativePrompt?: string;
  title?: string;
  aspectRatio?: AspectRatio;
  model?: string;
}

export interface Prompt {
  id: string;
  slug: string;
  type: MediaType;
  promptKind?: PromptKind;
  title: string;
  subtitle?: string;
  description?: string;
  promptText: string;
  negativePrompt?: string;
  mediaUrl: string;
  mediaUrls?: string[];
  packItems?: PromptPackItem[];
  thumbnailUrl?: string;
  model: string;
  aspectRatio?: AspectRatio;
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

import { ArticleBlock } from "./blocks";

export * from "./blocks";

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  readTime?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  model?: string;
  mediaUrl: string;
  coverAlt?: string;
  status?: "published" | "draft";
  tags?: string[];
  blocks?: ArticleBlock[];
  content: string[];
  tips: string[];
  samplePrompt: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface ComingSoonFeature {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  eta: string;
  mediaUrl: string;
  highlights: string[];
  createdAt?: string;
}

export type ViewTab = "home" | "prompts" | "coming-soon" | "tutorials" | "discover" | "trending" | "new";

export type SortOption = "trending" | "newest" | "most-copied" | "alphabetical";
