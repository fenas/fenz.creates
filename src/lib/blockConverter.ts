import { ArticleBlock, BlockType } from "@/types/blocks";
import { Tutorial } from "@/types";

export function generateBlockId(): string {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlock(type: BlockType, initialData: Partial<ArticleBlock> = {}): ArticleBlock {
  const base: ArticleBlock = {
    id: generateBlockId(),
    type,
    ...initialData,
  };

  switch (type) {
    case "heading":
      return { ...base, content: initialData.content || "Heading" };
    case "subheading":
      return { ...base, content: initialData.content || "Subheading" };
    case "paragraph":
      return { ...base, content: initialData.content || "" };
    case "quote":
      return { ...base, content: initialData.content || "A profound insight or key rule..." };
    case "bulleted-list":
      return { ...base, items: initialData.items || ["First key point", "Second key point"] };
    case "numbered-list":
      return { ...base, items: initialData.items || ["Step one", "Step two", "Step three"] };
    case "image":
      return {
        ...base,
        url: initialData.url || "",
        caption: initialData.caption || "",
        alt: initialData.alt || "Article illustration",
        size: initialData.size || "normal",
      };
    case "video":
      return {
        ...base,
        videoType: initialData.videoType || "url",
        embedUrl: initialData.embedUrl || "",
        caption: initialData.caption || "",
      };
    case "code":
      return {
        ...base,
        language: initialData.language || "python",
        content: initialData.content || "# Write code or custom prompt syntax here\nimport os\n",
      };
    case "callout":
      return {
        ...base,
        calloutVariant: initialData.calloutVariant || "tip",
        calloutTitle: initialData.calloutTitle || "PRO TIP",
        content: initialData.content || "Use a 16:9 aspect ratio and low stylize values for maximum realism.",
      };
    case "prompt":
      return {
        ...base,
        promptTitle: initialData.promptTitle || "Cinematic Master Formula",
        promptModel: initialData.promptModel || "Midjourney v6",
        promptText: initialData.promptText || "Cinematic 35mm film photograph of a futuristic city in neon rain --ar 16:9 --v 6.0 --style raw",
        promptAspectRatio: initialData.promptAspectRatio || "16:9",
        promptParameters: initialData.promptParameters || {
          stylize: "150",
          version: "v6.0",
        },
      };
    case "divider":
      return { ...base };
    case "button":
      return {
        ...base,
        buttonText: initialData.buttonText || "Explore Prompt Library",
        buttonUrl: initialData.buttonUrl || "/",
        buttonVariant: initialData.buttonVariant || "primary",
      };
    default:
      return base;
  }
}

/**
 * Converts a legacy tutorial into structured blocks.
 */
export function convertTutorialToBlocks(tutorial: Partial<Tutorial>): ArticleBlock[] {
  if (tutorial.blocks && Array.isArray(tutorial.blocks) && tutorial.blocks.length > 0) {
    return tutorial.blocks;
  }

  const blocks: ArticleBlock[] = [];

  // Parse body HTML if present
  if (tutorial.body && typeof window !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(tutorial.body, "text/html");
      const children = Array.from(doc.body.children);

      if (children.length > 0) {
        for (const el of children) {
          const tag = el.tagName.toLowerCase();
          const text = el.textContent?.trim() || "";

          if (tag === "h2") {
            blocks.push(createBlock("heading", { content: text }));
          } else if (tag === "h3") {
            blocks.push(createBlock("subheading", { content: text }));
          } else if (tag === "blockquote") {
            blocks.push(createBlock("quote", { content: text }));
          } else if (tag === "pre") {
            blocks.push(createBlock("code", { content: text }));
          } else if (tag === "ul") {
            const items = Array.from(el.querySelectorAll("li")).map((li) => li.textContent?.trim() || "").filter(Boolean);
            if (items.length > 0) blocks.push(createBlock("bulleted-list", { items }));
          } else if (tag === "ol") {
            const items = Array.from(el.querySelectorAll("li")).map((li) => li.textContent?.trim() || "").filter(Boolean);
            if (items.length > 0) blocks.push(createBlock("numbered-list", { items }));
          } else if (tag === "figure") {
            const img = el.querySelector("img");
            const iframe = el.querySelector("iframe");
            const caption = el.querySelector("figcaption")?.textContent?.trim() || "";

            if (img) {
              blocks.push(createBlock("image", { url: img.getAttribute("src") || "", caption }));
            } else if (iframe) {
              blocks.push(createBlock("video", { embedUrl: iframe.getAttribute("src") || "", caption }));
            }
          } else if (tag === "p" && text) {
            blocks.push(createBlock("paragraph", { content: text }));
          }
        }
      }
    } catch {
      // Fall through to standard fallback
    }
  }

  // If no blocks extracted from body, build from legacy fields
  if (blocks.length === 0) {
    if (tutorial.description) {
      blocks.push(createBlock("paragraph", { content: tutorial.description }));
    }

    if (tutorial.content && tutorial.content.length > 0) {
      blocks.push(createBlock("heading", { content: "Workflow Breakdown" }));
      blocks.push(createBlock("numbered-list", { items: tutorial.content }));
    }

    if (tutorial.samplePrompt) {
      blocks.push(createBlock("heading", { content: "Master Formula Blueprint" }));
      blocks.push(
        createBlock("prompt", {
          promptTitle: tutorial.title ? `${tutorial.title} Prompt` : "Master Prompt",
          promptModel: tutorial.model || "Midjourney v6",
          promptText: tutorial.samplePrompt,
        })
      );
    }

    if (tutorial.tips && tutorial.tips.length > 0) {
      blocks.push(
        createBlock("callout", {
          calloutVariant: "tip",
          calloutTitle: "Pro Tips & Secrets",
          content: tutorial.tips.join("\n• "),
        })
      );
    }
  }

  // Ensure at least one block exists
  if (blocks.length === 0) {
    blocks.push(createBlock("paragraph", { content: "" }));
  }

  return blocks;
}

