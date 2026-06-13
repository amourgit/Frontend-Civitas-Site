// ============================================================
// components/ui/user-avatar.tsx
// Composant réutilisable : avatar utilisateur avec initiales
// et indicateur de statut. Utilisé dans topbar, profil, etc.
// ============================================================


import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  /** Prénom de l'utilisateur */
  prenom?: string | null;
  /** Nom de l'utilisateur */
  nom?: string | null;
  /** Nom d'utilisateur (fallback) */
  username?: string | null;
  /** Statut : 'actif' | 'suspendu' | 'inactif' */
  statut?: string;
  /** Taille de l'avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Classe CSS additionnelle */
  className?: string;
  /** Afficher le badge de statut */
  showStatus?: boolean;
  /** Admin badge */
  isAdmin?: boolean;
}

const sizeConfig = {
  xs: { container: 'w-6 h-6', text: 'text-xs', dot: 'w-1.5 h-1.5', radius: 'rounded-lg' },
  sm: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2 h-2', radius: 'rounded-xl' },
  md: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-2.5 h-2.5', radius: 'rounded-xl' },
  lg: { container: 'w-14 h-14', text: 'text-lg', dot: 'w-3 h-3', radius: 'rounded-2xl' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', dot: 'w-3.5 h-3.5', radius: 'rounded-2xl' },
};

const statusColors: Record<string, string> = {
  actif: 'bg-green-400',
  suspendu: 'bg-orange-400',
  inactif: 'bg-red-400',
};

export function UserAvatar({
  prenom,
  nom,
  username,
  statut = 'actif',
  size = 'md',
  className,
  showStatus = false,
  isAdmin = false,
}: UserAvatarProps) {
  // Calculer les initiales
  const initials = [prenom?.charAt(0), nom?.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() ||
    username?.charAt(0)?.toUpperCase() ||
    '?';

  const s = sizeConfig[size];

  return (
    <div className="relative inline-flex flex-shrink-0">
      {/* Avatar principal */}
      <div
        className={cn(
          s.container,
          s.radius,
          'flex items-center justify-center font-semibold text-white select-none',
          className
        )}
        style={{
          background: 'linear-gradient(135deg, #0C115B 0%, #1e3a8a 100%)',
          border: '1.5px solid rgba(255,255,255,0.15)',
        }}
      >
        <span className={s.text}>{initials}</span>
      </div>

      {/* Badge statut */}
      {showStatus && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-black/50',
            s.dot,
            statusColors[statut?.toLowerCase()] || 'bg-white/40'
          )}
        />
      )}

      {/* Badge admin */}
      {isAdmin && size !== 'xs' && (
        <span
          className="absolute -top-1 -right-1 text-xs px-1 rounded-full font-bold text-amber-300"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(245,158,11,0.4)',
            fontSize: '8px',
            lineHeight: '14px',
          }}
        >
          A
        </span>
      )}
    </div>
  );
}

// ── Version avec nom affiché à côté ──────────────────────
export function UserAvatarWithName({
  prenom,
  nom,
  username,
  statut,
  isAdmin,
  size = 'sm',
  className,
}: UserAvatarProps) {
  const displayName = prenom && nom
    ? `${prenom} ${nom}`
    : username || 'Utilisateur';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <UserAvatar
        prenom={prenom}
        nom={nom}
        username={username}
        statut={statut}
        isAdmin={isAdmin}
        size={size}
        showStatus
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{displayName}</p>
        {username && (
          <p className="text-xs text-white/40 truncate">@{username}</p>
        )}
      </div>
    </div>
  );
}
