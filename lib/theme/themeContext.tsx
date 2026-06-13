// ============================================================
// lib/theme/themeContext.tsx
// Contexte React — chargement sans FOUC, SSR-safe
// ============================================================


import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, ReactNode
} from 'react';
import { Theme, ThemeContextType, ThemeChangeEvent } from './types';
import { ThemeLoader } from './themeLoader';

// ─── Context ────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans un <ThemeProvider>');
  return ctx;
};

// ─── Provider ───────────────────────────────────────────────
interface ThemeProviderProps {
  children:       ReactNode;
  defaultTheme?:  string;
  enableDarkMode?: boolean;
  onThemeChange?: (e: ThemeChangeEvent) => void;
}

export const ThemeProvider = ({
  children,
  defaultTheme  = 'default',
  enableDarkMode = true,
  onThemeChange,
}: ThemeProviderProps) => {
  const loader = ThemeLoader.getInstance();

  const [theme,           setThemeState]   = useState<Theme | null>(null);
  const [themeName,       setThemeName]     = useState<string>(defaultTheme);
  const [isDark,          setIsDark]        = useState<boolean>(false);
  const [isLoading,       setIsLoading]     = useState<boolean>(true);
  const [availableThemes, setAvailThemes]   = useState<string[]>([]);

  // Ref pour éviter double-init en StrictMode
  const initialized = useRef(false);

  // ── Init principale (une seule fois) ──────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const boot = async () => {
      try {
        // 1. Lire prefs sauvegardées
        const prefs = loader.loadThemePreferences();
        let nameToLoad = prefs?.themeName ?? defaultTheme;
        let dark = prefs?.isDark ?? (
          enableDarkMode
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false
        );

        // 2. Si thème custom sauvegardé, l'appliquer directement
        if (prefs?.customTheme) {
          loader.applyTheme(prefs.customTheme, dark);
          setThemeState(prefs.customTheme);
          setThemeName('custom');
          setIsDark(dark);
          setIsLoading(false);
          return;
        }

        // 3. Charger depuis /public/themes/
        const loaded = await loader.loadTheme(nameToLoad);

        // 4. Appliquer (1 seul <style> batch — aucun flash)
        loader.applyTheme(loaded, dark);

        // 5. Supprimer le style SSR minimal maintenant que le vrai est en place
        document.getElementById('__iam_theme_ssr__')?.remove();

        setThemeState(loaded);
        setThemeName(nameToLoad);
        setIsDark(dark);

        const themes = await loader.discoverThemes();
        setAvailThemes(themes);

      } catch (err) {
        console.error('[ThemeProvider] Erreur de chargement :', err);
        // Fallback minimal si le fetch échoue
        const fallback = buildFallback();
        loader.applyTheme(fallback, false);
        setThemeState(fallback);
        setIsDark(false);
      } finally {
        setIsLoading(false);
      }
    };

    boot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Écoute préférence système (seulement si pas de prefs sauvegardées) ──
  useEffect(() => {
    if (!enableDarkMode) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (e: MediaQueryListEvent) => {
      if (loader.loadThemePreferences()) return; // l'user a une pref explicite
      setIsDark(e.matches);
      if (theme) loader.applyTheme(theme, e.matches);
    };

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [enableDarkMode, theme, loader]);

  // ── API publique ───────────────────────────────────────────
  const setTheme = useCallback((newTheme: Theme, name: string) => {
    const prev = theme;
    loader.applyTheme(newTheme, isDark);
    setThemeState(newTheme);
    setThemeName(name);
    loader.saveThemePreferences(name, isDark, name === 'custom' ? newTheme : undefined);
    onThemeChange?.({ theme: newTheme, themeName: name, previousTheme: prev ?? undefined });
  }, [theme, isDark, loader, onThemeChange]);

  const loadTheme = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const loaded = await loader.loadTheme(name);
      setTheme(loaded, name);
    } finally {
      setIsLoading(false);
    }
  }, [loader, setTheme]);

  const toggleDarkMode = useCallback(() => {
    if (!enableDarkMode || !theme) return;
    const next = !isDark;
    setIsDark(next);
    loader.applyTheme(theme, next);
    loader.saveThemePreferences(themeName, next);
    onThemeChange?.({ theme, themeName, previousTheme: theme });
  }, [enableDarkMode, theme, isDark, themeName, loader, onThemeChange]);

  // ── Pendant le chargement, on rend les enfants quand même ──
  // (le style SSR minimal est déjà en place, pas de flash)
  const value: ThemeContextType = {
    theme:           theme ?? buildFallback(),
    themeName,
    isDark,
    isLoading,
    setTheme,
    loadTheme,
    toggleDarkMode,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hooks utilitaires ───────────────────────────────────────

/** Émet un event DOM custom à chaque changement de thème */
export const useThemeEvents = () => {
  const { theme, themeName } = useTheme();
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('iam:theme-changed', { detail: { theme, themeName } }));
  }, [theme, themeName]);
};

