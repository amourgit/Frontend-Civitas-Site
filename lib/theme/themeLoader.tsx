// ============================================================
// lib/theme/themeLoader.tsx
// Injection BATCH via un seul <style> = zéro FOUC, zéro flash
// ============================================================

import { Theme, ThemeGlass, GlassPalette, ThemeStorage } from './types';

// ─── Cache mémoire ────────────────────────────────────────────
const THEME_CACHE = new Map<string, Theme>();
const STYLE_TAG_ID = '__iam_theme__';

// ─── ThemeLoader (Singleton) ──────────────────────────────────
export class ThemeLoader {
  private static instance: ThemeLoader;
  private currentTheme: Theme | null = null;

  static getInstance(): ThemeLoader {
    if (!ThemeLoader.instance) ThemeLoader.instance = new ThemeLoader();
    return ThemeLoader.instance;
  }

  // ── Chargement avec cache ──────────────────────────────────
  async loadTheme(name: string): Promise<Theme> {
    if (THEME_CACHE.has(name)) return THEME_CACHE.get(name)!;

    const res = await fetch(`/themes/${name}.json`, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Theme "${name}" introuvable`);

    const theme: Theme = await res.json();
    this.validate(theme);
    THEME_CACHE.set(name, theme);
    return theme;
  }

  // ── Application BATCH : 1 seul <style> injecté ────────────
  applyTheme(theme: Theme, isDark = false): void {
    if (typeof document === 'undefined') return;

    const css = this.buildCSSBlock(theme, isDark);

    // Réutilise ou crée le tag
    let tag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
    if (!tag) {
      tag = document.createElement('style');
      tag.id = STYLE_TAG_ID;
      // Priorité max : avant toutes les feuilles
      document.head.insertBefore(tag, document.head.firstChild);
    }
    tag.textContent = css;

    // Marque le mode sur <html> (utile pour Tailwind dark:)
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', theme.meta.name);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');

    this.currentTheme = theme;
  }

  // ── Génération du bloc CSS complet ────────────────────────
  buildCSSBlock(theme: Theme, isDark: boolean): string {
    const surface = isDark ? theme.colors.surface.dark : theme.colors.surface.light;
    const border  = isDark ? theme.colors.border.dark  : theme.colors.border.light;
    const glass   = isDark ? theme.glass.dark          : theme.glass.light;

    const lines: string[] = [':root,html{'];

    // Couleurs primaires / sémantiques
    for (const [scale, map] of Object.entries({
      primary: theme.colors.primary,   secondary: theme.colors.secondary,
      neutral: theme.colors.neutral,   success:   theme.colors.success,
      warning: theme.colors.warning,   error:     theme.colors.error,
      info:    theme.colors.info,
    })) {
      for (const [shade, val] of Object.entries(map as unknown as Record<string, string>)) {
        lines.push(`--${scale}-${shade}:${val};`);
      }
    }

    // Surface (mode-aware)
    for (const [k, v] of Object.entries(surface)) {
      lines.push(`--surface-${k}:${v};`);
    }

    // Border (mode-aware)
    for (const [k, v] of Object.entries(border)) {
      lines.push(`--border-${k}:${v};`);
    }

    // Glass layers (mode-aware) — exposées comme variables CSS
    this.buildGlassVars(glass, lines);

    // Typographie
    const t = theme.typography;
    for (const [k, v] of Object.entries(t.fontFamily)) {
      lines.push(`--font-${k}:${(v as string[]).join(',')};`);
    }
    for (const [k, v] of Object.entries(t.fontSize as Record<string, {size:string;lineHeight:string}>)) {
      lines.push(`--fs-${k}:${v.size};`);
      lines.push(`--fs-${k}-lh:${v.lineHeight};`);
    }
    for (const [k, v] of Object.entries(t.fontWeight)) {
      lines.push(`--fw-${k}:${v};`);
    }
    for (const [k, v] of Object.entries(t.letterSpacing)) {
      lines.push(`--tracking-${k}:${v};`);
    }
    for (const [k, v] of Object.entries(t.lineHeight)) {
      lines.push(`--leading-${k}:${v};`);
    }

    // Espacement
    for (const [k, v] of Object.entries(theme.spacing.scale)) {
      lines.push(`--space-${k}:${v};`);
    }

    // Border radius
    for (const [k, v] of Object.entries(theme.borderRadius)) {
      lines.push(`--radius-${k}:${v};`);
    }

    // Ombres
    for (const [k, v] of Object.entries(theme.shadows)) {
      lines.push(`--shadow-${k}:${v};`);
    }

    // Transitions
    for (const [k, v] of Object.entries(theme.transitions)) {
      lines.push(`--transition-${k}:${v};`);
    }

    // Animations
    for (const [k, v] of Object.entries(theme.animation.duration)) {
      lines.push(`--dur-${k}:${v};`);
    }
    for (const [k, v] of Object.entries(theme.animation.easing)) {
      lines.push(`--ease-${k}:${v};`);
    }

    // Effets blur / saturate
    for (const [k, v] of Object.entries(theme.effects.blur)) {
      lines.push(`--blur-${k}:${v};`);
    }
    for (const [k, v] of Object.entries(theme.effects.saturate)) {
      lines.push(`--saturate-${k}:${v};`);
    }

    // Z-index
    for (const [k, v] of Object.entries(theme.zIndex)) {
      lines.push(`--z-${k}:${v};`);
    }

    // Layout
    const L = theme.layout;
    lines.push(`--sidebar-width:${L.sidebar.width};`);
    lines.push(`--sidebar-collapsed:${L.sidebar.collapsedWidth};`);
    lines.push(`--header-height:${L.header.height};`);
    lines.push(`--content-max:${L.content.maxWidth};`);

    // Icons
    if (theme.icons) {
      for (const [k, v] of Object.entries(theme.icons.size)) {
        lines.push(`--icon-${k}:${v};`);
      }
      lines.push(`--icon-stroke:${theme.icons.strokeWidth};`);
    }

    lines.push('}');

    // Keyframes intégrés (glass reveal + shimmer)
    lines.push(this.buildKeyframes());

    return lines.join('');
  }

  // ── Variables CSS pour les layers Glass ───────────────────
  private buildGlassVars(glass: GlassPalette, lines: string[]): void {
    const layers: (keyof GlassPalette)[] = [
      'xs','sm','md','lg','xl',
      'sidebar','header','modal','card','dropdown','toast'
    ];
    for (const name of layers) {
      const layer = glass[name];
      lines.push(`--glass-${name}-bg:${layer.background};`);
      lines.push(`--glass-${name}-blur:${layer.backdropFilter};`);
      lines.push(`--glass-${name}-border:${layer.border};`);
      lines.push(`--glass-${name}-shadow:${layer.boxShadow};`);
    }
  }

  // ── Keyframes critiques intégrés inline ───────────────────
  private buildKeyframes(): string {
    return `
@keyframes glassReveal{
  from{opacity:0;transform:scale(0.97) translateY(8px);filter:blur(4px)}
  to  {opacity:1;transform:scale(1)    translateY(0);  filter:blur(0)}
}
@keyframes dropIn{
  from{opacity:0;transform:translateY(-8px) scale(0.98)}
  to  {opacity:1;transform:translateY(0)    scale(1)}
}
@keyframes fadeIn{
  from{opacity:0}
  to  {opacity:1}
}
@keyframes slideInLeft{
  from{opacity:0;transform:translateX(-16px)}
  to  {opacity:1;transform:translateX(0)}
}
@keyframes slideInRight{
  from{opacity:0;transform:translateX(16px)}
  to  {opacity:1;transform:translateX(0)}
}
@keyframes slideInUp{
  from{opacity:0;transform:translateY(12px)}
  to  {opacity:1;transform:translateY(0)}
}
@keyframes scaleIn{
  from{opacity:0;transform:scale(0.95)}
  to  {opacity:1;transform:scale(1)}
}
@keyframes spin{
  to{transform:rotate(360deg)}
}
@keyframes shimmer{
  0%  {background-position:-200% 0}
  100%{background-position: 200% 0}
}
@keyframes ping{
  75%,100%{transform:scale(2);opacity:0}
}
@keyframes shake{
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}
@keyframes float{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-8px)}
}
`;
  }

  // ── Script SSR (injection synchrone avant paint) ──────────
  /**
   * Retourne un script JS inline à insérer dans <head>
   * Il lit localStorage et injecte les variables AVANT le premier paint.
   * Résultat : ZÉRO flash, ZÉRO FOUC.
   */
  buildSSRScript(): string {
    return `(function(){
  try{
    var p=localStorage.getItem('iam-theme-prefs');
    var isDark=false;
    var themeName='default';
    if(p){var o=JSON.parse(p);isDark=!!o.isDark;themeName=o.themeName||'default';}
    else{isDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;}
    document.documentElement.classList.toggle('dark',isDark);
    document.documentElement.setAttribute('data-mode',isDark?'dark':'light');
    document.documentElement.setAttribute('data-theme-name',themeName);
    /* Variables anti-flash — remplacées par ThemeLoader dès l'hydratation */
    var s=document.createElement('style');
    s.id='__iam_theme_ssr__';
    var bg=isDark?'rgba(9,9,18,0.92)':'rgba(248,250,252,0.85)';
    var fg=isDark?'#f1f5f9':'#0f172a';
    var card=isDark?'rgba(15,23,42,0.75)':'rgba(255,255,255,0.72)';
    var headerBg=isDark?'rgba(9,9,18,0.82)':'rgba(255,255,255,0.78)';
    var borderDefault=isDark?'rgba(51,65,85,0.70)':'rgba(203,213,225,0.70)';
    s.textContent=':root{'
      +'--surface-background:'+bg+';'
      +'--surface-foreground:'+fg+';'
      +'--surface-card:'+card+';'
      +'--surface-header:'+headerBg+';'
      +'--surface-headerForeground:'+fg+';'
      +'--border-default:'+borderDefault+';'
      +'--primary-500:#6366f1;--primary-100:#e0e7ff;--primary-300:#a5b4fc;'
      +'--header-height:64px;'
      +'--icon-xs:12px;--icon-sm:16px;--icon-md:20px;--icon-lg:24px;--icon-xl:32px;'
      +'--icon-stroke:1.5;'
      +'--dur-normal:200ms;--dur-moderate:300ms;--dur-fast:100ms;'
      +'--duration-100:100ms;--duration-200:200ms;--duration-300:300ms;'
      +'--ease-out:cubic-bezier(0,0,0.2,1);--easing-out:cubic-bezier(0,0,0.2,1);'
      +'--ease-inOut:cubic-bezier(0.4,0,0.2,1);--easing-inOut:cubic-bezier(0.4,0,0.2,1);'
      +'--radius-sm:0.5rem;--radius-md:0.75rem;--radius-lg:1rem;--radius-xl:1.25rem;'
      +'--sidebar-width:260px;--sidebar-collapsed:64px;'
      +'color-scheme:'+(isDark?'dark':'light')+';'
      +'}';
    document.head.appendChild(s);
  }catch(e){}
})();`;
  }

  // ── Persistance ────────────────────────────────────────────
  saveThemePreferences(themeName: string, isDark: boolean, customTheme?: Theme): void {
    if (typeof window === 'undefined') return;
    try {
      const data: ThemeStorage = { themeName, isDark, ...(customTheme ? { customTheme } : {}) };
      localStorage.setItem('iam-theme-prefs', JSON.stringify(data));
    } catch { /* quota */ }
  }

  loadThemePreferences(): ThemeStorage | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('iam-theme-prefs');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  // ── Validation légère ──────────────────────────────────────
  private validate(theme: Theme): void {
    if (!theme?.meta || !theme?.colors || !theme?.glass || !theme?.typography) {
      throw new Error('Thème invalide : propriétés requises manquantes (meta, colors, glass, typography)');
    }
  }

  getCurrentTheme(): Theme | null { return this.currentTheme; }

  async discoverThemes(): Promise<string[]> {
    return ['default', ...Array.from(THEME_CACHE.keys()).filter(k => k !== 'default')];
  }

  exportTheme(): Theme | null { return this.currentTheme; }
  importTheme(theme: Theme): void { this.validate(theme); this.currentTheme = theme; }
}
