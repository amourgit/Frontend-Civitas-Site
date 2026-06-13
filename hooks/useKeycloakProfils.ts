// ============================================================
// hooks/useKeycloakProfils.ts
// Hook React pour charger et gérer les profils depuis Keycloak
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { profilsKeycloakAdapter, loadProfilDetail } from '@/services/iam/keycloakProfilsAdapter';
import { keycloakUsersService } from '@/services/iam/keycloakUsersService';
import type { Profil } from '@/components/pages/module/profils/ui/types';
import { getCurrentRealm } from '@/lib/realm-resolver';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Hook liste des profils ────────────────────────────────
export function useKeycloakProfils(params?: {
  search?: string;
  first?: number;
  max?: number;
}) {
  const [profils,  setProfils]  = useState<Profil[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const data = await profilsKeycloakAdapter.getAll({
        realm:  getRealm(),
        search: params?.search,
        first:  params?.first  ?? 0,
        max:    params?.max    ?? 200,
      });
      setProfils(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des profils');
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.first, params?.max]);

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [load]);

  const suspend = useCallback(async (id: string) => {
    await profilsKeycloakAdapter.suspend(id);
    setProfils(prev => prev.map(p =>
      p.id === id ? { ...p, enabled: false, statut: 'suspendu' } : p
    ));
  }, []);

  const enable = useCallback(async (id: string) => {
    await profilsKeycloakAdapter.enable(id);
    setProfils(prev => prev.map(p =>
      p.id === id ? { ...p, enabled: true, statut: 'actif' } : p
    ));
  }, []);

  const remove = useCallback(async (id: string) => {
    await profilsKeycloakAdapter.delete(id);
    setProfils(prev => prev.filter(p => p.id !== id));
  }, []);

  return { profils, setProfils, loading, error, reload: load, suspend, enable, remove };
}

// ── Hook détail d'un profil ───────────────────────────────
export function useKeycloakProfilDetail(userId: string | null) {
  const [profil,  setProfil]  = useState<Profil | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadProfilDetail(userId, getRealm());
      setProfil(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const updateProfil = useCallback(async (payload: Partial<{
    firstName: string; lastName: string; email: string;
    enabled: boolean; emailVerified: boolean; requiredActions: string[];
    attributes: Record<string, string[]>;
  }>) => {
    if (!userId) return;
    await keycloakUsersService.update(userId, payload, getRealm());
    setProfil(prev => prev ? { ...prev, ...payload } : prev);
  }, [userId]);

  const resetPassword = useCallback(async (password: string, temporary: boolean) => {
    if (!userId) return;
    await keycloakUsersService.resetPassword(
      userId,
      { type: 'password', value: password, temporary },
      getRealm()
    );
  }, [userId]);

  const sendResetEmail = useCallback(async () => {
    if (!userId) return;
    await keycloakUsersService.sendPasswordResetEmail(userId, {}, getRealm());
  }, [userId]);

  const logout = useCallback(async () => {
    if (!userId) return;
    await keycloakUsersService.logout(userId, getRealm());
    setProfil(prev => prev ? { ...prev, sessions: [] } : prev);
  }, [userId]);

  const revokeConsent = useCallback(async (clientId: string) => {
    if (!userId) return;
    await keycloakUsersService.revokeConsent(userId, clientId, getRealm());
    setProfil(prev => prev
      ? { ...prev, consents: prev.consents.filter(c => c.clientId !== clientId) }
      : prev
    );
  }, [userId]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!userId) return;
    await keycloakUsersService.leaveGroup(userId, groupId, getRealm());
    setProfil(prev => prev
      ? { ...prev, groups: prev.groups.filter(g => g.id !== groupId) }
      : prev
    );
  }, [userId]);

  return {
    profil, loading, error, reload: load,
    updateProfil, resetPassword, sendResetEmail,
    logout, revokeConsent, leaveGroup,
  };
}
