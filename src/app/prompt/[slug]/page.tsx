import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialPrompts, initialCategories } from "@/data/seedData";
import { PromptDetailClient } from "./PromptDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return initialPrompts.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prompt = initialPrompts.find((p) => p.slug === slug);

  if (!prompt) {
    return {
      title: "Prompt Not Found - fenz.creates",
    };
  }

  const snippet = prompt.promptText.slice(0, 160) + "...";

  return {
    title: `${prompt.title} — AI Prompt (${prompt.model}) | fenz.creates`,
    description: snippet,
    openGraph: {
      title: `${prompt.title} — AI Prompt for ${prompt.model}`,
      description: snippet,
      images: [
        {
          url: prompt.mediaUrl,
          width: 1200,
          height: 630,
          alt: prompt.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: snippet,
      images: [prompt.mediaUrl],
    },
  };
}

export default async function PromptPage({ params }: Props) {
  const { slug } = await params;
  const initialPrompt = initialPrompts.find((p) => p.slug === slug);

  if (!initialPrompt) {
    notFound();
  }

  return <PromptDetailClient initialPrompt={initialPrompt} />;
}
