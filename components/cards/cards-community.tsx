import React, { memo, useCallback } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

interface ProjectCardProps {
  id: string;
  title: string;
  role: string;
  avatar: string;
  coverImage?: string;
  isOnline?: boolean;
  lastCommit: {
    count: number;
    images: string[];
  };
  stats: {
    value: string;
    trend: 'up' | 'down';
    color: string;
  };
  description: string;
  members: ProjectMember[];
  additionalMembers?: number;
  status: 'DONE' | 'IN_PROGRESS' | 'PENDING' | 'REVIEW';
  statusColor: string;
  backgroundColor: string;
  onCardClick?: () => void;
  onMemberClick?: (member: ProjectMember) => void;
  className?: string;
}

// Memoized trend chart component for performance
const TrendChart = memo(({ trend, color }: { trend: 'up' | 'down'; color: string }) => {
  const points = trend === 'up' 
    ? "0,20 5,18 10,15 15,12 20,8 25,5 30,2"
    : "0,2 5,5 10,8 15,12 20,15 25,18 30,20";
  
  return (
    <svg width="50" height="24" className="ml-2" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

TrendChart.displayName = 'TrendChart';

// Memoized avatar component
const Avatar = memo(({ 
  src, 
  alt, 
  size = "w-5 h-5", 
  isOnline = false,
  onClick 
}: { 
  src: string; 
  alt: string; 
  size?: string; 
  isOnline?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <div className="relative flex-shrink-0">
    <img 
      src={src} 
      alt={alt}
      className={`${size} rounded-full object-cover border border-white/30 ${
        onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''
      } shadow-sm`}
      onClick={onClick}
      loading="lazy"
    />
    {isOnline && (
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
    )}
  </div>
));

Avatar.displayName = 'Avatar';

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  role,
  avatar,
  coverImage,
  isOnline = false,
  lastCommit,
  stats,
  description,
  members,
  additionalMembers = 0,
  status,
  backgroundColor,
  onCardClick,
  onMemberClick,
  className = ""
}) => {
  const getStatusColor = useCallback((status: string) => {
    const colors = {
      'DONE': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'IN_PROGRESS': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'PENDING': 'bg-gradient-to-r from-orange-500 to-orange-600',
      'REVIEW': 'bg-gradient-to-r from-green-500 to-green-600'
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  }, []);

  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick();
    }
  }, [onCardClick]);

  const handleMemberClick = useCallback((member: ProjectMember) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMemberClick) {
      onMemberClick(member);
    }
  }, [onMemberClick]);

  return (
    <div
      className={`rounded-xl p-3 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden ${backgroundColor} ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <style>{`
        .project-card {
          contain: layout style paint;
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: transform;
        }
        
        .cover-overlay {
          backdrop-filter: blur(1px);
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.7) 100%
          );
        }
        
        @media (prefers-reduced-motion: reduce) {
          .project-card {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Cover image background */}
      {coverImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={coverImage} 
            alt={`${title} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="cover-overlay absolute inset-0" />
        </div>
      )}

      <div className="project-card relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar 
              src={avatar} 
              alt={title}
              size="w-8 h-8"
              isOnline={isOnline}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold drop-shadow-lg leading-tight truncate">
                {title}
              </h2>
              <p className="text-white/90 text-xs drop-shadow-md leading-none truncate">
                {role}
              </p>
            </div>
          </div>
          <button 
            className="text-white/70 hover:text-white transition-colors p-1"
            onClick={(e) => e.stopPropagation()}
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4 drop-shadow-lg" />
          </button>
        </div>

        {/* Last commit section */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {lastCommit.images.slice(0, 2).map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`commit ${index + 1}`}
                    className="w-5 h-5 rounded-md object-cover border border-white/30 shadow-sm"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="bg-white/25 backdrop-blur-sm rounded-md px-2 py-1 text-white font-semibold shadow-sm border border-white/20">
                <span className="text-xs">+{lastCommit.count}</span>
              </div>
            </div>
            
            {/* Stats with trend chart */}
            <div className="flex items-center">
              <span 
                className="text-xs font-bold drop-shadow-lg" 
                style={{ color: stats.color }}
              >
                {stats.value}
              </span>
              <TrendChart trend={stats.trend} color={stats.color} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-white/85 text-xs leading-tight drop-shadow-sm line-clamp-2">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-1">
              {members.slice(0, 2).map((member) => (
                <Avatar
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  onClick={handleMemberClick(member)}
                />
              ))}
              {additionalMembers > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500/90 flex items-center justify-center text-white text-xs font-bold border border-white/30 shadow-sm backdrop-blur-sm">
                  +{additionalMembers}
                </div>
              )}
            </div>
          </div>

          <div className={`px-2 py-1 rounded-full text-white font-semibold text-xs shadow-sm border border-white/20 backdrop-blur-sm ${getStatusColor(status)}`}>
            {status.replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectCard);