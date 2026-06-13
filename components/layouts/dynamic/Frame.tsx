import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES & INTERFACES
// ============================================

type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';

/**
 * Variantes de bordures sci-fi disponibles
 */
type BorderVariant = 
  | 'default'        // Coins coupés simples
  | 'tech-corners'   // Coins avec détails techniques
  | 'angular'        // Coins angulaires multiples
  | 'notched'        // Encoches sur les côtés
  | 'circuit'        // Style circuit électronique
  | 'beveled'        // Coins biseautés
  | 'sliced'         // Coins tranchés diagonalement
  | 'paneled';       // Panneaux avec découpes

/**
 * Couleurs de thème pour les bordures
 */
type ThemeColor = 
  | 'cyan'
  | 'blue' 
  | 'purple'
  | 'emerald'
  | 'amber'
  | 'red'
  | 'custom';

interface BaseProps {
  children?: ReactNode;
  className?: string;
}

interface FrameRootProps extends BaseProps {
  /** Variante de bordure sci-fi */
  variant?: BorderVariant;
  /** Couleur du thème */
  theme?: ThemeColor;
  /** Couleur personnalisée (si theme='custom') */
  customColor?: string;
  /** Intensité de la lueur */
  glowIntensity?: 'none' | 'low' | 'medium' | 'high';
  /** Animation de la bordure */
  animated?: boolean;
  /** Largeur de la bordure */
  borderWidth?: 1 | 2 | 3 | 4;
  /** Padding global */
  p?: SpacingSize;
  /** Largeur maximale */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  /** ID pour ancre */
  id?: string;
}

interface FrameHeaderProps extends BaseProps {
  /** Alignement des éléments */
  align?: AlignItems;
  /** Justification du contenu */
  justify?: JustifyContent;
  /** Direction du flex */
  direction?: FlexDirection;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Hauteur du header */
  height?: 'sm' | 'md' | 'lg';
  /** Arrière-plan avec gradient */
  gradient?: boolean;
}

interface FrameBodyProps extends BaseProps {
  /** Type de layout */
  layout?: 'flex' | 'grid' | 'stack';
  /** Direction du flex (si layout=flex) */
  direction?: FlexDirection;
  /** Colonnes de la grille (si layout=grid) */
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Alignement des items */
  alignItems?: AlignItems;
  /** Justification du contenu */
  justifyContent?: JustifyContent;
  /** Padding */
  p?: SpacingSize;
  /** Scroll si contenu dépasse */
  scrollable?: boolean;
  /** Hauteur max si scrollable */
  maxHeight?: string;
}

interface FrameFooterProps extends BaseProps {
  /** Alignement des éléments */
  align?: AlignItems;
  /** Justification du contenu */
  justify?: JustifyContent;
  /** Direction du flex */
  direction?: FlexDirection;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Hauteur du footer */
  height?: 'sm' | 'md' | 'lg';
  /** Transparence accrue */
  transparent?: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const spacingMap: Record<SpacingSize, string> = {
  none: '0',
  xs: '2',
  sm: '3',
  md: '4',
  lg: '6',
  xl: '8',
  '2xl': '12',
};

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
};

const heightMap = {
  sm: 'h-12',
  md: 'h-16',
  lg: 'h-20',
};

const themeColors: Record<ThemeColor, string> = {
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#a855f7',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  custom: '#06b6d4',
};

const getSpacing = (size?: SpacingSize) => {
  if (!size) return '';
  return spacingMap[size];
};

/**
 * Génère le membre-path SVG pour chaque variante de bordure
 * Chaque variante a des découpes détaillées sur TOUS les côtés (haut, bas, gauche, droite)
 */
