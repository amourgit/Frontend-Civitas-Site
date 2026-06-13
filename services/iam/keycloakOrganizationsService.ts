// ============================================================
// services/iam/keycloakOrganizationsService.ts
// Service complet — Gestion des Organisations Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/organizations/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (35 au total) :
//
// ── CRUD ORGANISATION ────────────────────────────────────────
//   GET    /organizations/count                                        → count()
//   GET    /organizations                                              → list()
//   POST   /organizations                                              → create()
//   GET    /organizations/{org-id}                                     → getById()
//   PUT    /organizations/{org-id}                                     → update()
//   DELETE /organizations/{org-id}                                     → delete()
//
// ── GROUPES ORGANISATION ─────────────────────────────────────
//   GET    /organizations/{org-id}/groups                              → listGroups()
//   POST   /organizations/{org-id}/groups                              → createGroup()
//   GET    /organizations/{org-id}/groups/group-by-path/{path}         → getGroupByPath()
//   GET    /organizations/{org-id}/groups/{group-id}                   → getGroup()
//   PUT    /organizations/{org-id}/groups/{group-id}                   → updateGroup()
//   DELETE /organizations/{org-id}/groups/{group-id}                   → deleteGroup()
//   GET    /organizations/{org-id}/groups/{group-id}/children          → listGroupChildren()
//   POST   /organizations/{org-id}/groups/{group-id}/children          → createGroupChild()
//   GET    /organizations/{org-id}/groups/{group-id}/members           → listGroupMembers()
//   PUT    /organizations/{org-id}/groups/{group-id}/members/{userId}  → addGroupMember()
//   DELETE /organizations/{org-id}/groups/{group-id}/members/{userId}  → removeGroupMember()
//
// ── IDENTITY PROVIDERS ORGANISATION ─────────────────────────
//   GET    /organizations/{org-id}/identity-providers                  → listIdentityProviders()
//   POST   /organizations/{org-id}/identity-providers                  → addIdentityProvider()
//   GET    /organizations/{org-id}/identity-providers/{alias}          → getIdentityProvider()
//   GET    /organizations/{org-id}/identity-providers/{alias}/groups   → listIdentityProviderGroups()
//   DELETE /organizations/{org-id}/identity-providers/{alias}          → removeIdentityProvider()
//
// ── INVITATIONS ──────────────────────────────────────────────
//   GET    /organizations/{org-id}/invitations                         → listInvitations()
//   GET    /organizations/{org-id}/invitations/{id}                    → getInvitation()
//   DELETE /organizations/{org-id}/invitations/{id}                    → deleteInvitation()
//   POST   /organizations/{org-id}/invitations/{id}/resend             → resendInvitation()
//
// ── MEMBRES ──────────────────────────────────────────────────
//   GET    /organizations/{org-id}/members/count                       → countMembers()
//   GET    /organizations/{org-id}/members                             → listMembers()
//   POST   /organizations/{org-id}/members                             → addMember()
//   POST   /organizations/{org-id}/members/invite-existing-user        → inviteExistingUser()
//   POST   /organizations/{org-id}/members/invite-user                 → inviteUser()
//   GET    /organizations/{org-id}/members/{member-id}                 → getMember()
//   DELETE /organizations/{org-id}/members/{member-id}                 → removeMember()
//   GET    /organizations/{org-id}/members/{member-id}/groups          → listMemberGroups()
//   GET    /organizations/{org-id}/members/{member-id}/organizations   → listMemberOrganizations()
//
// ── MEMBRES (GLOBAL) ─────────────────────────────────────────
//   GET    /organizations/members/{member-id}/organizations            → listOrganizationsForMember()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

// ── Schémas Zod ───────────────────────────────────────────────

const OrganizationDomainRepresentationSchema = z.object({
  name:      z.string().optional(),
  verified:  z.boolean().optional(),
}).passthrough();

const OrganizationRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  alias:       z.string().optional(),
  description: z.string().optional(),
  enabled:     z.boolean().optional(),
  redirectUrl: z.string().optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  domains:     z.array(OrganizationDomainRepresentationSchema).optional(),
  members:     z.array(z.record(z.unknown())).optional(),
}).passthrough();

