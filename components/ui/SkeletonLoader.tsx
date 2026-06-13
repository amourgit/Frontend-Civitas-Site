// components/ui/SkeletonLoader.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-wave';
      case 'pulse':
        return 'animate-pulse';
      case 'none':
      default:
        return '';
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`
        bg-gray-300 
        ${getVariantClasses()} 
        ${getAnimationClasses()} 
        ${className}
      `}
      style={style}
    />
  );
};

// Skeleton spécialisé pour les cartes de projet
export const ProjectCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full min-w-[200px] ${className}`}>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-4 animate-pulse">
        {/* Header avec avatar et status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton width={100} height={16} />
              <Skeleton width={80} height={12} />
            </div>
          </div>
          <Skeleton variant="circular" width={8} height={8} />
        </div>

        {/* Cover Image */}
        <Skeleton variant="rectangular" width="100%" height={120} />

        {/* Title and description */}
        <div className="space-y-2">
          <Skeleton width="80%" height={20} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton width={60} height={16} />
          </div>
          <div className="flex -space-x-2">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Skeleton width={80} height={20} />
          <Skeleton width={40} height={16} />
        </div>
      </div>
    </div>
  );
};

// Grid de skeletons pour le loading initial
export const ProjectCardSkeletonGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className = '' 
}) => {
  return (
    <div className={`
      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
      gap-4 p-4 pt-24
      ${className}
    `}>
      {Array.from({ length: count }, (_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
};