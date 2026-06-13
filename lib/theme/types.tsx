// ============================================================
// lib/theme/types.tsx — Types complets alignés sur default.json
// ============================================================

export interface ColorScale {
  "50": string; "100": string; "200": string; "300": string;
  "400": string; "500": string; "600": string; "700": string;
  "800": string; "900": string; "950": string;
}

export interface SurfaceMode {
  background:            string;
  foreground:            string;
  card:                  string;
  cardForeground:        string;
  popover:               string;
  popoverForeground:     string;
  muted:                 string;
  mutedForeground:       string;
  accent:                string;
  accentForeground:      string;
  sidebar:               string;
  sidebarForeground:     string;
  header:                string;
  headerForeground:      string;
  overlay:               string;
  skeleton:              string;
  destructive:           string;
  destructiveForeground: string;
  glass:                 string;
  glassBorder:           string;
  glassHover:            string;
}

export interface BorderMode {
  default: string;
  input:   string;
  ring:    string;
  focus:   string;
  divider: string;
  glass:   string;
}

export interface ThemeColors {
  primary:   ColorScale;
  secondary: ColorScale;
  neutral:   ColorScale;
  success:   ColorScale;
  warning:   ColorScale;
  error:     ColorScale;
  info:      ColorScale;
  surface: { light: SurfaceMode; dark: SurfaceMode; };
  border:  { light: BorderMode;  dark: BorderMode;  };
}

export interface GlassLayer {
  background:    string;
  backdropFilter:string;
  border:        string;
  boxShadow:     string;
}

export interface GlassPalette {
  xs: GlassLayer; sm: GlassLayer; md: GlassLayer;
  lg: GlassLayer; xl: GlassLayer;
  sidebar: GlassLayer; header: GlassLayer; modal:    GlassLayer;
  card:    GlassLayer; dropdown: GlassLayer; toast:  GlassLayer;
}

export interface ThemeGlass {
  light: GlassPalette;
  dark:  GlassPalette;
}

export interface FontSize { size: string; lineHeight: string; }

export interface ThemeTypography {
  fontFamily: { sans: string[]; serif: string[]; mono: string[]; heading: string[]; body: string[]; };
  fontUrl:    string | null;
  fontSize:   Record<string, FontSize>;
  fontWeight: Record<string, string>;
  letterSpacing: Record<string, string>;
  lineHeight:    Record<string, string>;
  scale?: Record<string, { size: string; weight: string; lineHeight: string; letterSpacing?: string; }>;
}

export interface ThemeSpacing { density: string; scale: Record<string, string>; }

export interface ThemeLayout {
  sidebar:     { width: string; collapsedWidth: string; position: string; variant: string; };
  header:      { height: string; sticky: boolean; variant: string; };
  content:     { maxWidth: string; paddingX: string; paddingY: string; gridColumns: number; gridGap: string; };
  footer:      { height: string; visible: boolean; };
  breakpoints: Record<string, string>;
}

export interface AnimationPreset {
  keyframe: string; duration: string; easing: string;
  fillMode?: string; iterationCount?: string; direction?: string;
}

export interface ThemeAnimation {
  reducedMotion: boolean;
  duration: Record<string, string>;
  easing:   Record<string, string>;
  presets:  Record<string, AnimationPreset>;
}

export interface ThemeEffects {
  blur:     Record<string, string>;
  saturate: Record<string, string>;
  noise?:   { subtle: string; medium: string; };
}

export interface ComponentVariant { [property: string]: string; }

export interface ThemeComponents {
  button?:   { base?: ComponentVariant; variants?: Record<string, ComponentVariant>; sizes?: Record<string, ComponentVariant>; };
  card?:     { base?: ComponentVariant; variants?: Record<string, ComponentVariant>; };
  sidebar?:  { base?: ComponentVariant; };
  header?:   { base?: ComponentVariant; };
  modal?:    { overlay?: ComponentVariant; panel?: ComponentVariant; };
  input?:    { base?: ComponentVariant; states?: Record<string, ComponentVariant>; };
  dropdown?: { base?: ComponentVariant; };
  toast?:    { base?: ComponentVariant; };
  [key: string]: unknown;
}

export interface ThemeTenant {
  name: string; shortName: string;
  logo:    { light: string; dark: string; favicon: string; width: number; height: number; };
  contact: { website: string; email: string; phone: string; address: string; };
  locale: string; timezone: string; academicYear: string;
}

export interface Theme {
  meta:         { name: string; version: string; author: string; description: string; tenantId?: string; createdAt?: string; updatedAt?: string; };
  tenant?:      ThemeTenant;
  colors:       ThemeColors;
  glass:        ThemeGlass;
  typography:   ThemeTypography;
  spacing:      ThemeSpacing;
  layout:       ThemeLayout;
  borderRadius: Record<string, string>;
  shadows:      Record<string, string>;
  animation:    ThemeAnimation;
  transitions:  Record<string, string>;
  effects:      ThemeEffects;
  zIndex:       Record<string, string>;
  icons?:       { library: string; size: Record<string, string>; strokeWidth: string; };
  components?:  ThemeComponents;
}

export interface ThemeContextType {
  theme:           Theme;
  themeName:       string;
  isDark:          boolean;
  isLoading:       boolean;
  setTheme:        (theme: Theme, name: string) => void;
  loadTheme:       (name: string) => Promise<void>;
  toggleDarkMode:  () => void;
  availableThemes: string[];
}

export interface ThemeChangeEvent {
  theme: Theme; themeName: string; previousTheme?: Theme;
}

export interface ThemeStorage {
  themeName: string; isDark: boolean; customTheme?: Theme;
}
