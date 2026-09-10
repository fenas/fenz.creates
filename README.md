# fenz.creates — AI Prompt Showcase & Creator Studio

An ultra-sleek, dark-mode AI Prompt Showcase and Creator Studio built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- 🎨 **Spotlight Hero Showcase**: Configurable featured hero banner post with 1-click prompt copying and glassmorphism badges.
- 🖼️ **Single Section Gallery**: Filter by category (Photorealistic, Cyberpunk, 3D Surreal, Anime, Fashion, Architecture, Product, Nature) and media types (Images vs. Videos).
- 🎲 **Surprise Me**: Instant random AI prompt generator with particle celebration.
- 💡 **Interactive Prompt Detail Modal**: Inspect exact prompt text, negative prompt, aspect ratio, AI model version, parameters (seed, stylize, CFG scale), and tags.
- 📚 **Tutorials & Guides**: Curated step-by-step masterclasses for Midjourney, Stable Diffusion, and Flux.
- 🚀 **Feature Roadmap**: Interactive upvoting for upcoming video generator support, community remixing, and camera control tools.
- 🛡️ **Admin Content Studio (`/admin`)**:
  - Full upload, edit, draft/publish, and delete capabilities for Prompts, Categories, Tutorials, and Roadmap features.
  - Dedicated **Hero Banner Selector** to designate any artwork as the homepage spotlight.
  - LocalStorage state persistence.
- 📱 **Mobile First**: Optimized responsive design with slim desktop icon navigation and mobile bottom tab bar.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Glassmorphism, CSS Grid
- **Icons**: Lucide React
- **Animations**: Canvas Confetti, Tailwind CSS animations

---

## 🚀 Getting Started

First, install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the public showcase.

Access the Admin Studio at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 📦 Build for Production

```bash
npm run build
npm start
```
