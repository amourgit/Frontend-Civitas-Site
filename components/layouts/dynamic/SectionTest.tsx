import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';
  py?: SpacingSize;
  px?: SpacingSize;
  background?: string;
  bottomBorder?: boolean;
  topBorder?: boolean;
  id?: string;
}

interface SectionHeaderProps extends BaseProps {
  align?: AlignItems;
  justify?: JustifyContent;
  direction?: FlexDirection;
  gap?: SpacingSize;
  pb?: SpacingSize;
  border?: boolean;
  borderColor?: string;
}

interface SectionBodyProps extends BaseProps {
  layout?: 'flex' | 'grid' | 'stack';
  direction?: FlexDirection;
  gridCols?: GridCols;
  gridColsMd?: GridCols;
  gridColsLg?: GridCols;
  gap?: SpacingSize;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  pt?: SpacingSize;
  pb?: SpacingSize;
}

interface SectionTitleProps extends BaseProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: string;
}

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

const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  className,
  align = 'center',
  justify = 'between',
  direction = 'row',
  gap = 'md',
  pb = 'md',
  border = false,
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

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className,
  as: Component = 'h2',
  size = 'xl',
  weight = 'bold',
  color = 'text-white',
}) => {
  return (
    <Component
      className={cn(
        `text-${size}`,
        `font-${weight}`,
        color,
        className
      )}
    >
      {children}
    </Component>
  );
};

export const Section = Object.assign(SectionRoot, {
  Header: SectionHeader,
  Body: SectionBody,
  Title: SectionTitle,
});