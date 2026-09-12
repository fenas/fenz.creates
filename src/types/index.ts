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

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  readTime: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  model: string;
  mediaUrl: string;
  content: string[];
  tips: string[];
  samplePrompt: string;
  createdAt?: string;
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
