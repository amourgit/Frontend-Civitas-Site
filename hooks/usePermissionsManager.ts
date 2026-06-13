// ============================================================
// hooks/usePermissionsManager.ts
// Hooks pour le module Permissions IAM
// ============================================================


import { useState, useCallback, useEffect } from 'react';
import { permissionsService, extractPermError } from '@/services/iam/permissionsService';
import type {
  PermissionSource, PermissionListItem, PermissionDetail,
  PermissionCreate, PermissionCustomCreate,
  PermissionSourceCreate, PermissionUpdate,
  PermissionsFilters,
} from '@/lib/models/iam/permission.model';

export function usePermissions(init: PermissionsFilters = {}) {
  const [permissions, setPerms] = useState<PermissionListItem[]>([]);
  const [isLoading, setLoad]    = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [filters, setFilters]   = useState<PermissionsFilters>(init);

  const load = useCallback(async (f?: PermissionsFilters) => {
    setLoad(true); setError(null);
    try { setPerms(await permissionsService.list(f ?? filters)); }
    catch (e) { setError(extractPermError(e)); }
    finally { setLoad(false); }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const applyFilters = useCallback((p: Partial<PermissionsFilters>) => {
    const m = { ...filters, ...p };
    setFilters(m); load(m);
  }, [filters, load]);

  return { permissions, isLoading, error, filters, applyFilters, refresh: () => load(filters) };
}

export function useSources() {
  const [sources, setSources] = useState<PermissionSource[]>([]);
  const [isLoading, setLoad]  = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true); setError(null);
    try { setSources(await permissionsService.listSources()); }
    catch (e) { setError(extractPermError(e)); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, []);
  return { sources, isLoading, error, refresh: load };
}

export function usePermissionDetail(id: string | null) {
  const [perm, setPerm]      = useState<PermissionDetail | null>(null);
  const [isLoading, setLoad] = useState(false);
  const [error, setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoad(true); setError(null);
    try { setPerm(await permissionsService.getById(id)); }
    catch (e) { setError(extractPermError(e)); }
    finally { setLoad(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { perm, isLoading, error, refresh: load };
}

export function usePermissionMutations() {
  const [isLoading, setLoad] = useState(false);
  const [error, setError]    = useState<string | null>(null);

  const run = async <T>(fn: () => Promise<T>) => {
    setLoad(true); setError(null);
    try { const data = await fn(); return { success: true as const, data }; }
    catch (e) { const msg = extractPermError(e); setError(msg); return { success: false as const, error: msg }; }
    finally { setLoad(false); }
  };

  return {
    isLoading, error, clearError: () => setError(null),
    create:       (p: PermissionCreate)         => run(() => permissionsService.create(p)),
    createCustom: (p: PermissionCustomCreate)   => run(() => permissionsService.createCustom(p)),
    update:       (id: string, p: PermissionUpdate) => run(() => permissionsService.update(id, p)),
    createSource: (p: PermissionSourceCreate)   => run(() => permissionsService.createSource(p)),
    enregistrerMasse: (p: any)                  => run(() => permissionsService.enregistrerMasse(p)),
  };
}
