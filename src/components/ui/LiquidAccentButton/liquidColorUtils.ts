// Color extraction and smooth interpolation utility for Liquid Accent Button
// Reads theme tokens dynamically from CSS variables and interpolates seamlessly

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface LiquidThemePalette {
  accentPrimary: RGBColor;
  accentSecondary: RGBColor;
  accentHighlight: RGBColor;
  accentDeep: RGBColor;
  ambientUndertone: RGBColor;
  glassBase: RGBColor;
  bloomColor: string;
}

// Helper to convert hex to RGB
export function hexToRgb(hex: string): RGBColor {
  let cleaned = hex.trim().replace("#", "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length === 6) {
    const num = parseInt(cleaned, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
    };
  }
  if (cleaned.length === 8) {
    const num = parseInt(cleaned, 16);
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: (num & 255) / 255,
    };
  }
  return { r: 255, g: 108, b: 0, a: 1 }; // Default orange fallback
}

// Helper to parse any css color (hex, rgb, rgba)
export function parseCssColor(colorStr: string): RGBColor {
  if (!colorStr) return { r: 255, g: 108, b: 0, a: 1 };
  const trimmed = colorStr.trim();

  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed);
  }

  const rgbaMatch = trimmed.match(
    /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (rgbaMatch) {
    return {
      r: parseFloat(rgbaMatch[1]),
      g: parseFloat(rgbaMatch[2]),
      b: parseFloat(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }

  return { r: 255, g: 108, b: 0, a: 1 };
}

// RGB to HSL converter
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [h, s, l];
}

// HSL to RGB converter
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: 1,
  };
}

// Interpolate two RGB colors
export function lerpColor(c1: RGBColor, c2: RGBColor, factor: number): RGBColor {
  return {
    r: c1.r + (c2.r - c1.r) * factor,
    g: c1.g + (c2.g - c1.g) * factor,
    b: c1.b + (c2.b - c1.b) * factor,
    a: (c1.a ?? 1) + ((c2.a ?? 1) - (c1.a ?? 1)) * factor,
  };
}

// Linear interpolation between numbers
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Format RGB Color as CSS rgba string
export function toRgbaString(c: RGBColor, alphaMultiplier = 1): string {
  const alpha = Math.max(0, Math.min(1, (c.a ?? 1) * alphaMultiplier));
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha.toFixed(3)})`;
}

// Extract harmonic theme palette strictly based on the active theme's accent color
export function extractThemePalette(themeName?: string): LiquidThemePalette {
  let accentHex = "#FF6C00";
  let accentHoverHex = "#FF8526";
  let accentDarkHex = "#E05A00";
  let surfaceRecessedHex = "#0A0C0E";

  if (typeof window !== "undefined") {
    try {
      const computed = window.getComputedStyle(document.documentElement);
      const cssAccent = computed.getPropertyValue("--accent").trim();
      const cssAccentHover = computed.getPropertyValue("--accent-hover").trim();
      const cssAccentDark = computed.getPropertyValue("--accent-dark").trim();
      const cssSurfaceRecessed = computed.getPropertyValue("--surface-recessed").trim();

      if (cssAccent) accentHex = cssAccent;
      if (cssAccentHover) accentHoverHex = cssAccentHover;
      if (cssAccentDark) accentDarkHex = cssAccentDark;
      if (cssSurfaceRecessed) surfaceRecessedHex = cssSurfaceRecessed;
    } catch {
      // Fall back to default
    }
  }

  const primaryRgb = parseCssColor(accentHex);
  const hoverRgb = parseCssColor(accentHoverHex);
  const darkRgb = parseCssColor(accentDarkHex);
  const glassBaseRgb = parseCssColor(surfaceRecessedHex);

  // Derive pure tonal variations of the exact theme accent
  const [h, s, l] = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  // Luminous highlight shimmer (same hue, brighter, soft saturation)
  const highlightRgb = hslToRgb(h, Math.min(1, s * 0.95), Math.min(0.88, l * 1.3));

  // Secondary radiant body (from accent-hover or slight brightness boost)
  const secondaryRgb = hoverRgb.r ? hoverRgb : hslToRgb(h, s, Math.min(0.75, l * 1.15));

  // Deep rich base tone (from accent-dark or deeper luminosity)
  const deepRgb = darkRgb.r ? darkRgb : hslToRgb(h, Math.min(1, s * 1.1), Math.max(0.25, l * 0.7));

  // Soft ambient diffusion of the same accent
  const ambientUndertoneRgb = hslToRgb(h, Math.min(1, s * 0.9), Math.max(0.35, l * 0.85));

  const bloomColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.35)`;

  return {
    accentPrimary: primaryRgb,
    accentSecondary: secondaryRgb,
    accentHighlight: highlightRgb,
    accentDeep: deepRgb,
    ambientUndertone: ambientUndertoneRgb,
    glassBase: glassBaseRgb,
    bloomColor,
  };
}
