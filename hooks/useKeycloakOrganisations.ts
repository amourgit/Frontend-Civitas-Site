// ============================================================
// hooks/useKeycloakOrganisations.ts
// Hooks React complets — Gestion des Organisations Keycloak 26
// Branché sur keycloakOrganizationsService + keycloakIdentityProvidersService
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import keycloakOrganizationsService, {
  type OrganizationRepresentation,
  type MemberRepresentation,
  type OrgGroupRepresentation,
  type OrganizationInvitationRepresentation,
  type CreateOrganizationPayload,
  type UpdateOrganizationPayload,
  type InviteUserPayload,
} from '@/services/iam/keycloakOrganizationsService';
import { keycloakIdentityProvidersService } from '@/services/iam/keycloakIdentityProvidersService';
import { getCurrentRealm } from '@/lib/realm-resolver';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

export type { OrganizationRepresentation, MemberRepresentation, OrgGroupRepresentation, OrganizationInvitationRepresentation };

// ─────────────────────────────────────────────────────────────
// 1. Hook : Liste des organisations
// ─────────────────────────────────────────────────────────────
export function useOrganisations(realm: string = getRealm()) {
  const [orgs,    setOrgs]    = useState<OrganizationRepresentation[]>([]);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async (search?: string) => {
    setLoading(true); setError(null);
    try {
      const [list, total] = await Promise.all([
        keycloakOrganizationsService.list({ max: 200, search }, realm),
        keycloakOrganizationsService.count(search, realm),
      ]);
      setOrgs(list);
      setCount(total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement organisations');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: CreateOrganizationPayload) => {
    await keycloakOrganizationsService.create(payload, realm);
    await load();
  }, [realm, load]);

  const remove = useCallback(async (orgId: string) => {
    await keycloakOrganizationsService.delete(orgId, realm);
    await load();
  }, [realm, load]);

  const setEnabled = useCallback(async (orgId: string, enabled: boolean) => {
    await keycloakOrganizationsService.setEnabled(orgId, enabled, realm);
    await load();
  }, [realm, load]);

  return { orgs, count, loading, error, reload: load, create, remove, setEnabled };
}

// ─────────────────────────────────────────────────────────────
// 2. Hook : Détail d'une organisation
// ─────────────────────────────────────────────────────────────
export function useOrganisationDetail(orgId: string, realm: string = getRealm()) {
  const [org,     setOrg]     = useState<OrganizationRepresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakOrganizationsService.getById(orgId, realm);
      setOrg(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement organisation');
    } finally { setLoading(false); }
  }, [orgId, realm]);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (payload: UpdateOrganizationPayload) => {
    setSaving(true); setError(null);
    try {
      await keycloakOrganizationsService.update(orgId, payload, realm);
      setOrg(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur mise à jour');
      throw e;
    } finally { setSaving(false); }
  }, [orgId, realm]);

  return { org, loading, saving, error, reload: load, update };
}

// ─────────────────────────────────────────────────────────────
// 3. Hook : Membres d'une organisation
// ─────────────────────────────────────────────────────────────
export function useOrgMembers(orgId: string, realm: string = getRealm()) {
  const [members, setMembers] = useState<MemberRepresentation[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async (search?: string) => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const [list, cnt] = await Promise.all([
        keycloakOrganizationsService.listMembers(orgId, { max: 200, search }, realm),
        keycloakOrganizationsService.countMembers(orgId, realm),
      ]);
      setMembers(list);
      setTotal(cnt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement membres');
    } finally { setLoading(false); }
  }, [orgId, realm]);

  useEffect(() => { load(); }, [load]);

  const addMember = useCallback(async (userId: string) => {
    await keycloakOrganizationsService.addMember(orgId, userId, realm);
    await load();
  }, [orgId, realm, load]);

  const removeMember = useCallback(async (memberId: string) => {
    await keycloakOrganizationsService.removeMember(orgId, memberId, realm);
    await load();
  }, [orgId, realm, load]);

  const inviteUser = useCallback(async (payload: InviteUserPayload) => {
    await keycloakOrganizationsService.inviteUser(orgId, payload, realm);
  }, [orgId, realm]);

  const inviteExistingUser = useCallback(async (userId: string) => {
    await keycloakOrganizationsService.inviteExistingUser(orgId, { id: userId }, realm);
  }, [orgId, realm]);

  return { members, total, loading, error, reload: load, addMember, removeMember, inviteUser, inviteExistingUser };
}

