// components/cards/MemoizedProjectCard.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';

export interface ProjectCard {
  id: string;
  title: string;
  role: string;
  avatar: string;
  coverImage: string;
  isOnline: boolean;
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
  members: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  additionalMembers: number;
  status: 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'PAUSED';
  statusColor: string;
  backgroundColor: string;
}

interface ProjectCardProps extends ProjectCard {
  onProjectClick?: (project: ProjectCard) => void;
  index?: number;
  viewMode?: 'grid' | 'list-detailed' | 'list-simple';
}

const StatusBadge = memo<{ status: ProjectCard['status']; color: string }>(({ status, color }) => {
  const statusLabels = {
    'IN_PROGRESS': 'En cours',
    'REVIEW': 'En révision',
    'COMPLETED': 'Terminé',
    'PAUSED': 'En pause'
  };

  return (
    <span 
      className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 flex-shrink-0`}
    >
      {statusLabels[status]}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

const MemberAvatars = memo<{
  members: ProjectCard['members']; 
  additionalMembers: number;
}>(({ members, additionalMembers }) => (
  <div className="flex -space-x-1 items-center">
    {members.slice(0, 3).map((member) => (
      <div key={member.id} className="relative flex-shrink-0">
        <img
          src={member.avatar}
          alt={member.name}
          width={20}
          height={20}
          className="rounded-full border-2 border-white/90 object-cover"
          style={{
            width: '20px',
            height: '20px',
            minWidth: '20px',
            maxWidth: '20px',
            aspectRatio: '1/1'
          }}
          loading="lazy"
        />
      </div>
    ))}
    {additionalMembers > 0 && (
      <div
        className="flex items-center justify-center rounded-full border-2 border-white/90 text-xs font-medium bg-gray-600/80 text-white ml-1"
        style={{
          width: '20px',
          height: '20px',
          minWidth: '20px',
          maxWidth: '20px',
          aspectRatio: '1/1'
        }}
      >
        +{additionalMembers}
      </div>
    )}
  </div>
));

MemberAvatars.displayName = 'MemberAvatars';

const StatsIndicator = memo<{ stats: ProjectCard['stats'] }>(({ stats }) => (
  <div className="flex items-center space-x-1">
    <span 
      className="text-xs font-medium"
      style={{ color: stats.color }}
    >
      {stats.value}
    </span>
    <div className={`w-2 h-2 ${stats.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
      {stats.trend === 'up' ? '↗' : '↘'}
    </div>
  </div>
));

StatsIndicator.displayName = 'StatsIndicator';

export const MemoizedProjectCard = memo<ProjectCardProps>(({
  id,
  title,
  role,
  avatar,
  coverImage,
  isOnline,
  lastCommit,
  stats,
  description,
  members,
  additionalMembers,
  status,
  statusColor,
  backgroundColor,
  onProjectClick,
  index,
  viewMode = 'grid'
}) => {
  const projectData = btoa(JSON.stringify({
    id, title, role, avatar, coverImage, isOnline,
    lastCommit, stats, description, members, additionalMembers,
    status, statusColor, backgroundColor
  }));

  const handleClick = () => {
    if (onProjectClick) {
      onProjectClick({
        id, title, role, avatar, coverImage, isOnline,
        lastCommit, stats, description, members, additionalMembers,
        status, statusColor, backgroundColor
      });
    }
  };

  // Mode liste simple - version épurée
  if (viewMode === 'list-simple') {
    return (
      <Link 
        to={`/apps/community/${id}/infos?data=${projectData}`}
        className="block w-full"
      >
        <div
          className={`
            group relative overflow-hidden rounded-lg cursor-pointer w-full
            transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg
            backdrop-blur-xl border border-white/10 shadow-md
            bg-transparent
            
          `}
          style={{ 
            willChange: 'transform',
            contain: 'layout style paint'
          }}
        >
          <div className="p-4 flex items-center justify-between">
            {/* Contenu principal simplifié */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="text-xs text-white/50 font-mono flex-shrink-0">
                #{index !== undefined ? String(index + 1).padStart(3, '0') : id}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm leading-tight truncate">{title}</h3>
                <p className="text-xs text-white/60 leading-none truncate mt-1">{description}</p>
              </div>
            </div>

            {/* Info à droite */}
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
              <StatsIndicator stats={stats} />
              <MemberAvatars members={members} additionalMembers={additionalMembers} />
              <StatusBadge status={status} color={statusColor} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Mode liste détaillée - version complète
  if (viewMode === 'list-detailed') {
    return (
      <Link 
        to={`/apps/community/${id}/infos?data=${projectData}`}
        className="block w-full"
      >
        <div
          className={`
            group relative overflow-hidden rounded-xl cursor-pointer w-full
            transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl
            backdrop-blur-xl border border-white/10 shadow-lg
            bg-transparent
          `}
          style={{ 
            willChange: 'transform',
            contain: 'layout style paint'
          }}
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <img
                  src={avatar}
                  alt={role}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    maxWidth: '40px',
                    aspectRatio: '1/1'
                  }}
                  loading="lazy"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} style={{
                  width: '12px',
                  height: '12px',
                  minWidth: '12px',
                  maxWidth: '12px',
                  aspectRatio: '1/1'
                }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-base leading-tight truncate">{title}</h3>
                <p className="text-sm text-white/70 leading-none truncate">{role}</p>
              </div>
            </div>
            <StatusBadge status={status} color={statusColor} />
          </div>

          {/* Cover Image */}
          <div className="relative h-32 overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
              {description}
            </p>

            {/* Stats et Members */}
            <div className="flex items-center justify-between">
              <StatsIndicator stats={stats} />
              <MemberAvatars members={members} additionalMembers={additionalMembers} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2 text-white/70">
                <div className="flex -space-x-1">
                  {lastCommit.images.slice(0, 2).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-full border border-white/20 object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
                <span className="text-xs">{lastCommit.count} commits</span>
              </div>
              <div className="text-xs text-white/50">#{index !== undefined ? String(index + 1).padStart(3, '0') : id}</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Mode grille - version originale compacte
  return (
    <Link 
      to={`/apps/community/${id}/infos?data=${projectData}`}
      className="block w-full h-full"
    >
      <div
        className={`
          group relative overflow-hidden rounded-xl cursor-pointer w-full h-auto
          transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
          backdrop-blur-xl border border-white/10 shadow-lg
          bg-transparent
        `}
        style={{ 
          willChange: 'transform',
          contain: 'layout style paint',
          width: '100%',
          aspectRatio: 'auto'
        }}
      >
        {/* Header compact */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src={avatar}
                alt={role}
                width={32}
                height={32}
                className="rounded-full object-cover"
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  maxWidth: '32px',
                  aspectRatio: '1/1'
                }}
                loading="lazy"
              />
              <div className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} style={{
                width: '10px',
                height: '10px',
                minWidth: '10px',
                maxWidth: '10px',
                aspectRatio: '1/1'
              }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm leading-tight truncate">{title}</h3>
              <p className="text-xs text-white/70 leading-none truncate">{role}</p>
            </div>
          </div>
          <StatusBadge status={status} color={statusColor} />
        </div>

        {/* Cover Image optimisée */}
        <div className="relative h-24 mx-3 mb-3 rounded-lg overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content optimisé */}
        <div className="px-3 pb-3 space-y-3">
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Stats et Members */}
          <div className="flex items-center justify-between">
            <StatsIndicator stats={stats} />
            <MemberAvatars members={members} additionalMembers={additionalMembers} />
          </div>

          {/* Footer compact */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-2 text-white/70">
              <div className="flex -space-x-1">
                {lastCommit.images.slice(0, 2).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    width={14}
                    height={14}
                    className="rounded-full border border-white/20 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <span className="text-xs">{lastCommit.count}</span>
            </div>
            <div className="text-xs text-white/50">#{index !== undefined ? String(index + 1).padStart(3, '0') : id}</div>
          </div>
        </div>
      </div>
    </Link>
  );
});

MemoizedProjectCard.displayName = 'MemoizedProjectCard';