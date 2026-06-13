import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TYPES & INTERFACES
// ============================================

type SpacingSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyContent = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 'auto-fit' | 'auto-fill';

interface BaseProps {
  children?: ReactNode;
  className?: string;
}

interface SectionRootProps extends BaseProps {
  /** Largeur maximale de la section */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';
  /** Padding vertical de la section */
  py?: SpacingSize;
  /** Padding horizontal de la section */
  px?: SpacingSize;
  /** Couleur de fond */
  background?: string;
  /** Bordure en bas */
  bottomBorder?: boolean;
  /** Bordure en haut */
  topBorder?: boolean;
  /** ID pour ancre */
  id?: string;
}

interface SectionHeaderProps extends BaseProps {
  /** Alignement des éléments */
  align?: AlignItems;
  /** Justification du contenu */
  justify?: JustifyContent;
  /** Direction du flex */
  direction?: FlexDirection;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Padding bottom */
  pb?: SpacingSize;
  /** Bordure en bas */
  border?: boolean;
  /** Couleur de la bordure */
  borderColor?: string;
}

interface SectionBodyProps extends BaseProps {
  /** Type de layout */
  layout?: 'flex' | 'grid' | 'stack';
  /** Direction du flex (si layout=flex) */
  direction?: FlexDirection;
  /** Colonnes de la grille (si layout=grid) */
  gridCols?: GridCols;
  /** Colonnes responsive (si layout=grid) */
  gridColsMd?: GridCols;
  gridColsLg?: GridCols;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Alignement des items */
  alignItems?: AlignItems;
  /** Justification du contenu */
  justifyContent?: JustifyContent;
  /** Padding top */
  pt?: SpacingSize;
  /** Padding bottom */
  pb?: SpacingSize;
}

interface SectionFooterProps extends BaseProps {
  /** Alignement des éléments */
  align?: AlignItems;
  /** Justification du contenu */
  justify?: JustifyContent;
  /** Direction du flex */
  direction?: FlexDirection;
  /** Gap entre les éléments */
  gap?: SpacingSize;
  /** Padding top */
  pt?: SpacingSize;
  /** Bordure en haut */
  border?: boolean;
  /** Couleur de la bordure */
  borderColor?: string;
}

interface SectionTitleProps extends BaseProps {
  /** Niveau de titre (h1-h6) */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Taille du texte */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Poids de la police */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  /** Couleur du texte */
  color?: string;
  /** Gradient de texte */
  gradient?: boolean;
}

interface SectionDescriptionProps extends BaseProps {
  /** Taille du texte */
  size?: 'xs' | 'sm' | 'base' | 'lg';
  /** Couleur du texte */
  color?: string;
  /** Opacité */
  opacity?: number;
  /** Marge top */
  mt?: SpacingSize;
}

interface SectionActionsProps extends BaseProps {
  /** Direction */
  direction?: FlexDirection;
  /** Gap */
  gap?: SpacingSize;
  /** Alignement */
  align?: AlignItems;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const spacingMap: Record<SpacingSize, string> = {
  none: '0',
  xs: '0.5',
  sm: '1',
  md: '2',
  lg: '4',
  xl: '6',
  '2xl': '8',
};

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const getSpacing = (size?: SpacingSize) => {
  if (!size) return '';
  return spacingMap[size];
};

const getGridCols = (cols?: GridCols) => {
  if (!cols) return '';
  if (cols === 'auto-fit') return 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]';
  if (cols === 'auto-fill') return 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]';
  return `grid-cols-${cols}`;
};

// ============================================
// SECTION ROOT
// ============================================

const SectionRoot: React.FC<SectionRootProps> = ({
  children,
  className,
  maxWidth = '7xl',
  py = 'xl',
  px = 'md',
  background = 'transparent',
  bottomBorder = false,
  topBorder = false,
  id,
}) => {
  return (
    <section
      id={id}
      className={cn(
        'w-full',
        `py-${getSpacing(py)}`,
        `px-${getSpacing(px)}`,
        bottomBorder && 'border-b border-white/10',
        topBorder && 'border-t border-white/10',
        className
      )}
      style={{ background }}
    >
      <div className={cn('mx-auto', maxWidthMap[maxWidth])}>
        {children}
      </div>
    </section>
  );
};