const OrganizationInvitationRepresentationSchema = z.object({
  id:              z.string().optional(),
  createdDate:     z.number().optional(),
  inviterId:       z.string().optional(),
  email:           z.string().optional(),
  organizationId:  z.string().optional(),
}).passthrough();

const MemberRepresentationSchema = z.object({
  id:          z.string().optional(),
  username:    z.string().optional(),
  email:       z.string().optional(),
  firstName:   z.string().optional(),
  lastName:    z.string().optional(),
  enabled:     z.boolean().optional(),
  membershipType: z.string().optional(),
}).passthrough();

const GroupRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  path:        z.string().optional(),
  parentId:    z.string().optional(),
  subGroupCount: z.number().optional(),
  subGroups:   z.array(z.record(z.unknown())).optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  realmRoles:  z.array(z.string()).optional(),
  clientRoles: z.record(z.array(z.string())).optional(),
}).passthrough();

export type OrganizationRepresentation     = z.infer<typeof OrganizationRepresentationSchema>;
export type OrganizationDomainRepresentation = z.infer<typeof OrganizationDomainRepresentationSchema>;
export type OrganizationInvitationRepresentation = z.infer<typeof OrganizationInvitationRepresentationSchema>;
export type MemberRepresentation           = z.infer<typeof MemberRepresentationSchema>;
export type OrgGroupRepresentation         = z.infer<typeof GroupRepresentationSchema>;

// Payloads
export interface CreateOrganizationPayload {
  name:         string;
  alias?:       string;
  description?: string;
  enabled?:     boolean;
  redirectUrl?: string;
  domains?:     Array<{ name: string; verified?: boolean }>;
  attributes?:  Record<string, string[]>;
}

export interface UpdateOrganizationPayload extends Partial<CreateOrganizationPayload> {
  id?: string;
}

export interface OrganizationsListFilters {
  first?:    number;
  max?:      number;
  search?:   string;
  exact?:    boolean;
  q?:        string;
}

export interface InviteExistingUserPayload {
  id:    string;
}

export interface InviteUserPayload {
  email:      string;
  firstName?: string;
  lastName?:  string;
}

export interface OrgMembersListFilters {
  first?:  number;
  max?:    number;
  search?: string;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractOrganizationError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Une organisation avec ce nom ou cet alias existe déjà';
    if (msg.includes('404')) return 'Organisation introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Données invalides';
    return msg || fallback;
  }
  return fallback;
}

