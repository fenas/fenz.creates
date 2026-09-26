import React from "react";
import { Metadata } from "next";
import { initialComingSoon } from "@/data/tutorialsData";
import { fetchComingSoonBySlugFromDb } from "@/lib/supabase";
import { ComingSoonDetailClient } from "./ComingSoonDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return initialComingSoon.map((f) => ({
    slug: f.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbFeature = await fetchComingSoonBySlugFromDb(slug);
  const feature = dbFeature || initialComingSoon.find((f) => f.slug === slug);

  if (!feature) {
    const formattedTitle = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: `${formattedTitle} — Roadmap Feature | Aistronaut`,
      description: "Upcoming feature on Aistronaut roadmap.",
    };
  }

  const snippet = feature.description.slice(0, 160);

  return {
    title: `${feature.title} — Coming Soon Roadmap | Aistronaut`,
    description: snippet,
    openGraph: {
      title: `${feature.title} (${feature.badge}) | Aistronaut Roadmap`,
      description: snippet,
      images: [
        {
          url: feature.mediaUrl,
          width: 1200,
          height: 630,
          alt: feature.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: feature.title,
      description: snippet,
      images: [feature.mediaUrl],
    },
  };
}

export default async function ComingSoonPage({ params }: Props) {
  const { slug } = await params;
  const dbFeature = await fetchComingSoonBySlugFromDb(slug);
  const initialFeature = dbFeature || initialComingSoon.find((f) => f.slug === slug) || null;

  return <ComingSoonDetailClient initialFeature={initialFeature} slug={slug} />;
}