/** Accès rapide aux variables CSS du thème */
export const useThemeVariables = () => {
  const { theme, isDark } = useTheme();

  const glass = useCallback((layer: string) => ({
    background:    `var(--glass-${layer}-bg)`,
    backdropFilter:`var(--glass-${layer}-blur)`,
    border:        `var(--glass-${layer}-border)`,
    boxShadow:     `var(--glass-${layer}-shadow)`,
  }), []);

  const color   = (path: string) => `var(--${path.replace(/\./g, '-')})`;
  const space   = (k: string)    => `var(--space-${k})`;
  const radius  = (k: string)    => `var(--radius-${k})`;
  const shadow  = (k: string)    => `var(--shadow-${k})`;
  const fs      = (k: string)    => `var(--fs-${k})`;

  return { theme, isDark, glass, color, space, radius, shadow, fs };
};

// ─── Fallback ultra-minimal ───────────────────────────────────
function buildFallback(): Theme {
  // Import dynamique circulaire évité — on définit un objet minimal ici
  return {
    meta:    { name:'Fallback', version:'1.0.0', author:'System', description:'Fallback' },
    colors:  {
      primary:   p('#6366f1'), secondary: p('#d946ef'), neutral: p('#64748b'),
      success:   p('#22c55e'), warning:   p('#f59e0b'), error:   p('#ef4444'), info: p('#3b82f6'),
      surface: {
        light: { background:'#f8fafc', foreground:'#0f172a', card:'#ffffff', cardForeground:'#0f172a',
          popover:'#ffffff', popoverForeground:'#0f172a', muted:'#f1f5f9', mutedForeground:'#64748b',
          accent:'#eef2ff', accentForeground:'#312e81', sidebar:'#ffffff', sidebarForeground:'#1e293b',
          header:'#ffffff', headerForeground:'#0f172a', overlay:'rgba(15,23,42,0.45)',
          skeleton:'#e2e8f0', destructive:'#ef4444', destructiveForeground:'#fafafa',
          glass:'rgba(255,255,255,0.55)', glassBorder:'rgba(255,255,255,0.80)', glassHover:'rgba(255,255,255,0.72)' },
        dark: { background:'rgba(9,9,18,0.92)', foreground:'#f1f5f9', card:'rgba(15,23,42,0.75)', cardForeground:'#f1f5f9',
          popover:'rgba(15,23,42,0.90)', popoverForeground:'#f1f5f9', muted:'rgba(30,41,59,0.80)', mutedForeground:'#94a3b8',
          accent:'rgba(49,46,129,0.50)', accentForeground:'#e0e7ff', sidebar:'rgba(9,9,18,0.80)', sidebarForeground:'#e2e8f0',
          header:'rgba(9,9,18,0.78)', headerForeground:'#f1f5f9', overlay:'rgba(0,0,0,0.65)',
          skeleton:'rgba(30,41,59,0.80)', destructive:'#7f1d1d', destructiveForeground:'#fef2f2',
          glass:'rgba(15,23,42,0.60)', glassBorder:'rgba(255,255,255,0.08)', glassHover:'rgba(30,41,59,0.75)' },
      },
      border: {
        light: { default:'rgba(203,213,225,0.70)', input:'rgba(148,163,184,0.60)', ring:'rgba(99,102,241,0.60)', focus:'rgba(79,70,229,0.80)', divider:'rgba(226,232,240,0.50)', glass:'rgba(255,255,255,0.60)' },
        dark:  { default:'rgba(51,65,85,0.70)',    input:'rgba(71,85,105,0.60)',   ring:'rgba(99,102,241,0.60)', focus:'rgba(129,140,248,0.80)',divider:'rgba(30,41,59,0.60)',   glass:'rgba(255,255,255,0.06)' },
      },
    },
    glass: { light: glP('l'), dark: glP('d') },
    typography: {
      fontFamily: { sans:['-apple-system','sans-serif'], serif:['Georgia','serif'], mono:['monospace'], heading:['-apple-system','sans-serif'], body:['-apple-system','sans-serif'] },
      fontUrl: null,
      fontSize: { xs:{size:'0.75rem',lineHeight:'1rem'}, sm:{size:'0.875rem',lineHeight:'1.25rem'}, base:{size:'1rem',lineHeight:'1.5rem'}, lg:{size:'1.125rem',lineHeight:'1.75rem'}, xl:{size:'1.25rem',lineHeight:'1.75rem'} },
      fontWeight: { normal:'400', medium:'500', semibold:'600', bold:'700' },
      letterSpacing: { normal:'0em', wide:'0.025em' },
      lineHeight: { normal:'1.5', tight:'1.25' },
    },
    spacing:      { density:'1', scale:{ '0':'0px','1':'0.25rem','2':'0.5rem','3':'0.75rem','4':'1rem','6':'1.5rem','8':'2rem' } },
    layout: {
      sidebar: { width:'260px', collapsedWidth:'64px', position:'left', variant:'glass' },
      header:  { height:'64px', sticky:true, variant:'glass' },
      content: { maxWidth:'1400px', paddingX:'1.5rem', paddingY:'1.5rem', gridColumns:12, gridGap:'1.5rem' },
      footer:  { height:'auto', visible:true },
      breakpoints: { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px' },
    },
    borderRadius: { none:'0px', sm:'0.5rem', md:'0.75rem', lg:'1rem', xl:'1.25rem', '2xl':'1.5rem', full:'9999px' },
    shadows:      { none:'none', sm:'0 2px 8px rgba(0,0,0,0.06)', md:'0 8px 24px rgba(0,0,0,0.10)', lg:'0 16px 40px rgba(0,0,0,0.12)', glass:'0 8px 32px rgba(0,0,0,0.10),inset 0 1px 0 rgba(255,255,255,0.80)' },
    animation:    { reducedMotion:false, duration:{ fast:'100ms', normal:'200ms', moderate:'300ms', slow:'500ms' }, easing:{ linear:'linear', out:'cubic-bezier(0,0,0.2,1)', inOut:'cubic-bezier(0.4,0,0.2,1)', apple:'cubic-bezier(0.42,0,0.18,1)' }, presets:{} },
    transitions:  { default:'all 200ms cubic-bezier(0.42,0,0.18,1)', glass:'background 200ms ease,backdrop-filter 200ms ease,border-color 200ms ease,box-shadow 200ms ease' },
    effects:      { blur:{ none:'0px', sm:'8px', md:'16px', lg:'24px', xl:'40px' }, saturate:{ none:'100%', medium:'180%', high:'200%' } },
    zIndex:       { hide:'-1', base:'0', dropdown:'100', modal:'400', toast:'600', tooltip:'700', top:'9999' },
  };
}

// helpers fallback
function p(c: string) {
  return { '50':c,'100':c,'200':c,'300':c,'400':c,'500':c,'600':c,'700':c,'800':c,'900':c,'950':c };
}
function gl(): import('./types').GlassLayer {
  return { background:'rgba(255,255,255,0.60)', backdropFilter:'blur(20px) saturate(180%)', border:'1px solid rgba(255,255,255,0.72)', boxShadow:'0 8px 32px rgba(0,0,0,0.10)' };
}
function glP(_: string): import('./types').GlassPalette {
  const g = gl();
  return { xs:g,sm:g,md:g,lg:g,xl:g,sidebar:g,header:g,modal:g,card:g,dropdown:g,toast:g };
}
