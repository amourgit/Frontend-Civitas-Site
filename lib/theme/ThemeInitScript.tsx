// ============================================================
// lib/theme/ThemeInitScript.tsx
// Composant Server — injecte le script anti-FOUC dans <head>
// Doit être rendu AVANT tout autre contenu dans layout.tsx
// ============================================================

import { ThemeLoader } from './themeLoader';

/**
 * Rendu côté serveur uniquement.
 * Injecte un <script> synchrone qui :
 *   1. Lit les prefs theme dans localStorage
 *   2. Applique dark/light class sur <html>
 *   3. Injecte des variables CSS minimales AVANT le premier paint
 *
 * Résultat : ZÉRO flash blanc/noir au chargement, ZÉRO FOUC.
 */
export function ThemeInitScript() {
  const loader = ThemeLoader.getInstance();
  const script = loader.buildSSRScript();

  return (
    <script
      id="__iam_theme_init__"
      // dangerouslySetInnerHTML est obligatoire ici pour un script inline Next.js
      dangerouslySetInnerHTML={{ __html: script }}
      // suppressHydrationWarning évite les warnings React
      suppressHydrationWarning
    />
  );
}