const getBorderClipPath = (variant: BorderVariant): string => {
  switch (variant) {
    case 'tech-corners':
      // Découpes techniques sur tous les côtés avec détails asymétriques
      return `polygon(
        0 15px, 8px 8px, 15px 0,
        20% 0, calc(20% + 8px) 6px, calc(20% + 16px) 6px, calc(20% + 24px) 0,
        45% 0, calc(45% + 6px) 8px, calc(45% + 12px) 0,
        calc(100% - 15px) 0, calc(100% - 8px) 8px, 100% 15px,
        100% 30%, calc(100% - 6px) calc(30% + 8px), calc(100% - 6px) calc(30% + 16px), 100% calc(30% + 24px),
        100% 60%, calc(100% - 8px) calc(60% + 6px), 100% calc(60% + 12px),
        100% calc(100% - 15px), calc(100% - 8px) calc(100% - 8px), calc(100% - 15px) 100%,
        calc(80% + 24px) 100%, calc(80% + 16px) calc(100% - 6px), calc(80% + 8px) calc(100% - 6px), 80% 100%,
        calc(55% + 12px) 100%, calc(55% + 6px) calc(100% - 8px), 55% 100%,
        15px 100%, 8px calc(100% - 8px), 0 calc(100% - 15px),
        0 calc(70% + 24px), 6px calc(70% + 16px), 6px calc(70% + 8px), 0 70%,
        0 calc(40% + 12px), 8px calc(40% + 6px), 0 40%
      )`;
    
    case 'angular':
      // Multi-angles sur tous les côtés avec variations
      return `polygon(
        0 25px, 12px 12px, 25px 0,
        calc(25% - 8px) 0, 25% 12px, calc(25% + 8px) 0,
        calc(50% - 15px) 0, calc(50% - 8px) 10px, 50% 0, calc(50% + 8px) 10px, calc(50% + 15px) 0,
        calc(75% - 8px) 0, 75% 12px, calc(75% + 8px) 0,
        calc(100% - 25px) 0, calc(100% - 12px) 12px, 100% 25px,
        100% calc(25% - 8px), calc(100% - 12px) 25%, 100% calc(25% + 8px),
        100% calc(50% - 15px), calc(100% - 10px) calc(50% - 8px), 100% 50%, calc(100% - 10px) calc(50% + 8px), 100% calc(50% + 15px),
        100% calc(75% - 8px), calc(100% - 12px) 75%, 100% calc(75% + 8px),
        100% calc(100% - 25px), calc(100% - 12px) calc(100% - 12px), calc(100% - 25px) 100%,
        calc(75% + 8px) 100%, 75% calc(100% - 12px), calc(75% - 8px) 100%,
        calc(50% + 15px) 100%, calc(50% + 8px) calc(100% - 10px), 50% 100%, calc(50% - 8px) calc(100% - 10px), calc(50% - 15px) 100%,
        calc(25% + 8px) 100%, 25% calc(100% - 12px), calc(25% - 8px) 100%,
        25px 100%, 12px calc(100% - 12px), 0 calc(100% - 25px),
        0 calc(75% + 8px), 12px 75%, 0 calc(75% - 8px),
        0 calc(50% + 15px), 10px calc(50% + 8px), 0 50%, 10px calc(50% - 8px), 0 calc(50% - 15px),
        0 calc(25% + 8px), 12px 25%, 0 calc(25% - 8px)
      )`;
    
    case 'notched':
      // Encoches sur tous les bords avec pattern régulier
      return `polygon(
        0 0, calc(15% - 6px) 0, 15% 8px, calc(35% - 6px) 8px, 35% 0,
        calc(65% - 6px) 0, 65% 8px, calc(85% - 6px) 8px, 85% 0, 100% 0,
        100% calc(15% - 6px), calc(100% - 8px) 15%, calc(100% - 8px) calc(35% - 6px), 100% 35%,
        100% calc(65% - 6px), calc(100% - 8px) 65%, calc(100% - 8px) calc(85% - 6px), 100% 85%,
        100% 100%, 85% 100%, calc(85% - 6px) calc(100% - 8px), calc(65% + 6px) calc(100% - 8px), 65% 100%,
        35% 100%, calc(35% - 6px) calc(100% - 8px), calc(15% + 6px) calc(100% - 8px), 15% 100%, 0 100%,
        0 85%, 8px calc(85% - 6px), 8px calc(65% + 6px), 0 65%,
        0 35%, 8px calc(35% - 6px), 8px calc(15% + 6px), 0 15%
      )`;
    
    case 'circuit':
      // Pattern de circuit électronique sur tous les côtés
      return `polygon(
        0 10px, 5px 5px, 10px 0,
        18% 0, calc(18% + 3px) 3px, calc(18% + 6px) 3px, calc(18% + 9px) 0,
        28% 0, calc(28% + 3px) 5px, calc(28% + 6px) 0,
        42% 0, calc(42% + 4px) 4px, calc(42% + 8px) 4px, calc(42% + 12px) 0,
        58% 0, calc(58% + 3px) 5px, calc(58% + 6px) 0,
        72% 0, calc(72% + 3px) 3px, calc(72% + 6px) 3px, calc(72% + 9px) 0,
        82% 0, calc(82% + 3px) 5px, calc(82% + 6px) 0,
        calc(100% - 10px) 0, calc(100% - 5px) 5px, 100% 10px,
        100% 18%, calc(100% - 3px) calc(18% + 3px), calc(100% - 3px) calc(18% + 6px), 100% calc(18% + 9px),
        100% 28%, calc(100% - 5px) calc(28% + 3px), 100% calc(28% + 6px),
        100% 42%, calc(100% - 4px) calc(42% + 4px), calc(100% - 4px) calc(42% + 8px), 100% calc(42% + 12px),
        100% 58%, calc(100% - 5px) calc(58% + 3px), 100% calc(58% + 6px),
        100% 72%, calc(100% - 3px) calc(72% + 3px), calc(100% - 3px) calc(72% + 6px), 100% calc(72% + 9px),
        100% 82%, calc(100% - 5px) calc(82% + 3px), 100% calc(82% + 6px),
        100% calc(100% - 10px), calc(100% - 5px) calc(100% - 5px), calc(100% - 10px) 100%,
        calc(82% + 9px) 100%, calc(82% + 6px) calc(100% - 3px), calc(82% + 3px) calc(100% - 3px), 82% 100%,
        calc(72% + 6px) 100%, calc(72% + 3px) calc(100% - 5px), 72% 100%,
        calc(58% + 12px) 100%, calc(58% + 8px) calc(100% - 4px), calc(58% + 4px) calc(100% - 4px), 58% 100%,
        calc(42% + 6px) 100%, calc(42% + 3px) calc(100% - 5px), 42% 100%,
        calc(28% + 9px) 100%, calc(28% + 6px) calc(100% - 3px), calc(28% + 3px) calc(100% - 3px), 28% 100%,
        calc(18% + 6px) 100%, calc(18% + 3px) calc(100% - 5px), 18% 100%,
        10px 100%, 5px calc(100% - 5px), 0 calc(100% - 10px),
        0 calc(82% + 9px), 3px calc(82% + 6px), 3px calc(82% + 3px), 0 82%,
        0 calc(72% + 6px), 5px calc(72% + 3px), 0 72%,
        0 calc(58% + 12px), 4px calc(58% + 8px), 4px calc(58% + 4px), 0 58%,
        0 calc(42% + 6px), 5px calc(42% + 3px), 0 42%,
        0 calc(28% + 9px), 3px calc(28% + 6px), 3px calc(28% + 3px), 0 28%,
        0 calc(18% + 6px), 5px calc(18% + 3px), 0 18%
      )`;
    
    case 'beveled':
      // Biseaux élégants avec variations sur chaque côté
      return `polygon(
        0 20px, 10px 10px, 20px 0,
        30% 0, calc(30% + 8px) 8px, calc(30% + 16px) 0,
        70% 0, calc(70% + 8px) 8px, calc(70% + 16px) 0,
        calc(100% - 20px) 0, calc(100% - 10px) 10px, 100% 20px,
        100% 30%, calc(100% - 8px) calc(30% + 8px), 100% calc(30% + 16px),
        100% 70%, calc(100% - 8px) calc(70% + 8px), 100% calc(70% + 16px),
        100% calc(100% - 20px), calc(100% - 10px) calc(100% - 10px), calc(100% - 20px) 100%,
        calc(70% + 16px) 100%, calc(70% + 8px) calc(100% - 8px), 70% 100%,
        calc(30% + 16px) 100%, calc(30% + 8px) calc(100% - 8px), 30% 100%,
        20px 100%, 10px calc(100% - 10px), 0 calc(100% - 20px),
        0 calc(70% + 16px), 8px calc(70% + 8px), 0 70%,
        0 calc(30% + 16px), 8px calc(30% + 8px), 0 30%
      )`;
    
    case 'sliced':
      // Tranches diagonales variées sur tous les côtés
      return `polygon(
        0 0, 25% 0, calc(25% + 15px) 15px, calc(25% + 30px) 0,
        calc(100% - 35px) 0, 100% 35px,
        100% 25%, calc(100% - 15px) calc(25% + 15px), 100% calc(25% + 30px),
        100% calc(100% - 35px), calc(100% - 35px) 100%,
        calc(75% + 30px) 100%, calc(75% + 15px) calc(100% - 15px), 75% 100%,
        35px 100%, 0 calc(100% - 35px),
        0 calc(75% + 30px), 15px calc(75% + 15px), 0 75%
      )`;
    
    case 'paneled':
      // Panneaux avec découpes sur tous les côtés
      return `polygon(
        0 12px, 6px 6px, 12px 0,
        20% 0, calc(20% + 4px) 6px, calc(20% + 8px) 6px, calc(20% + 12px) 0,
        calc(40% - 6px) 0, 40% 8px, calc(40% + 6px) 0,
        calc(60% - 6px) 0, 60% 8px, calc(60% + 6px) 0,
        calc(80% - 12px) 0, calc(80% - 8px) 6px, calc(80% - 4px) 6px, 80% 0,
        calc(100% - 12px) 0, calc(100% - 6px) 6px, 100% 12px,
        100% 20%, calc(100% - 6px) calc(20% + 4px), calc(100% - 6px) calc(20% + 8px), 100% calc(20% + 12px),
        100% calc(40% - 6px), calc(100% - 8px) 40%, 100% calc(40% + 6px),
        100% calc(60% - 6px), calc(100% - 8px) 60%, 100% calc(60% + 6px),
        100% calc(80% - 12px), calc(100% - 6px) calc(80% - 8px), calc(100% - 6px) calc(80% - 4px), 100% 80%,
        100% calc(100% - 12px), calc(100% - 6px) calc(100% - 6px), calc(100% - 12px) 100%,
        80% 100%, calc(80% - 4px) calc(100% - 6px), calc(80% - 8px) calc(100% - 6px), calc(80% - 12px) 100%,
        calc(60% + 6px) 100%, 60% calc(100% - 8px), calc(60% - 6px) 100%,
        calc(40% + 6px) 100%, 40% calc(100% - 8px), calc(40% - 6px) 100%,
        calc(20% + 12px) 100%, calc(20% + 8px) calc(100% - 6px), calc(20% + 4px) calc(100% - 6px), 20% 100%,
        12px 100%, 6px calc(100% - 6px), 0 calc(100% - 12px),
        0 80%, 6px calc(80% - 4px), 6px calc(80% - 8px), 0 calc(80% - 12px),
        0 calc(60% + 6px), 8px 60%, 0 calc(60% - 6px),
        0 calc(40% + 6px), 8px 40%, 0 calc(40% - 6px),
        0 calc(20% + 12px), 6px calc(20% + 8px), 6px calc(20% + 4px), 0 20%
      )`;
    
    default: // 'default'
      // Simple mais avec des découpes sur chaque coin
      return `polygon(
        0 18px, 9px 9px, 18px 0,
        calc(100% - 18px) 0, calc(100% - 9px) 9px, 100% 18px,
        100% calc(100% - 18px), calc(100% - 9px) calc(100% - 9px), calc(100% - 18px) 100%,
        18px 100%, 9px calc(100% - 9px), 0 calc(100% - 18px)
      )`;
  }
};

