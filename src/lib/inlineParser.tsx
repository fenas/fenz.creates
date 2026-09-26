import React from "react";

/**
 * Parses inline markdown/HTML tags and returns rich React elements.
 * Supports:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Bold + Italic: ***text*** or ___text___
 * - Inline code: `code`
 * - Strikethrough: ~~text~~
 * - Highlight: ==text== or <mark>text</mark>
 * - Links: [label](url)
 * - Underline: <u>text</u>
 */
export function renderFormattedContent(text: string | undefined | null): React.ReactNode {
  if (!text) return null;

  // Quick check if there is any markdown/formatting character
  if (!/[*_`~=\[<]/.test(text)) {
    return text;
  }

  return parseInlineMarkdown(text);
}

function parseInlineMarkdown(input: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = input;
  let keyIdx = 0;

  // Regex pattern matching inline elements
  // Order matters: match larger/more specific tokens first
  const inlineRegex =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*\*([^*]+)\*\*\*|___([^_]+)___|\*\*([^*]+)\*\*|__([^_]+)__|==([^=]+)==|<mark>([^<]+)<\/mark>|`([^`]+)`|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_|<u>([^<]+)<\/u>)/;

  while (remaining.length > 0) {
    const match = remaining.match(inlineRegex);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    // Text before match
    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const fullMatch = match[0];
    const key = `fmt-${keyIdx++}`;

    if (fullMatch.startsWith("[") && match[2] && match[3]) {
      // Link [text](url)
      const linkText = match[2];
      const linkUrl = match[3].trim();
      const isExternal = linkUrl.startsWith("http://") || linkUrl.startsWith("https://");

      nodes.push(
        <a
          key={key}
          href={linkUrl}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {parseInlineMarkdown(linkText)}
        </a>
      );
    } else if (fullMatch.startsWith("***") || fullMatch.startsWith("___")) {
      // Bold + Italic
      const inner = match[4] || match[5] || "";
      nodes.push(
        <strong key={key} className="font-bold">
          <em className="italic">{parseInlineMarkdown(inner)}</em>
        </strong>
      );
    } else if (fullMatch.startsWith("**") || fullMatch.startsWith("__")) {
      // Bold
      const inner = match[6] || match[7] || "";
      nodes.push(
        <strong key={key} className="font-bold text-[var(--text-primary)]">
          {parseInlineMarkdown(inner)}
        </strong>
      );
    } else if (fullMatch.startsWith("==") || fullMatch.startsWith("<mark>")) {
      // Highlight
      const inner = match[8] || match[9] || "";
      nodes.push(
        <mark
          key={key}
          className="bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded-md font-medium"
        >
          {parseInlineMarkdown(inner)}
        </mark>
      );
    } else if (fullMatch.startsWith("`")) {
      // Inline Code
      const inner = match[10] || "";
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[0.88em] border border-[var(--accent)]/20"
        >
          {inner}
        </code>
      );
    } else if (fullMatch.startsWith("~~")) {
      // Strikethrough
      const inner = match[11] || "";
      nodes.push(
        <del key={key} className="line-through opacity-75">
          {parseInlineMarkdown(inner)}
        </del>
      );
    } else if (fullMatch.startsWith("<u>")) {
      // Underline
      const inner = match[14] || "";
      nodes.push(
        <u key={key} className="underline underline-offset-4 decoration-white/40">
          {parseInlineMarkdown(inner)}
        </u>
      );
    } else if (fullMatch.startsWith("*") || fullMatch.startsWith("_")) {
      // Italic
      const inner = match[12] || match[13] || "";
      nodes.push(
        <em key={key} className="italic text-inherit">
          {parseInlineMarkdown(inner)}
        </em>
      );
    } else {
      nodes.push(fullMatch);
    }

    remaining = remaining.slice(match.index + fullMatch.length);
  }

  return nodes;
}