// ============================================
// SECTION HEADER
// ============================================

const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  className,
  align = 'center',
  justify = 'between',
  direction = 'row',
  gap = 'md',
  pb = 'md',
  border = true,
  borderColor = 'border-white/10',
}) => {
  return (
    <div
      className={cn(
        'flex',
        `flex-${direction}`,
        `items-${align}`,
        `justify-${justify}`,
        `gap-${getSpacing(gap)}`,
        `pb-${getSpacing(pb)}`,
        border && `border-b ${borderColor}`,
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// SECTION BODY
// ============================================

const SectionBody: React.FC<SectionBodyProps> = ({
  children,
  className,
  layout = 'flex',
  direction = 'row',
  gridCols = 4,
  gridColsMd,
  gridColsLg,
  gap = 'md',
  alignItems,
  justifyContent,
  pt = 'md',
  pb = 'none',
}) => {
  const baseClasses = cn(
    `pt-${getSpacing(pt)}`,
    `pb-${getSpacing(pb)}`,
    `gap-${getSpacing(gap)}`
  );

  if (layout === 'grid') {
    return (
      <div
        className={cn(
          'grid',
          getGridCols(gridCols),
          gridColsMd && `md:${getGridCols(gridColsMd)}`,
          gridColsLg && `lg:${getGridCols(gridColsLg)}`,
          baseClasses,
          className
        )}
      >
        {children}
      </div>
    );
  }

  if (layout === 'stack') {
    return (
      <div className={cn('space-y-' + getSpacing(gap), baseClasses, className)}>
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
    >
      {children}
    </div>
  );
};

// ============================================
// SECTION FOOTER
// ============================================

const SectionFooter: React.FC<SectionFooterProps> = ({
  children,
  className,
  align = 'center',
  justify = 'between',
  direction = 'row',
  gap = 'md',
  pt = 'md',
  border = true,
  borderColor = 'border-white/10',
}) => {
  return (
    <div
      className={cn(
        'flex',
        `flex-${direction}`,
        `items-${align}`,
        `justify-${justify}`,
        `gap-${getSpacing(gap)}`,
        `pt-${getSpacing(pt)}`,
        border && `border-t ${borderColor}`,
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// SECTION TITLE
// ============================================

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className,
  as: Component = 'h2',
  size = 'xl',
  weight = 'bold',
  color = 'text-white',
  gradient = false,
}) => {
  return (
    <Component
      className={cn(
        `text-${size}`,
        `font-${weight}`,
        gradient
          ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-membre-text text-transparent'
          : color,
        className
      )}
    >
      {children}
    </Component>
  );
};

// ============================================
// SECTION DESCRIPTION
// ============================================

const SectionDescription: React.FC<SectionDescriptionProps> = ({
  children,
  className,
  size = 'sm',
  color = 'text-white/60',
  opacity,
  mt = 'xs',
}) => {
  return (
    <p
      className={cn(
        `text-${size}`,
        color,
        `mt-${getSpacing(mt)}`,
        className
      )}
      style={opacity ? { opacity } : undefined}
    >
      {children}
    </p>
  );
};

// ============================================
// SECTION ACTIONS
// ============================================

const SectionActions: React.FC<SectionActionsProps> = ({
  children,
  className,
  direction = 'row',
  gap = 'sm',
  align = 'center',
}) => {
  return (
    <div
      className={cn(
        'flex',
        `flex-${direction}`,
        `items-${align}`,
        `gap-${getSpacing(gap)}`,
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

export const Section = Object.assign(SectionRoot, {
  Header: SectionHeader,
  Body: SectionBody,
  Footer: SectionFooter,
  Title: SectionTitle,
  Description: SectionDescription,
  Actions: SectionActions,
});

export type {
  SectionRootProps,
  SectionHeaderProps,
  SectionBodyProps,
  SectionFooterProps,
  SectionTitleProps,
  SectionDescriptionProps,
  SectionActionsProps,
};