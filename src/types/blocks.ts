export type BlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "bulleted-list"
  | "numbered-list"
  | "quote"
  | "image"
  | "video"
  | "code"
  | "divider"
  | "callout"
  | "prompt"
  | "button";

export type CalloutVariant = "tip" | "note" | "warning" | "important";

export type ImageSize = "normal" | "wide" | "full";

export interface ArticleBlock {
  id: string;
  type: BlockType;
  // Generic text content (paragraphs, headings, quotes, etc.)
  content?: string;
  // List items for bulleted or numbered lists
  items?: string[];
  // Image properties
  url?: string;
  caption?: string;
  alt?: string;
  size?: ImageSize;
  // Video properties
  videoType?: "url" | "upload";
  embedUrl?: string;
  // Code block properties
  language?: string;
  // Callout properties
  calloutVariant?: CalloutVariant;
  calloutTitle?: string;
  // Prompt block properties (dedicated Arenae AI Prompt)
  promptTitle?: string;
  promptText?: string;
  promptModel?: string;
  promptAspectRatio?: string;
  promptParameters?: {
    seed?: string;
    stylize?: number | string;
    cfgScale?: number | string;
    version?: string;
    steps?: number | string;
    sampler?: string;
  };
  // Button / Link properties
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: "primary" | "secondary" | "outline";
}
