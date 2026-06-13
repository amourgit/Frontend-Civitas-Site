// ============================================================
// hooks/useKeycloakRealmRoles.ts
// Hook React complet — Realm Roles Keycloak (toutes requêtes branchées)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getCurrentRealm } from '@/lib/realm-resolver';
import {
  keycloakRealmRolesService,
  keycloakRolesByIdService,
  type RoleRepresentation,
  type ManagementPermissionReference,
} from '@/services/iam/keycloakRealmRolesService';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Hook principal : liste + CRUD ────────────────────────────
export function useKeycloakRealmRoles(params?: { search?: string; first?: number; max?: number }) {
  const [roles,   setRoles]   = useState<RoleRepresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakRealmRolesService.list(
        { search: params?.search, first: params?.first ?? 0, max: params?.max ?? 500 },
        getRealm()
      );
      setRoles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement rôles realm');
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.first, params?.max]);

  useEffect(() => { load(); }, [load]);

  // ── CRUD ────────────────────────────────────────────────────
  const create = useCallback(async (payload: { name: string; description?: string; composite?: boolean; attributes?: Record<string, string[]> }) => {
    await keycloakRealmRolesService.create(payload, getRealm());
    await load();
  }, [load]);

  const remove = useCallback(async (roleName: string) => {
    await keycloakRealmRolesService.delete(roleName, getRealm());
    setRoles(prev => prev.filter(r => r.name !== roleName));
  }, []);

  const update = useCallback(async (roleName: string, payload: Partial<RoleRepresentation>) => {
    await keycloakRealmRolesService.update(roleName, payload, getRealm());
    await load();
  }, [load]);

  // ── Lecture ─────────────────────────────────────────────────
  const getByName = useCallback(async (name: string) => {
    return keycloakRealmRolesService.getByName(name, getRealm());
  }, []);

  // ── Utilisateurs & Groupes du rôle ──────────────────────────
  const listUsers = useCallback(async (roleName: string, opts?: { first?: number; max?: number }) => {
    return keycloakRealmRolesService.listUsers(roleName, opts ?? {}, getRealm());
  }, []);

  const listGroups = useCallback(async (roleName: string, opts?: { first?: number; max?: number; briefRepresentation?: boolean }) => {
    return keycloakRealmRolesService.listGroups(roleName, opts ?? {}, getRealm());
  }, []);

  // ── Composites ───────────────────────────────────────────────
  const listComposites = useCallback(async (roleName: string) => {
    return keycloakRealmRolesService.listComposites(roleName, getRealm());
  }, []);

  const listRealmComposites = useCallback(async (roleName: string) => {
    return keycloakRealmRolesService.listRealmComposites(roleName, getRealm());
  }, []);

  const listClientComposites = useCallback(async (roleName: string, clientUuid: string) => {
    return keycloakRealmRolesService.listClientComposites(roleName, clientUuid, getRealm());
  }, []);

  const addComposites = useCallback(async (roleName: string, roles: RoleRepresentation[]) => {
    await keycloakRealmRolesService.addComposites(roleName, roles, getRealm());
  }, []);

  const removeComposites = useCallback(async (roleName: string, roles: RoleRepresentation[]) => {
    await keycloakRealmRolesService.removeComposites(roleName, roles, getRealm());
  }, []);

  // ── Permissions de gestion fine ─────────────────────────────
  const getManagementPermissions = useCallback(async (roleName: string): Promise<ManagementPermissionReference> => {
    return keycloakRealmRolesService.getManagementPermissions(roleName, getRealm());
  }, []);

  const setManagementPermissions = useCallback(async (roleName: string, enabled: boolean): Promise<ManagementPermissionReference> => {
    return keycloakRealmRolesService.setManagementPermissions(roleName, { enabled }, getRealm());
  }, []);

  // ── Recherche ────────────────────────────────────────────────
  const search = useCallback(async (term: string, opts?: { first?: number; max?: number }) => {
    return keycloakRealmRolesService.search(term, opts ?? {}, getRealm());
  }, []);

  return {
    roles, loading, error, reload: load,
    create, remove, update,
    getByName,
    listUsers, listGroups,
    listComposites, listRealmComposites, listClientComposites,
    addComposites, removeComposites,
    getManagementPermissions, setManagementPermissions,
    search,
  };
}

// ── Hook par ID ──────────────────────────────────────────────
export function useKeycloakRoleById(roleId: string | null) {
  const [role,    setRole]    = useState<RoleRepresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roleId) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakRolesByIdService.getById(roleId, getRealm());
      setRole(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement rôle');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { load(); }, [load]);

  const updateById = useCallback(async (payload: Partial<RoleRepresentation>) => {
    if (!roleId) return;
    await keycloakRolesByIdService.updateById(roleId, payload, getRealm());
    await load();
  }, [roleId, load]);

  const deleteById = useCallback(async () => {
    if (!roleId) return;
    await keycloakRolesByIdService.deleteById(roleId, getRealm());
  }, [roleId]);

  const listCompositesById = useCallback(async () => {
    if (!roleId) return [];
    return keycloakRolesByIdService.listCompositesById(roleId, getRealm());
  }, [roleId]);

  const listRealmCompositesById = useCallback(async () => {
    if (!roleId) return [];
    return keycloakRolesByIdService.listRealmCompositesById(roleId, getRealm());
  }, [roleId]);

  const listClientCompositesById = useCallback(async (clientUuid: string) => {
    if (!roleId) return [];
    return keycloakRolesByIdService.listClientCompositesById(roleId, clientUuid, getRealm());
  }, [roleId]);

  const addCompositesById = useCallback(async (roles: RoleRepresentation[]) => {
    if (!roleId) return;
    await keycloakRolesByIdService.addCompositesById(roleId, roles, getRealm());
  }, [roleId]);

  const removeCompositesById = useCallback(async (roles: RoleRepresentation[]) => {
    if (!roleId) return;
    await keycloakRolesByIdService.removeCompositesById(roleId, roles, getRealm());
  }, [roleId]);

  const getManagementPermissionsById = useCallback(async () => {
    if (!roleId) return null;
    return keycloakRolesByIdService.getManagementPermissionsById(roleId, getRealm());
  }, [roleId]);

  const setManagementPermissionsById = useCallback(async (enabled: boolean) => {
    if (!roleId) return null;
    return keycloakRolesByIdService.setManagementPermissionsById(roleId, { enabled }, getRealm());
  }, [roleId]);

  return {
    role, loading, error, reload: load,
    updateById, deleteById,
    listCompositesById, listRealmCompositesById, listClientCompositesById,
    addCompositesById, removeCompositesById,
    getManagementPermissionsById, setManagementPermissionsById,
  };
}
