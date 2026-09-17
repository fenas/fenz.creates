import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialTutorials } from "@/data/tutorialsData";
import { TutorialDetailClient } from "./TutorialDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return initialTutorials.map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = initialTutorials.find((t) => t.slug === slug);

  if (!tutorial) {
    const formattedTitle = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: `${formattedTitle} — AI Prompting Guide | fenz.creates`,
      description: "Step-by-step AI workflow and prompt engineering tutorial.",
    };
  }

  const snippet = tutorial.description.slice(0, 160);

  return {
    title: `${tutorial.title} — AI Prompting Guide (${tutorial.model}) | fenz.creates`,
    description: snippet,
    openGraph: {
      title: `${tutorial.title} — ${tutorial.model} Guide | fenz.creates`,
      description: snippet,
      images: [
        {
          url: tutorial.mediaUrl,
          width: 1200,
          height: 630,
          alt: tutorial.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: tutorial.title,
      description: snippet,
      images: [tutorial.mediaUrl],
    },
  };
}

export default async function TutorialPage({ params }: Props) {
  const { slug } = await params;
  const initialTutorial = initialTutorials.find((t) => t.slug === slug) || null;

  return <TutorialDetailClient initialTutorial={initialTutorial} slug={slug} />;
}

