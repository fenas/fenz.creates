"use client";

import React, { useEffect, useState } from "react";

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.slice(1);
    if (host === "youtube.com" || host === "m.youtube.com") {
      id = url.searchParams.get("v") || url.pathname.split("/")[2] || "";
    }
    if (host === "youtube-nocookie.com") id = url.pathname.split("/")[2] || "";
    return /^[A-Za-z0-9_-]{6,}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

function isSafeImageSource(source: string) {
  return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);base64,)/i.test(source);
}

function sanitizeTutorialHtml(html: string) {
  const source = new DOMParser().parseFromString(html, "text/html");
  const output = document.createElement("div");
  const allowed = new Set(["p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "figure", "figcaption", "iframe", "hr"]);

  const copy = (node: Node, parent: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent || ""));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (!allowed.has(tag)) {
      element.childNodes.forEach((child) => copy(child, parent));
      return;
    }

    if (tag === "img") {
      const src = element.getAttribute("src") || "";
      if (!isSafeImageSource(src)) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = element.getAttribute("alt") || "Tutorial illustration";
      parent.appendChild(image);
      return;
    }

    if (tag === "iframe") {
      const embedUrl = getYouTubeEmbedUrl(element.getAttribute("src") || "");
      if (!embedUrl) return;
      const frame = document.createElement("iframe");
      frame.src = embedUrl;
      frame.title = "YouTube video";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      frame.loading = "lazy";
      parent.appendChild(frame);
      return;
    }

    const safeElement = document.createElement(tag);
    if (tag === "a") {
      const href = element.getAttribute("href") || "";
      if (/^https?:\/\//i.test(href)) {
        safeElement.setAttribute("href", href);
        safeElement.setAttribute("target", "_blank");
        safeElement.setAttribute("rel", "noreferrer noopener");
      }
    }
    element.childNodes.forEach((child) => copy(child, safeElement));
    parent.appendChild(safeElement);
  };

  source.body.childNodes.forEach((node) => copy(node, output));
  return output.innerHTML;
}

export function RichTutorialContent({ body }: { body: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(sanitizeTutorialHtml(body));
  }, [body]);

  if (!html) return null;

  return (
    <section
      className="tutorial-rich-content space-y-5 text-sm leading-7 text-slate-200 [&_a]:font-semibold [&_a]:text-[#F16001] [&_a]:underline [&_blockquote]:rounded-r-2xl [&_blockquote]:border-l-2 [&_blockquote]:border-[#E85002] [&_blockquote]:bg-[#E85002]/5 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_figure]:my-7 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-3xl [&_iframe]:border [&_iframe]:border-white/10 [&_img]:max-h-140 [&_img]:w-full [&_img]:rounded-3xl [&_img]:border [&_img]:border-white/10 [&_img]:object-cover [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-black/60 [&_pre]:p-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