// ── Wrapper interne ───────────────────────────────────────────
const kc = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return httpClient.get<T>(url, params);
  },
  async post<T>(url: string, body: unknown): Promise<T> {
    return httpClient.post<T>(url, body);
  },
  async put<T>(url: string, body: unknown): Promise<T> {
    return httpClient.put<T>(url, body);
  },
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakOrganizationsService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD ORGANISATION
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/count
   * Retourne le nombre total d'organisations dans le realm.
   */
  async count(
    search?: string,
    realm?: string
  ): Promise<number> {
    const params: Record<string, unknown> = {};
    if (search) params.search = search;
    const data = await kc.get<unknown>(`${adminBase(realm)}/organizations/count`, params);
    return typeof data === 'number' ? data : 0;
  },

  /**
   * GET /admin/realms/{realm}/organizations
   * Retourne la liste des organisations, filtrée et paginée.
   */
  async list(
    filters: OrganizationsListFilters = {},
    realm?: string
  ): Promise<OrganizationRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.search)               params.search = filters.search;
    if (filters.exact  !== undefined) params.exact  = filters.exact;
    if (filters.q)                    params.q      = filters.q;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/organizations`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(OrganizationRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/organizations
   * Crée une nouvelle organisation.
   * Retourne 201 Created avec l'URL de l'organisation dans Location.
   */
  async create(
    payload: CreateOrganizationPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/organizations`, payload);
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}
   * Retourne les détails d'une organisation par son ID.
   */
  async getById(
    orgId: string,
    realm?: string
  ): Promise<OrganizationRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}`
    );
    return safe(OrganizationRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/organizations/{org-id}
   * Met à jour une organisation existante.
   * Retourne 204 No Content.
   */
  async update(
    orgId: string,
    payload: UpdateOrganizationPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}
   * Supprime une organisation.
   * Retourne 204 No Content.
   */
  async delete(
    orgId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. GROUPES ORGANISATION
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/groups
   * Retourne les groupes d'une organisation.
   */
  async listGroups(
    orgId: string,
    filters: { first?: number; max?: number; search?: string } = {},
    realm?: string
  ): Promise<OrgGroupRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.search)               params.search = filters.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/groups
   * Crée un groupe dans l'organisation.
   * Retourne 201 Created.
   */
  async createGroup(
    orgId: string,
    payload: { name: string; attributes?: Record<string, string[]> },
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/groups/group-by-path/{path}
   * Retourne un groupe de l'organisation par son chemin.
   */
  async getGroupByPath(
    orgId: string,
    path: string,
    realm?: string
  ): Promise<OrgGroupRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/group-by-path/${encodeURIComponent(path)}`
    );
    return safe(GroupRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}
   * Retourne les détails d'un groupe de l'organisation.
   */
  async getGroup(
    orgId: string,
    groupId: string,
    realm?: string
  ): Promise<OrgGroupRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}`
    );
    return safe(GroupRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}
   * Met à jour un groupe de l'organisation.
   * Retourne 204 No Content.
   */
  async updateGroup(
    orgId: string,
    groupId: string,
    payload: Partial<OrgGroupRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}
   * Supprime un groupe de l'organisation.
   * Retourne 204 No Content.
   */
  async deleteGroup(
    orgId: string,
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/children
   * Retourne les sous-groupes d'un groupe de l'organisation.
   */
  async listGroupChildren(
    orgId: string,
    groupId: string,
    filters: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<OrgGroupRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}/children`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/children
   * Crée un sous-groupe dans un groupe de l'organisation.
   * Retourne 201 Created.
   */
  async createGroupChild(
    orgId: string,
    groupId: string,
    payload: { name: string; attributes?: Record<string, string[]> },
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}/children`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members
   * Retourne les membres d'un groupe de l'organisation.
   */
  async listGroupMembers(
    orgId: string,
    groupId: string,
    filters: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<MemberRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first !== undefined) params.first = filters.first;
    if (filters.max   !== undefined) params.max   = filters.max;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}/members`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(MemberRepresentationSchema, d));
  },

  /**
   * PUT /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members/{userId}
   * Ajoute un utilisateur comme membre d'un groupe de l'organisation.
   * Retourne 204 No Content.
   */
  async addGroupMember(
    orgId: string,
    groupId: string,
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}/groups/{group-id}/members/{userId}
   * Retire un utilisateur des membres d'un groupe de l'organisation.
   * Retourne 204 No Content.
   */
  async removeGroupMember(
    orgId: string,
    groupId: string,
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. IDENTITY PROVIDERS ORGANISATION
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/identity-providers
   * Retourne les Identity Providers liés à l'organisation.
   */
  async listIdentityProviders(
    orgId: string,
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/identity-providers`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/identity-providers
   * Associe un Identity Provider existant à l'organisation.
   * Le body contient l'alias de l'IdP.
   * Retourne 204 No Content.
   */
  async addIdentityProvider(
    orgId: string,
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/identity-providers`,
      alias
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}
   * Retourne un Identity Provider lié à l'organisation.
   */
  async getIdentityProvider(
    orgId: string,
    alias: string,
    realm?: string
  ): Promise<unknown> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/identity-providers/${encodeURIComponent(alias)}`
    );
    return data;
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}/groups
   * Retourne les groupes liés à un Identity Provider de l'organisation.
   */
  async listIdentityProviderGroups(
    orgId: string,
    alias: string,
    realm?: string
  ): Promise<OrgGroupRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/identity-providers/${encodeURIComponent(alias)}/groups`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}/identity-providers/{alias}
   * Dissocie un Identity Provider de l'organisation.
   * Retourne 204 No Content.
   */
  async removeIdentityProvider(
    orgId: string,
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/identity-providers/${encodeURIComponent(alias)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 4. INVITATIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/invitations
   * Retourne les invitations en attente pour l'organisation.
   */
  async listInvitations(
    orgId: string,
    filters: { first?: number; max?: number; search?: string } = {},
    realm?: string
  ): Promise<OrganizationInvitationRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.search)               params.search = filters.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/invitations`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(OrganizationInvitationRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/invitations/{id}
   * Retourne les détails d'une invitation spécifique.
   */
  async getInvitation(
    orgId: string,
    invitationId: string,
    realm?: string
  ): Promise<OrganizationInvitationRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}`
    );
    return safe(OrganizationInvitationRepresentationSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}/invitations/{id}
   * Supprime/annule une invitation.
   * Retourne 204 No Content.
   */
  async deleteInvitation(
    orgId: string,
    invitationId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}`
    );
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/invitations/{id}/resend
   * Renvoie l'email d'invitation.
   * Retourne 204 No Content.
   */
  async resendInvitation(
    orgId: string,
    invitationId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}/resend`,
      {}
    );
  },

  // ─────────────────────────────────────────────────────────
  // 5. MEMBRES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/members/count
   * Retourne le nombre de membres de l'organisation.
   */
  async countMembers(
    orgId: string,
    realm?: string
  ): Promise<number> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/count`
    );
    return typeof data === 'number' ? data : 0;
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/members
   * Retourne la liste des membres de l'organisation, paginée.
   */
  async listMembers(
    orgId: string,
    filters: OrgMembersListFilters = {},
    realm?: string
  ): Promise<MemberRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.search)               params.search = filters.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(MemberRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/members
   * Ajoute un utilisateur existant comme membre de l'organisation.
   * Le body est l'ID de l'utilisateur (String).
   * Retourne 201 Created.
   */
  async addMember(
    orgId: string,
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members`,
      userId
    );
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/members/invite-existing-user
   * Invite un utilisateur Keycloak existant à rejoindre l'organisation.
   * Retourne 204 No Content.
   */
  async inviteExistingUser(
    orgId: string,
    payload: InviteExistingUserPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/invite-existing-user`,
      payload
    );
  },

  /**
   * POST /admin/realms/{realm}/organizations/{org-id}/members/invite-user
   * Invite un nouvel utilisateur (non encore enregistré) par email à rejoindre l'organisation.
   * Retourne 204 No Content.
   */
  async inviteUser(
    orgId: string,
    payload: InviteUserPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/invite-user`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}
   * Retourne les détails d'un membre de l'organisation.
   */
  async getMember(
    orgId: string,
    memberId: string,
    realm?: string
  ): Promise<MemberRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`
    );
    return safe(MemberRepresentationSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/organizations/{org-id}/members/{member-id}
   * Retire un utilisateur de l'organisation.
   * Retourne 204 No Content.
   */
  async removeMember(
    orgId: string,
    memberId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}/groups
   * Retourne les groupes de l'organisation auxquels appartient un membre.
   */
  async listMemberGroups(
    orgId: string,
    memberId: string,
    realm?: string
  ): Promise<OrgGroupRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}/groups`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/organizations/{org-id}/members/{member-id}/organizations
   * Retourne toutes les organisations auxquelles appartient un membre spécifique.
   */
  async listMemberOrganizations(
    orgId: string,
    memberId: string,
    realm?: string
  ): Promise<OrganizationRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}/organizations`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(OrganizationRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 6. MEMBRES — REQUÊTE GLOBALE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/organizations/members/{member-id}/organizations
   * Retourne toutes les organisations auxquelles appartient un utilisateur,
   * sans spécifier d'organisation de départ.
   */
  async listOrganizationsForMember(
    memberId: string,
    realm?: string
  ): Promise<OrganizationRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/organizations/members/${encodeURIComponent(memberId)}/organizations`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(OrganizationRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 7. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Active ou désactive une organisation.
   */
  async setEnabled(
    orgId: string,
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakOrganizationsService.update(orgId, { enabled }, realm);
  },

  /**
   * Recherche des organisations par nom.
   */
  async search(
    search: string,
    options: { first?: number; max?: number } = {},
    realm?: string
  ): Promise<OrganizationRepresentation[]> {
    return keycloakOrganizationsService.list(
      { search, first: options.first ?? 0, max: options.max ?? 50 },
      realm
    );
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakOrganizationsService;