// ─────────────────────────────────────────────────────────────
// 4. Hook : Invitations d'une organisation
// ─────────────────────────────────────────────────────────────
export function useOrgInvitations(orgId: string, realm: string = getRealm()) {
  const [invitations, setInvitations] = useState<OrganizationInvitationRepresentation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const list = await keycloakOrganizationsService.listInvitations(orgId, { max: 100 }, realm);
      setInvitations(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement invitations');
    } finally { setLoading(false); }
  }, [orgId, realm]);

  useEffect(() => { load(); }, [load]);

  const revoke = useCallback(async (invitationId: string) => {
    await keycloakOrganizationsService.deleteInvitation(orgId, invitationId, realm);
    await load();
  }, [orgId, realm, load]);

  const resend = useCallback(async (invitationId: string) => {
    await keycloakOrganizationsService.resendInvitation(orgId, invitationId, realm);
  }, [orgId, realm]);

  return { invitations, loading, error, reload: load, revoke, resend };
}

// ─────────────────────────────────────────────────────────────
// 5. Hook : Groupes d'une organisation
// ─────────────────────────────────────────────────────────────
export function useOrgGroups(orgId: string, realm: string = getRealm()) {
  const [groups,  setGroups]  = useState<OrgGroupRepresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const list = await keycloakOrganizationsService.listGroups(orgId, { max: 200 }, realm);
      setGroups(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement groupes');
    } finally { setLoading(false); }
  }, [orgId, realm]);

  useEffect(() => { load(); }, [load]);

  const createGroup = useCallback(async (name: string, attributes?: Record<string, string[]>) => {
    await keycloakOrganizationsService.createGroup(orgId, { name, attributes }, realm);
    await load();
  }, [orgId, realm, load]);

  const deleteGroup = useCallback(async (groupId: string) => {
    await keycloakOrganizationsService.deleteGroup(orgId, groupId, realm);
    await load();
  }, [orgId, realm, load]);

  const updateGroup = useCallback(async (groupId: string, payload: Partial<OrgGroupRepresentation>) => {
    await keycloakOrganizationsService.updateGroup(orgId, groupId, payload, realm);
    await load();
  }, [orgId, realm, load]);

  const addGroupMember = useCallback(async (groupId: string, userId: string) => {
    await keycloakOrganizationsService.addGroupMember(orgId, groupId, userId, realm);
  }, [orgId, realm]);

  const removeGroupMember = useCallback(async (groupId: string, userId: string) => {
    await keycloakOrganizationsService.removeGroupMember(orgId, groupId, userId, realm);
  }, [orgId, realm]);

  return { groups, loading, error, reload: load, createGroup, deleteGroup, updateGroup, addGroupMember, removeGroupMember };
}

// ─────────────────────────────────────────────────────────────
// 6. Hook : Identity Providers liés à une organisation
// ─────────────────────────────────────────────────────────────
export function useOrgIdentityProviders(orgId: string, realm: string = getRealm()) {
  const [linked,     setLinked]     = useState<any[]>([]);
  const [available,  setAvailable]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true); setError(null);
    try {
      const [orgIdps, allIdps] = await Promise.all([
        keycloakOrganizationsService.listIdentityProviders(orgId, realm),
        keycloakIdentityProvidersService.list({}, realm).catch(() => []),
      ]);
      setLinked(orgIdps as any[]);
      // IdPs disponibles = ceux non encore liés
      const linkedAliases = new Set((orgIdps as any[]).map((i: any) => i.alias));
      setAvailable((allIdps as any[]).filter((i: any) => !linkedAliases.has(i.alias)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement IdPs');
    } finally { setLoading(false); }
  }, [orgId, realm]);

  useEffect(() => { load(); }, [load]);

  const link = useCallback(async (alias: string) => {
    await keycloakOrganizationsService.addIdentityProvider(orgId, alias, realm);
    await load();
  }, [orgId, realm, load]);

  const unlink = useCallback(async (alias: string) => {
    await keycloakOrganizationsService.removeIdentityProvider(orgId, alias, realm);
    await load();
  }, [orgId, realm, load]);

  return { linked, available, loading, error, reload: load, link, unlink };
}
