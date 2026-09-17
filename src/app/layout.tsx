import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PromptProvider } from "@/context/PromptContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeScript } from "@/components/theme/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arenae — AI Prompt Showcase & Workflow Studio",
  description:
    "Curated library of world-class AI prompts for Midjourney v6, Flux.1 Pro, SDXL, and video models. Free to browse, learn workflows, and 1-click copy.",
  keywords: [
    "Arenae",
    "Arenae Online",
    "AI Prompts",
    "Midjourney Prompts",
    "Flux Prompts",
    "Stable Diffusion",
    "AI Art Gallery",
    "Prompt Engineering",
  ],
  authors: [{ name: "Arenae Online" }],
  openGraph: {
    title: "Arenae — Curated AI Prompt Gallery & Workflow Studio",
    description:
      "Explore, copy, and remix world-class AI prompt formulas. Instant 1-click copy, high-res visual showcases, and workflow tutorials.",
    url: "https://arenae.online",
    siteName: "Arenae Online",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Arenae AI Prompt Gallery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arenae — AI Prompt Showcase",
    description:
      "Curated visual formulas and masterclass workflows for Midjourney, Flux, and AI video creators.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen selection:bg-[#E85002]/30 selection:text-current"
      >
        <ThemeProvider>
          <ToastProvider>
            <PromptProvider>{children}</PromptProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
