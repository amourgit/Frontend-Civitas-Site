// ============================================================
// hooks/useRealmRoleDetail.ts
// Hook React — Détail complet d'un rôle Realm
// Aligné sur le pattern useKeycloakRoleById (qui fonctionne)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getCurrentRealm } from '@/lib/realm-resolver';
import {
  keycloakRealmRolesService,
  keycloakRolesByIdService,
  type RoleRepresentation,
  type UserRepresentation,
  type RoleGroupRepresentation,
  type ManagementPermissionReference,
} from '@/services/iam/keycloakRealmRolesService';

// Realm dynamique — même pattern que useKeycloakRoleById
function getRealm(): string {
  return getCurrentRealm().realm;
}

export interface RealmRoleDetailState {
  role:               RoleRepresentation | null;
  realmComposites:    RoleRepresentation[];
  allComposites:      RoleRepresentation[];
  users:              UserRepresentation[];
  usersTotal:         number;
  groups:             RoleGroupRepresentation[];
  managementPerms:    ManagementPermissionReference | null;
  loading:            boolean;
  loadingUsers:       boolean;
  loadingGroups:      boolean;
  loadingComposites:  boolean;
  loadingPerms:          boolean;
  permsFeatureDisabled:  boolean;
  error:                 string | null;
}

export function useRealmRoleDetail(roleId: string | null) {
  const [state, setState] = useState<RealmRoleDetailState>({
    role:              null,
    realmComposites:   [],
    allComposites:     [],
    users:             [],
    usersTotal:        0,
    groups:            [],
    managementPerms:   null,
    loading:           true,
    loadingUsers:      false,
    loadingGroups:     false,
    loadingComposites: false,
    loadingPerms:         false,
    permsFeatureDisabled: false,
    error:                null,
  });

  // Nom courant du rôle (déduit après chargement par UUID)
  const [roleName, setRoleName] = useState<string | null>(null);

  // ── Loaders secondaires (par nom) ─────────────────────

  const loadComposites = useCallback(async (name: string) => {
    setState(s => ({ ...s, loadingComposites: true }));
    try {
      const [allComposites, realmComposites] = await Promise.all([
        keycloakRealmRolesService.listComposites(name, getRealm()),
        keycloakRealmRolesService.listRealmComposites(name, getRealm()),
      ]);
      setState(s => ({ ...s, allComposites, realmComposites, loadingComposites: false }));
    } catch {
      setState(s => ({ ...s, loadingComposites: false }));
    }
  }, []);

  const loadUsers = useCallback(async (name: string, opts: { first?: number; max?: number } = {}) => {
    setState(s => ({ ...s, loadingUsers: true }));
    try {
      const users = await keycloakRealmRolesService.listUsers(
        name,
        { first: opts.first ?? 0, max: opts.max ?? 200 },
        getRealm()
      );
      setState(s => ({ ...s, users, usersTotal: users.length, loadingUsers: false }));
    } catch {
      setState(s => ({ ...s, loadingUsers: false }));
    }
  }, []);

  const loadGroups = useCallback(async (name: string, opts: { first?: number; max?: number } = {}) => {
    setState(s => ({ ...s, loadingGroups: true }));
    try {
      const groups = await keycloakRealmRolesService.listGroups(
        name,
        { first: opts.first ?? 0, max: opts.max ?? 200 },
        getRealm()
      );
      setState(s => ({ ...s, groups, loadingGroups: false }));
    } catch {
      setState(s => ({ ...s, loadingGroups: false }));
    }
  }, []);

  const loadManagementPerms = useCallback(async (name: string) => {
    setState(s => ({ ...s, loadingPerms: true }));
    try {
      const managementPerms = await keycloakRealmRolesService.getManagementPermissions(name, getRealm());
      setState(s => ({ ...s, managementPerms, loadingPerms: false, permsFeatureDisabled: false }));
    } catch (e) {
      // "Feature not enabled" = Fine-Grained Authorization désactivée sur Keycloak
      // On marque la feature comme indisponible sans erreur globale
      const msg = e instanceof Error ? e.message : String(e);
      const isFeatureDisabled =
        msg.includes('Feature not enabled') ||
        msg.includes('501') ||
        msg.includes('500');
      setState(s => ({
        ...s,
        loadingPerms: false,
        permsFeatureDisabled: isFeatureDisabled,
        managementPerms: null,
      }));
    }
  }, []);

  // ── Chargement initial : UUID → nom → reste ───────────

  const reload = useCallback(async () => {
    if (!roleId) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // 1. Charger le rôle par UUID (même pattern que useKeycloakRoleById)
      const role = await keycloakRolesByIdService.getById(roleId, getRealm());
      const name = role.name ?? '';
      setRoleName(name);
      setState(s => ({ ...s, role, loading: false }));

      // 2. Chargements parallèles via le nom
      await Promise.allSettled([
        loadUsers(name),
        loadGroups(name),
        loadManagementPerms(name),
        ...(role.composite ? [loadComposites(name)] : []),
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors du chargement du rôle';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, [roleId, loadUsers, loadGroups, loadManagementPerms, loadComposites]);

  useEffect(() => { reload(); }, [reload]);

  // ── Wrappers publics stables ──────────────────────────

  const reloadComposites = useCallback(async () => {
    if (roleName) await loadComposites(roleName);
  }, [roleName, loadComposites]);

  const reloadUsers = useCallback(async (opts?: { first?: number; max?: number }) => {
    if (roleName) await loadUsers(roleName, opts ?? {});
  }, [roleName, loadUsers]);

  const reloadGroups = useCallback(async (opts?: { first?: number; max?: number }) => {
    if (roleName) await loadGroups(roleName, opts ?? {});
  }, [roleName, loadGroups]);

  const reloadManagementPerms = useCallback(async () => {
    if (roleName) await loadManagementPerms(roleName);
  }, [roleName, loadManagementPerms]);

  // ── Actions CRUD ──────────────────────────────────────

  const updateRole = useCallback(async (payload: Partial<RoleRepresentation>) => {
    if (!roleName) return;
    // PUT /roles/{name} — met à jour via le nom courant
    await keycloakRealmRolesService.update(roleName, payload, getRealm());
    // Si le nom a changé, suivre le nouveau nom
    const newName = (payload.name ?? roleName) as string;
    setState(s => ({ ...s, loading: true }));
    try {
      const role = await keycloakRealmRolesService.getByName(newName, getRealm());
      setRoleName(role.name ?? newName);
      setState(s => ({ ...s, role, loading: false }));
      if (role.composite) await loadComposites(role.name ?? newName);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur rechargement rôle';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, [roleName, loadComposites]);

  const deleteRole = useCallback(async () => {
    if (!roleName) return;
    await keycloakRealmRolesService.delete(roleName, getRealm());
  }, [roleName]);

  const addRealmComposites = useCallback(async (roles: RoleRepresentation[]) => {
    if (!roleName) return;
    await keycloakRealmRolesService.addComposites(roleName, roles, getRealm());
    await loadComposites(roleName);
  }, [roleName, loadComposites]);

  const removeRealmComposites = useCallback(async (roles: RoleRepresentation[]) => {
    if (!roleName) return;
    // Le service removeComposites ne transmet pas le body dans kc.delete()
    // On utilise httpClient.fetch() directement avec body
    const { httpClient } = await import('@/lib/http-client');
    const { adminBase }  = await import('@/services/iam/_realmHelper');
    const url = `${adminBase(getRealm())}/roles/${encodeURIComponent(roleName)}/composites`;
    const res = await (httpClient as any).fetch(url, {
      method: 'DELETE',
      body:   JSON.stringify(roles),
    });
    if (!res.ok) throw new Error(`Erreur suppression composite: ${res.status}`);
    await loadComposites(roleName);
  }, [roleName, loadComposites]);

  const toggleManagementPermissions = useCallback(async (
    enabled: boolean
  ): Promise<ManagementPermissionReference | null> => {
    if (!roleName) return null;
    const result = await keycloakRealmRolesService.setManagementPermissions(
      roleName,
      { enabled },
      getRealm()
    );
    setState(s => ({ ...s, managementPerms: result }));
    return result;
  }, [roleName]);

  return {
    ...state,
    reload,
    reloadComposites,
    reloadUsers,
    reloadGroups,
    reloadManagementPerms,
    updateRole,
    deleteRole,
    addRealmComposites,
    removeRealmComposites,
    toggleManagementPermissions,
  };
}
