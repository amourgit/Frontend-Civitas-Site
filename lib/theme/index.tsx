// ============================================================
// lib/theme/index.tsx — Point d'entrée du système de thème
// ============================================================

// Types
export type {
  Theme, ThemeColors, ThemeGlass, ThemeGlass as GlassTheme,
  GlassLayer, GlassPalette, ThemeTypography, ThemeSpacing,
  ThemeLayout, ThemeAnimation, ThemeEffects, ThemeComponents,
  ThemeContextType, ThemeChangeEvent, ThemeStorage,
  ColorScale, SurfaceMode, BorderMode, FontSize,
} from './types';

// Provider & hooks
export {
  ThemeProvider,
  useTheme,
  useThemeEvents,
  useThemeVariables,
} from './themeContext';

// Composant SSR anti-FOUC (Server Component)
export { ThemeInitScript } from './ThemeInitScript';

// Composants UI
export {
  ThemeSwitcher,
  DarkModeToggle,
  ThemeColorPreview,
} from './themeSwitcher';

// Service bas niveau
export { ThemeLoader } from './themeLoader';

// ─── Utilitaires couleurs ─────────────────────────────────────
export const themeUtils = {
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null;
  },

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  },

  getLuminance(hex: string): number {
    const rgb = themeUtils.hexToRgb(hex);
    if (!rgb) return 0;
    return [rgb.r, rgb.g, rgb.b]
      .map(c => { const s = c/255; return s<=0.03928 ? s/12.92 : ((s+0.055)/1.055)**2.4; })
      .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
  },

  getContrastRatio(c1: string, c2: string): number {
    const [l1,l2] = [themeUtils.getLuminance(c1), themeUtils.getLuminance(c2)].sort((a,b)=>b-a);
    return (l1+0.05)/(l2+0.05);
  },

  isAccessible(fg: string, bg: string, level: 'AA'|'AAA' = 'AA'): boolean {
    return themeUtils.getContrastRatio(fg, bg) >= (level==='AAA'?7:4.5);
  },

  lighten(hex: string, pct: number): string {
    const rgb = themeUtils.hexToRgb(hex);
    if (!rgb) return hex;
    const a = pct/100;
    return themeUtils.rgbToHex(
      Math.min(255,Math.floor(rgb.r+(255-rgb.r)*a)),
      Math.min(255,Math.floor(rgb.g+(255-rgb.g)*a)),
      Math.min(255,Math.floor(rgb.b+(255-rgb.b)*a)),
    );
  },

  darken(hex: string, pct: number): string {
    const rgb = themeUtils.hexToRgb(hex);
    if (!rgb) return hex;
    const a = pct/100;
    return themeUtils.rgbToHex(
      Math.max(0,Math.floor(rgb.r*(1-a))),
      Math.max(0,Math.floor(rgb.g*(1-a))),
      Math.max(0,Math.floor(rgb.b*(1-a))),
    );
  },

  generateColorScale(base: string): Record<string,string> {
    return {
      '50':  themeUtils.lighten(base, 95), '100': themeUtils.lighten(base, 90),
      '200': themeUtils.lighten(base, 75), '300': themeUtils.lighten(base, 60),
      '400': themeUtils.lighten(base, 30), '500': base,
      '600': themeUtils.darken(base, 15),  '700': themeUtils.darken(base, 30),
      '800': themeUtils.darken(base, 45),  '900': themeUtils.darken(base, 60),
      '950': themeUtils.darken(base, 75),
    };
  },

  /** Construit un style object Glass Morphism à partir des var CSS */
  glassStyle(layer: 'xs'|'sm'|'md'|'lg'|'xl'|'card'|'sidebar'|'header'|'modal'|'dropdown'|'toast') {
    return {
      background:    `var(--glass-${layer}-bg)`,
      backdropFilter:`var(--glass-${layer}-blur)`,
      WebkitBackdropFilter:`var(--glass-${layer}-blur)`,
      border:        `var(--glass-${layer}-border)`,
      boxShadow:     `var(--glass-${layer}-shadow)`,
    };
  },
};