/**
 * Génère les classes de lueur selon l'intensité
 */
const getGlowClasses = (intensity: FrameRootProps['glowIntensity'], color: string): string => {
  if (intensity === 'none') return '';
  
  const intensityMap = {
    low: `shadow-[0_0_10px_${color}40]`,
    medium: `shadow-[0_0_20px_${color}60]`,
    high: `shadow-[0_0_30px_${color}80,0_0_50px_${color}40]`,
  };
  
  return intensityMap[intensity || 'medium'];
};

// ============================================
// FRAME ROOT
// ============================================

const FrameRoot: React.FC<FrameRootProps> = ({
  children,
  className,
  variant = 'default',
  theme = 'cyan',
  customColor,
  glowIntensity = 'medium',
  animated = false,
  borderWidth = 2,
  p = 'none',
  maxWidth = 'full',
  id,
}) => {
  const color = theme === 'custom' && customColor ? customColor : themeColors[theme];
  const membrePath = getBorderClipPath(variant);
  
  return (
    <div
      id={id}
      className={cn(
        'relative w-full',
        `p-${getSpacing(p)}`,
        maxWidthMap[maxWidth],
        className
      )}
    >
      {/* Conteneur avec membre-path */}
      <div 
        className={cn(
          'relative bg-slate-950/50 backdrop-blur-sm',
          getGlowClasses(glowIntensity, color),
          animated && 'animate-pulse-slow'
        )}
        style={{
          membrePath,
          WebkitClipPath: membrePath,
        }}
      >
        {/* Bordure externe avec gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${color}80, ${color}40, ${color}80)`,
            membrePath,
            WebkitClipPath: membrePath,
          }}
        />
        
        {/* Contenu avec inset pour la bordure */}
        <div 
          className="relative bg-slate-950/90"
          style={{
            margin: `${borderWidth}px`,
            membrePath: getBorderClipPath(variant),
            WebkitClipPath: getBorderClipPath(variant),
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Accents lumineux sur les coins (optionnel pour certains variants) */}
      {animated && (
        <>
          <div 
            className="absolute top-0 left-4 w-8 h-0.5 animate-pulse"
            style={{ backgroundColor: color }}
          />
          <div 
            className="absolute bottom-0 right-4 w-8 h-0.5 animate-pulse"
            style={{ 
              backgroundColor: color,
              animationDelay: '0.5s'
            }}
          />
        </>
      )}
    </div>
  );
};

// ============================================
// FRAME HEADER
// ============================================

const FrameHeader: React.FC<FrameHeaderProps> = ({
  children,
  className,
  align = 'center',
  justify = 'between',
  direction = 'row',
  gap = 'md',
  height = 'md',
  gradient = true,
}) => {
  return (
    <div
      className={cn(
        'flex border-b border-white/10',
        `flex-${direction}`,
        `items-${align}`,
        `justify-${justify}`,
        `gap-${getSpacing(gap)}`,
        heightMap[height],
        'px-4 md:px-6',
        gradient && 'bg-gradient-to-b from-white/5 to-transparent',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// FRAME BODY
// ============================================

const FrameBody: React.FC<FrameBodyProps> = ({
  children,
  className,
  layout = 'flex',
  direction = 'col',
  gridCols = 1,
  gap = 'md',
  alignItems,
  justifyContent,
  p = 'md',
  scrollable = false,
  maxHeight = '500px',
}) => {
  const baseClasses = cn(
    `p-${getSpacing(p)}`,
    `gap-${getSpacing(gap)}`,
    scrollable && 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
  );

  const style = scrollable ? { maxHeight } : undefined;

  if (layout === 'grid') {
    return (
      <div
        className={cn(
          'grid',
          `grid-cols-${gridCols}`,
          baseClasses,
          className
        )}
        style={style}
      >
        {children}
      </div>
    );
  }

  if (layout === 'stack') {
    return (
      <div 
        className={cn(
          `space-y-${getSpacing(gap)}`,
          `p-${getSpacing(p)}`,
          scrollable && 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
          className
        )}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex',
        `flex-${direction}`,
        alignItems && `items-${alignItems}`,
        justifyContent && `justify-${justifyContent}`,
        baseClasses,
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

// ============================================
// FRAME FOOTER
// ============================================

const FrameFooter: React.FC<FrameFooterProps> = ({
  children,
  className,
  align = 'center',
  justify = 'between',
  direction = 'row',
  gap = 'md',
  height = 'md',
  transparent = true,
}) => {
  return (
    <div
      className={cn(
        'flex border-t border-white/10',
        `flex-${direction}`,
        `items-${align}`,
        `justify-${justify}`,
        `gap-${getSpacing(gap)}`,
        heightMap[height],
        'px-4 md:px-6',
        transparent ? 'bg-white/[0.02]' : 'bg-white/5',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const Frame = Object.assign(FrameRoot, {
  Header: FrameHeader,
  Body: FrameBody,
  Footer: FrameFooter,
});

export type {
  FrameRootProps,
  FrameHeaderProps,
  FrameBodyProps,
  FrameFooterProps,
  BorderVariant,
  ThemeColor,
};