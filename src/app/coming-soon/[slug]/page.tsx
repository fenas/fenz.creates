import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { initialComingSoon } from "@/data/tutorialsData";
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
  const feature = initialComingSoon.find((f) => f.slug === slug);

  if (!feature) {
    return {
      title: "Roadmap Feature Not Found - fenz.creates",
    };
  }

  const snippet = feature.description.slice(0, 160);

  return {
    title: `${feature.title} — Coming Soon Roadmap | fenz.creates`,
    description: snippet,
    openGraph: {
      title: `${feature.title} (${feature.badge}) | fenz.creates Roadmap`,
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
  const initialFeature = initialComingSoon.find((f) => f.slug === slug);

  if (!initialFeature) {
    notFound();
  }

  return <ComingSoonDetailClient initialFeature={initialFeature} />;
}
