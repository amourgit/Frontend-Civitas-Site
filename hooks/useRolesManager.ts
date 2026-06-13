// ============================================================
// hooks/useRolesManager.ts
// Hooks pour le module Rôles IAM
// ============================================================


import { useState, useCallback, useEffect } from 'react';
import { rolesService, extractRoleError } from '@/services/iam/rolesService';
import type {
  RoleListItem, RoleDetail,
  RoleCreate, RoleUpdate,
  RolesFilters,
} from '@/lib/models/iam/role.model';

// ── useRoles — liste ──────────────────────────────────────
export function useRoles(initialFilters: RolesFilters = {}) {
  const [roles, setRoles]       = useState<RoleListItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [filters, setFilters]   = useState<RolesFilters>(initialFilters);

  const load = useCallback(async (f?: RolesFilters) => {
    setLoading(true);
    setError(null);
    try {
      setRoles(await rolesService.list(f ?? filters));
    } catch (err) {
      setError(extractRoleError(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const applyFilters = useCallback((partial: Partial<RolesFilters>) => {
    const merged = { ...filters, ...partial };
    setFilters(merged);
    load(merged);
  }, [filters, load]);

  const refresh = useCallback(() => load(filters), [filters, load]);

  return { roles, isLoading, error, filters, applyFilters, refresh };
}

// ── useRoleDetail ─────────────────────────────────────────
export function useRoleDetail(id: string | null) {
  const [role, setRole]         = useState<RoleDetail | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setRole(await rolesService.getById(id));
    } catch (err) {
      setError(extractRoleError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { role, isLoading, error, refresh: load, setRole };
}

// ── useRoleMutations ──────────────────────────────────────
export function useRoleMutations() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const run = async <T>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fn();
      return { success: true as const, data };
    } catch (err) {
      const msg = extractRoleError(err);
      setError(msg);
      return { success: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    create:            (p: RoleCreate)          => run(() => rolesService.create(p)),
    update:            (id: string, p: RoleUpdate) => run(() => rolesService.update(id, p)),
    delete:            (id: string)             => run(() => rolesService.delete(id)),
    ajouterPerms:      (id: string, ids: string[]) => run(() => rolesService.ajouterPermissions(id, ids)),
    retirerPerms:      (id: string, ids: string[]) => run(() => rolesService.retirerPermissions(id, ids)),
  };
}
