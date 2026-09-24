import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { PromptProvider } from "@/context/PromptContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aistronaut — AI Prompt Showcase & Workflow Studio",
  description:
    "Curated library of world-class AI prompts for Midjourney v6, Flux.1 Pro, SDXL, and video models. Free to browse, learn workflows, and 1-click copy.",
  keywords: [
    "Aistronaut",
    "Aistronaut Online",
    "AI Prompts",
    "Midjourney Prompts",
    "Flux Prompts",
    "Stable Diffusion",
    "AI Art Gallery",
    "Prompt Engineering",
  ],
  authors: [{ name: "Aistronaut" }],
  openGraph: {
    title: "Aistronaut — Curated AI Prompt Gallery & Workflow Studio",
    description:
      "Explore, copy, and remix world-class AI prompt formulas. Instant 1-click copy, high-res visual showcases, and workflow tutorials.",
    url: "https://aistronaut.online",
    siteName: "Aistronaut",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Aistronaut AI Prompt Gallery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aistronaut — AI Prompt Showcase",
    description:
      "Curated visual formulas and masterclass workflows for Midjourney, Flux, and AI video creators.",
    images: ["/logo.png"],
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
        <Analytics />
      </body>
    </html>
  );
}
