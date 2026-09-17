import { Tutorial, ComingSoonFeature } from "@/types";

export const initialTutorials: Tutorial[] = [
  {
    id: "tut-1",
    slug: "mastering-midjourney-v6-photorealism",
    title: "Mastering Midjourney v6 Photorealism",
    subtitle: "Learn how camera sensors, 35mm lens specs, natural lighting, and --style raw eliminate artificial CGI plastic sheen.",
    description: "Learn how camera sensors, 35mm lens specs, natural lighting, and --style raw eliminate artificial CGI plastic sheen.",
    readTime: "4 min read",
    level: "Intermediate",
    model: "Midjourney v6",
    mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    coverAlt: "Cinematic portrait photography in Tokyo golden hour",
    status: "published",
    tags: ["Midjourney", "Photorealism", "Portrait", "Cinematic"],
    blocks: [
      {
        id: "blk-intro-1",
        type: "paragraph",
        content: "Midjourney v6 is a generational leap in natural skin textures and lighting physics. However, many creators still run into the dreaded 'AI plastic sheen' by using outdated buzzwords like 'hyperrealistic' or '8k octane render'.",
      },
      {
        id: "blk-head-1",
        type: "heading",
        content: "1. Specify Real World Optics Over Buzzwords",
      },
      {
        id: "blk-p-2",
        type: "paragraph",
        content: "Modern AI diffusion models are trained on rich photographic metadata. By referencing specific camera sensors and vintage film stocks, you instantly anchor the renderer to physical lens physics rather than CGI renders.",
      },
      {
        id: "blk-list-1",
        type: "bulleted-list",
        items: [
          "Medium Format Sensors: Hasselblad H6D-100c, Leica M11, Phase One IQ4.",
          "Cinematic Prime Lenses: 85mm f/1.4 for creamy bokeh, 35mm f/2 for candid environmental depth.",
          "Film Stocks: Kodak Portra 400, Cinestill 800T for natural organic grain and warm skin tones.",
        ],
      },
      {
        id: "blk-prompt-1",
        type: "prompt",
        promptTitle: "Master Photorealism Formula",
        promptModel: "Midjourney v6",
        promptAspectRatio: "16:9",
        promptText: "Candid medium close-up 35mm film photograph of a woman in Shibuya Tokyo at dusk, soft morning window light, subtle freckles, Kodak Portra 400, Leica M11 50mm f/1.4 lens --ar 16:9 --style raw --v 6.0",
      },
      {
        id: "blk-tip-1",
        type: "callout",
        calloutVariant: "tip",
        calloutTitle: "💡 PRO TIP: LOWER STYLIZE WITH --STYLE RAW",
        content: "Always pair --style raw with lower stylize values (--s 50 to 180). This prevents Midjourney from over-beautifying faces and preserves natural pores, freckles, and authentic skin geometry.",
      },
      {
        id: "blk-head-2",
        type: "heading",
        content: "2. Master Directional and Volumetric Lighting",
      },
      {
        id: "blk-p-3",
        type: "paragraph",
        content: "Flat front lighting makes images look synthetic. Instead, specify chiaroscuro side lighting, soft golden hour rim light, or volumetric window god rays.",
      },
      {
        id: "blk-quote-1",
        type: "quote",
        content: "Lighting is the single most decisive factor between an amateur AI generation and a masterpiece that looks shot on 70mm film.",
      },
    ],
    content: [
      "1. Specify precise camera bodies (e.g. Hasselblad H6D-100c, Leica M11) rather than generic 'photorealistic' buzzwords.",
      "2. Define the focal length and aperture (e.g. 85mm f/1.4 for portrait bokeh, 24mm f/8 for architectural sharpness).",
      "3. Use --style raw and keep stylize lower (--s 50 to 250) for natural skin pores and realistic lighting falloff.",
    ],
    tips: [
      "Avoid words like 'hyperrealistic' or '4K' — use lighting descriptions instead.",
      "Add natural imperfections: 'candid film grain, subtle freckles, cinematic side lighting'.",
    ],
    samplePrompt: "Candid 35mm film photograph of a woman in Tokyo, soft morning window light, natural skin texture, Kodak Portra 400 --ar 16:9 --style raw --v 6.0",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
];



export const initialComingSoon: ComingSoonFeature[] = [
  {
    id: "feat-1",
    slug: "ai-video-prompt-studio",
    title: "AI Video Prompt Studio",
    description: "Support for Runway Gen-3, OpenAI Sora, and Kling AI prompts with real-time video preview players and frame rate controls.",
    badge: "In Development",
    eta: "Q4 2026",
    mediaUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
    highlights: ["4K Video Looping Previews", "Camera Motion Prompts (Pan, Orbit, Dolly)", "Frame Rate & Seed Presets"],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "feat-2",
    slug: "smart-prompt-optimizer-enhancer",
    title: "Smart Prompt Optimizer & Enhancer",
    description: "One-click tool to expand short ideas into complete, professionally structured prompts tailored for any target model.",
    badge: "Beta Testing",
    eta: "Next Week",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    highlights: ["Automatic Camera & Lighting Injection", "Negative Prompt Auto-Generator", "Multi-Model Translation"],
    createdAt: "2026-03-04T00:00:00.000Z",
  },
  {
    id: "feat-3",
    slug: "community-creator-upvoting-profiles",
    title: "Community Creator Upvoting & Profiles",
    description: "Creator accounts to follow prompt engineers, create custom collections, and upvote the week's best formulas.",
    badge: "Planned",
    eta: "Q1 2027",
    mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    highlights: ["Creator Verified Badges", "Custom Public Profile Portfolios", "Weekly Leaderboards"],
    createdAt: "2026-03-07T00:00:00.000Z",
  },
];
