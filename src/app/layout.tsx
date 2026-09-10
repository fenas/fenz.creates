import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PromptProvider } from "@/context/PromptContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fenz.creates — AI Prompt Showcase & Discovery",
  description:
    "Curated library of world-class AI prompts for Midjourney v6, Flux.1 Pro, SDXL, and video models. Free to browse and 1-click copy.",
  keywords: [
    "AI Prompts",
    "Midjourney Prompts",
    "Flux Prompts",
    "Stable Diffusion",
    "AI Art Gallery",
    "Prompt Engineering",
    "fenz.creates",
  ],
  authors: [{ name: "fenz.creates" }],
  openGraph: {
    title: "fenz.creates — Curated AI Prompt Gallery",
    description:
      "Explore, copy, and remix world-class AI prompt formulas. Instant 1-click copy, high-res visual showcases.",
    url: "https://fenz.creates",
    siteName: "fenz.creates",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "fenz.creates AI Prompt Gallery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "fenz.creates — AI Prompt Showcase",
    description:
      "Curated visual formulas for Midjourney, Flux, and SDXL creators.",
    images: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07080b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="bg-[#07080b] text-white min-h-screen selection:bg-violet-600/40 selection:text-white">
        <ToastProvider>
          <PromptProvider>{children}</PromptProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