/**
 * Calculates reading time based on block contents.
 */
export function calculateBlocksReadTime(blocks: ArticleBlock[]): string {
  let wordCount = 0;
  for (const b of blocks) {
    if (b.content) wordCount += b.content.split(/\s+/).filter(Boolean).length;
    if (b.items) {
      for (const item of b.items) {
        wordCount += item.split(/\s+/).filter(Boolean).length;
      }
    }
    if (b.promptText) wordCount += b.promptText.split(/\s+/).filter(Boolean).length;
  }
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Extracts a concise summary from the first text/paragraph block.
 */
export function extractSummaryFromBlocks(blocks: ArticleBlock[], fallback = ""): string {
  for (const b of blocks) {
    if (b.type === "paragraph" && b.content?.trim()) {
      return b.content.trim().slice(0, 200);
    }
    if (b.type === "callout" && b.content?.trim()) {
      return b.content.trim().slice(0, 200);
    }
  }
  return fallback;
}

/**
 * Converts blocks to HTML string for backward compatibility.
 */
export function convertBlocksToHtml(blocks: ArticleBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return `<h2>${escapeHtml(b.content || "")}</h2>`;
        case "subheading":
          return `<h3>${escapeHtml(b.content || "")}</h3>`;
        case "paragraph":
          return `<p>${escapeHtml(b.content || "")}</p>`;
        case "quote":
          return `<blockquote>${escapeHtml(b.content || "")}</blockquote>`;
        case "bulleted-list":
          return `<ul>${(b.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
        case "numbered-list":
          return `<ol>${(b.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
        case "image":
          return `<figure><img src="${escapeHtml(b.url || "")}" alt="${escapeHtml(b.alt || "")}" /><figcaption>${escapeHtml(b.caption || "")}</figcaption></figure>`;
        case "video":
          return `<figure><iframe src="${escapeHtml(b.embedUrl || "")}" title="Video" allowfullscreen></iframe><figcaption>${escapeHtml(b.caption || "")}</figcaption></figure>`;
        case "code":
          return `<pre><code class="language-${escapeHtml(b.language || "text")}">${escapeHtml(b.content || "")}</code></pre>`;
        case "callout":
          return `<blockquote><strong>${escapeHtml(b.calloutTitle || "NOTE")}:</strong> ${escapeHtml(b.content || "")}</blockquote>`;
        case "prompt":
          return `<pre><code>${escapeHtml(b.promptText || "")}</code></pre>`;
        case "divider":
          return `<hr />`;
        case "button":
          return `<p><a href="${escapeHtml(b.buttonUrl || "#")}">${escapeHtml(b.buttonText || "Link")}</a></p>`;
        default:
          return "";
      }
    })
    .join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character] || character);
}
