// ============================================================
// hooks/useKeycloakGroupes.ts
// Hook React — Gestion des groupes Keycloak
// Calqué sur le pattern de useKeycloakProfils.ts
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import keycloakGroupsService from '@/services/iam/keycloakGroupsService';
import { keycloakUsersService } from '@/services/iam/keycloakUsersService';
import { getCurrentRealm } from '@/lib/realm-resolver';
import type {
  GroupRepresentation,
  GroupMemberRepresentation,
  RoleRepresentation,
  RoleMappingRepresentation,
} from '@/lib/models/iam/keycloak-group.model';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Hook liste des groupes ─────────────────────────────────
export function useKeycloakGroupes(params?: {
  search?: string;
  first?: number;
  max?: number;
}) {
  const [groups,  setGroups]  = useState<GroupRepresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [total,   setTotal]   = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const [data, cnt] = await Promise.all([
        keycloakGroupsService.list({
          search: params?.search,
          first:  params?.first  ?? 0,
          max:    params?.max    ?? 500,
          populateHierarchy: true,
        }, getRealm()),
        keycloakGroupsService.count({
          search: params?.search,
          top: false,
        }, getRealm()).catch(() => 0),
      ]);
      setGroups(data);
      setTotal(cnt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.first, params?.max]);

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [load]);

  const create = useCallback(async (name: string, attributes?: Record<string, string[]>) => {
    await keycloakGroupsService.create({ name, attributes }, getRealm());
    await load();
  }, [load]);

  const remove = useCallback(async (groupId: string) => {
    await keycloakGroupsService.delete(groupId, getRealm());
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setTotal(prev => Math.max(0, prev - 1));
  }, []);

  const update = useCallback(async (groupId: string, payload: Partial<GroupRepresentation>) => {
    await keycloakGroupsService.update(groupId, payload, getRealm());
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...payload } : g));
  }, []);

  return { groups, setGroups, loading, error, total, reload: load, create, remove, update };
}

// ── Hook détail d'un groupe ────────────────────────────────
export function useKeycloakGroupeDetail(groupId: string | null) {
  const [group,   setGroup]   = useState<GroupRepresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await keycloakGroupsService.getById(groupId, getRealm());
      setGroup(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement du groupe');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const updateGroup = useCallback(async (payload: Partial<GroupRepresentation>) => {
    if (!groupId || !group) return;
    await keycloakGroupsService.update(groupId, { ...group, ...payload }, getRealm());
    setGroup(prev => prev ? { ...prev, ...payload } : prev);
  }, [groupId, group]);

  return { group, setGroup, loading, error, reload: load, updateGroup };
}

// ── Hook membres d'un groupe ───────────────────────────────
export function useGroupeMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMemberRepresentation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) { setMembers([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await keycloakGroupsService.listMembers(
        groupId,
        { max: 500, briefRepresentation: false },
        getRealm()
      );
      setMembers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const removeMember = useCallback(async (userId: string) => {
    if (!groupId) return;
    await keycloakUsersService.leaveGroup(userId, groupId, getRealm());
    setMembers(prev => prev.filter(m => m.id !== userId));
  }, [groupId]);

  return { members, setMembers, loading, error, reload: load, removeMember };
}

// ── Hook rôles d'un groupe ─────────────────────────────────
export function useGroupeRoles(groupId: string | null) {
  const [roleMappings,   setRoleMappings]   = useState<RoleMappingRepresentation | null>(null);
  const [realmRoles,     setRealmRoles]     = useState<RoleRepresentation[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleRepresentation[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const [mappings, realm, available] = await Promise.all([
        keycloakGroupsService.listRoleMappings(groupId, getRealm()),
        keycloakGroupsService.listRealmRoleMappings(groupId, getRealm()),
        keycloakGroupsService.listAvailableRealmRoles(groupId, getRealm()),
      ]);
      setRoleMappings(mappings);
      setRealmRoles(realm);
      setAvailableRoles(available);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const addRole = useCallback(async (role: RoleRepresentation) => {
    if (!groupId) return;
    await keycloakGroupsService.addRealmRoles(groupId, [role], getRealm());
    setRealmRoles(prev => [...prev, role]);
    setAvailableRoles(prev => prev.filter(r => r.id !== role.id));
  }, [groupId]);

  const removeRole = useCallback(async (role: RoleRepresentation) => {
    if (!groupId) return;
    await keycloakGroupsService.removeRealmRoles(groupId, [role], getRealm());
    setRealmRoles(prev => prev.filter(r => r.id !== role.id));
    setAvailableRoles(prev => [...prev, role]);
  }, [groupId]);

  return { roleMappings, realmRoles, availableRoles, loading, error, reload: load, addRole, removeRole };
}

// ── Hook sous-groupes ──────────────────────────────────────
export function useGroupeChildren(groupId: string | null) {
  const [children, setChildren] = useState<GroupRepresentation[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) { setChildren([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await keycloakGroupsService.listChildren(
        groupId,
        { populateHierarchy: true },
        getRealm()
      );
      setChildren(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des sous-groupes');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const createChild = useCallback(async (name: string, attributes?: Record<string, string[]>) => {
    if (!groupId) return;
    await keycloakGroupsService.createChild(groupId, { name, attributes }, getRealm());
    await load();
  }, [groupId, load]);

  const removeChild = useCallback(async (childId: string) => {
    await keycloakGroupsService.delete(childId, getRealm());
    setChildren(prev => prev.filter(c => c.id !== childId));
  }, []);

  return { children, setChildren, loading, error, reload: load, createChild, removeChild };
}
