// ============================================================
// hooks/useGlass.ts
// Hook utilitaire pour appliquer le Glass Morphism facilement
// depuis n'importe quel composant
// ============================================================

import { useMemo } from 'react';
import { useTheme } from '@/lib/theme';

type GlassLayer =
  | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  | 'card' | 'sidebar' | 'header' | 'modal' | 'dropdown' | 'toast';

interface GlassStyle {
  background:          string;
  backdropFilter:      string;
  WebkitBackdropFilter:string;
  border:              string;
  boxShadow:           string;
  borderRadius?:       string;
  transition?:         string;
}

/**
 * Retourne un style object React inline pour appliquer le Glass Morphism.
 *
 * Usage :
 *   const glassCard = useGlass('card');
 *   <div style={glassCard}>...</div>
 *
 * Ou avec Tailwind className + style inline pour backdrop-filter :
 *   const { style, className } = useGlass('card', { withRadius: 'xl', withTransition: true });
 */
export function useGlass(
  layer: GlassLayer = 'md',
  options?: {
    withRadius?:     keyof typeof radiusMap;
    withTransition?: boolean;
  }
): GlassStyle {
  const { isDark } = useTheme();

  return useMemo(() => {
    const style: GlassStyle = {
      background:           `var(--glass-${layer}-bg)`,
      backdropFilter:       `var(--glass-${layer}-blur)`,
      WebkitBackdropFilter: `var(--glass-${layer}-blur)`,
      border:               `var(--glass-${layer}-border)`,
      boxShadow:            `var(--glass-${layer}-shadow)`,
    };

    if (options?.withRadius) {
      style.borderRadius = `var(--radius-${options.withRadius})`;
    }
    if (options?.withTransition) {
      style.transition = 'var(--transition-glass)';
    }

    return style;
  // isDark en dep pour re-calc si le mode change (les var CSS changent)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, isDark, options?.withRadius, options?.withTransition]);
}

/**
 * Retourne les classes Tailwind + style inline pour le Glass Morphism.
 * Utile quand on veut combiner Tailwind avec le glass custom.
 */
export function useGlassClass(layer: GlassLayer = 'md') {
  const style = useGlass(layer);
  // Classes Tailwind pour le layout / état (hover, focus, etc.)
  const className = 'relative overflow-hidden';
  return { style, className };
}

const radiusMap = {
  none: 0, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6, '3xl': 7, '4xl': 8, full: 9,
};
