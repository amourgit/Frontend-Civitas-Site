// ============================================================
// hooks/useAuth.tsx — Bridge vers useIAMAuth
// Le topbar et les anciens composants utilisent useAuth.
// On délègue vers notre nouveau système IAM pour cohérence.
// ============================================================


import { useAuthContext } from '@/lib/auth-store';

export const useAuth = () => {
  const ctx = useAuthContext();

  return {
    // Compatibilité avec l'ancienne interface
    user: ctx.user ? {
      name:     `${ctx.user.prenom || ''} ${ctx.user.nom || ''}`.trim() || ctx.user.username || 'Utilisateur',
      email:    ctx.user.email || '',
      username: ctx.user.username || '',
      avatar:   null,
      bio:      '',
      skills:   [],
      socialLinks: [],
      position: ctx.user.type_profil || '',
      ...ctx.user,
    } : null,
    isAuthenticated: ctx.isAuthenticated,
    loading:         ctx.isLoading,
    checkAuth:       ctx.refreshUser,
    logout:          ctx.logout,
    login:           () => {},
  };
};
