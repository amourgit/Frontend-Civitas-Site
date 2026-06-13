// ============================================================
// hooks/useProfilsManager.ts
// Hooks pour le module Profils IAM — liste, détail, mutations
// ============================================================


import { useState, useCallback, useEffect } from 'react';
import { profilsService, extractProfilError } from '@/services/iam/profilsService';
import type {
  ProfilListItem, ProfilDetail, ProfilCreate,
  ProfilCreateSansCred, ProfilUpdate, SuspendreProfil,
  AssignationRoleCreate, AssignationRoleResponse, ProfilsFilters,
} from '@/lib/models/iam/profil.model';

// ── useProfils — liste avec filtres ──────────────────────
export function useProfils(initialFilters: ProfilsFilters = {}) {
  const [profils, setProfils]       = useState<ProfilListItem[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [filters, setFilters]       = useState<ProfilsFilters>(initialFilters);
  const [hasMore, setHasMore]       = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 50;

  const load = useCallback(async (newFilters?: ProfilsFilters, reset = true) => {
    setIsLoading(true);
    setError(null);
    const f = { ...(newFilters ?? filters), limit: LIMIT };
    try {
      const data = await profilsService.list(f);
      setProfils(reset ? data : (prev) => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      if (reset) setTotalCount(data.length);
    } catch (err) {
      setError(extractProfilError(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const applyFilters = useCallback((newFilters: Partial<ProfilsFilters>) => {
    const merged = { ...filters, ...newFilters, skip: 0 };
    setFilters(merged);
    load(merged, true);
  }, [filters, load]);

  const loadMore = useCallback(() => {
    const f = { ...filters, skip: profils.length };
    load(f, false);
  }, [filters, profils.length, load]);

  const refresh = useCallback(() => load({ ...filters, skip: 0 }, true), [filters, load]);

  return { profils, isLoading, error, hasMore, totalCount, filters, applyFilters, loadMore, refresh };
}

// ── useProfilDetail — détail d'un profil ─────────────────
export function useProfilDetail(id: string | null) {
  const [profil, setProfil]       = useState<ProfilDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      setProfil(await profilsService.getById(id));
    } catch (err) {
      setError(extractProfilError(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { profil, isLoading, error, refresh: load, setProfil };
}

// ── useProfilRoles — rôles d'un profil ───────────────────
export function useProfilRoles(profilId: string | null) {
  const [roles, setRoles]         = useState<AssignationRoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profilId) return;
    setIsLoading(true);
    setError(null);
    try {
      setRoles(await profilsService.getRoles(profilId));
    } catch (err) {
      setError(extractProfilError(err));
    } finally {
      setIsLoading(false);
    }
  }, [profilId]);

  useEffect(() => { load(); }, [load]);

  const assignerRole = useCallback(async (payload: AssignationRoleCreate) => {
    if (!profilId) return { success: false, error: 'ID profil manquant' };
    try {
      const r = await profilsService.assignerRole(profilId, payload);
      setRoles((prev) => [...prev, r]);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractProfilError(err) };
    }
  }, [profilId]);

  const revoquerRole = useCallback(async (assignationId: string, raison?: string) => {
    if (!profilId) return { success: false, error: 'ID profil manquant' };
    try {
      await profilsService.revoquerRole(profilId, assignationId, raison);
      setRoles((prev) => prev.filter((r) => r.id !== assignationId));
      return { success: true };
    } catch (err) {
      return { success: false, error: extractProfilError(err) };
    }
  }, [profilId]);

  return { roles, isLoading, error, refresh: load, assignerRole, revoquerRole };
}

// ── useProfilMutations — créer/modifier/suspendre/supprimer
export function useProfilMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const run = async <T>(fn: () => Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fn();
      return { success: true, data };
    } catch (err) {
      const msg = extractProfilError(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    create:     (p: ProfilCreate)              => run(() => profilsService.create(p)),
    createSans: (p: ProfilCreateSansCred)      => run(() => profilsService.createSansCredentials(p)),
    update:     (id: string, p: ProfilUpdate)  => run(() => profilsService.update(id, p)),
    suspendre:  (id: string, p: SuspendreProfil) => run(() => profilsService.suspendre(id, p)),
    reactiver:  (id: string)                   => run(() => profilsService.reactiver(id)),
    supprimer:  (id: string)                   => run(() => profilsService.supprimer(id)),
  };
}
