// ============================================================
// components/providers/PermissionGuard.tsx
// Guard UI granulaire — contrôle de visibilité par permission/rôle
//
//  ✅ PermissionGuard   — masque/affiche selon permissions ou rôles
//  ✅ AdminOnly         — wrapper réservé aux administrateurs
//  ✅ usePermissions    — hook pour vérification manuelle
// ============================================================


import React from 'react';
import { useAuthContext } from '@/lib/auth-store';

// ── PermissionGuard ───────────────────────────────────────
interface PermissionGuardProps {
  /** Permission(s) requise(s) */
  permission?:  string | string[];
  /** Rôle(s) requis */
  role?:        string | string[];
  /** Si true : AU MOINS UNE permission/rôle suffit */
  any?:         boolean;
  /** Admin bypass : si l'utilisateur est admin, toujours afficher */
  adminBypass?: boolean;
  /** Ce qui s'affiche si la condition n'est pas remplie */
  fallback?:    React.ReactNode;
  children:     React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  any         = false,
  adminBypass = true,
  fallback    = null,
  children,
}: PermissionGuardProps) {
  const { permissions, roles, user } = useAuthContext();

  if (adminBypass && user?.is_admin) return <>{children}</>;

  if (permission) {
    const permsToCheck = Array.isArray(permission) ? permission : [permission];
    const permOk = any
      ? permsToCheck.some((p) => permissions.includes(p))
      : permsToCheck.every((p) => permissions.includes(p));

    if (!permOk && !role)        return <>{fallback}</>;
    if (!permOk && role && !any) return <>{fallback}</>;
  }

  if (role) {
    const rolesToCheck = Array.isArray(role) ? role : [role];
    const roleOk = any
      ? rolesToCheck.some((r) => roles.includes(r))
      : rolesToCheck.every((r) => roles.includes(r));
    if (!roleOk) return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ── AdminOnly ─────────────────────────────────────────────
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuthContext();
  return user?.is_admin ? <>{children}</> : <>{fallback}</>;
}

// ── usePermissions ────────────────────────────────────────
export function usePermissions() {
  const { permissions, roles, user } = useAuthContext();

  return {
    can:     (permission: string) => !!(user?.is_admin || permissions.includes(permission)),
    hasRole: (role: string)       => roles.includes(role),
    isAdmin: !!user?.is_admin,
    canAny:  (perms: string[])    => !!(user?.is_admin || perms.some((p)  => permissions.includes(p))),
    canAll:  (perms: string[])    => !!(user?.is_admin || perms.every((p) => permissions.includes(p))),
    permissions,
    roles,
    user,
  };
}
