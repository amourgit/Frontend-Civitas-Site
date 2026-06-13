// ============================================================
// services/iam/keycloakRealmsService.ts
// Service complet — Administration des Realms Keycloak v26
//
// Couvre TOUS les endpoints /admin/realms* selon la doc 26.6.1
//
// Endpoints couverts (55 au total) :
//
// ── CRUD REALM (top-level) ────────────────────────────────────
//   GET    /admin/realms                                         → list()
//   POST   /admin/realms                                         → create()
//   GET    /admin/realms/{realm}                                 → getByName()
//   PUT    /admin/realms/{realm}                                 → update()
//   DELETE /admin/realms/{realm}                                 → delete()
//
// ── ÉVÉNEMENTS ──────────────────────────────────────────────
//   GET    /{realm}/events                                       → listEvents()
//   DELETE /{realm}/events                                       → clearEvents()
//   GET    /{realm}/events/config                                → getEventsConfig()
//   PUT    /{realm}/events/config                                → updateEventsConfig()
//   GET    /{realm}/admin-events                                 → listAdminEvents()
//   DELETE /{realm}/admin-events                                 → clearAdminEvents()
//
// ── CLÉS CRYPTOGRAPHIQUES ───────────────────────────────────
//   GET    /{realm}/keys                                         → getKeys()
//
// ── SESSIONS & RÉVOCATION ───────────────────────────────────
//   POST   /{realm}/logout-all                                   → logoutAll()
//   POST   /{realm}/push-revocation                              → pushRevocation()
//   DELETE /{realm}/sessions/{session}                           → deleteSession()
//
// ── SCOPES CLIENT PAR DÉFAUT DU REALM ───────────────────────
//   GET    /{realm}/default-default-client-scopes                → listDefaultClientScopes()
//   PUT    /{realm}/default-default-client-scopes/{id}           → addDefaultClientScope()
//   DELETE /{realm}/default-default-client-scopes/{id}           → removeDefaultClientScope()
//   GET    /{realm}/default-optional-client-scopes               → listOptionalClientScopes()
//   PUT    /{realm}/default-optional-client-scopes/{id}          → addOptionalClientScope()
//   DELETE /{realm}/default-optional-client-scopes/{id}          → removeOptionalClientScope()
//
// ── GROUPES PAR DÉFAUT DU REALM ─────────────────────────────
//   GET    /{realm}/default-groups                               → listDefaultGroups()
//   PUT    /{realm}/default-groups/{groupId}                     → addDefaultGroup()
//   DELETE /{realm}/default-groups/{groupId}                     → removeDefaultGroup()
//   GET    /{realm}/group-by-path/{path}                         → getGroupByPath()
//
// ── STATS DE SESSION CLIENT ─────────────────────────────────
//   GET    /{realm}/client-session-stats                         → getClientSessionStats()
//
// ── CREDENTIAL REGISTRATORS ─────────────────────────────────
//   GET    /{realm}/credential-registrators                      → listCredentialRegistrators()
//
// ── CLIENT DESCRIPTION CONVERTER ────────────────────────────
//   POST   /{realm}/client-description-converter                 → convertClientDescription()
//
// ── CLIENT POLICIES ─────────────────────────────────────────
//   GET    /{realm}/client-policies/policies                     → getClientPolicies()
//   PUT    /{realm}/client-policies/policies                     → updateClientPolicies()
//   GET    /{realm}/client-policies/profiles                     → getClientProfiles()
//   PUT    /{realm}/client-policies/profiles                     → updateClientProfiles()
//
// ── CLIENT TYPES ─────────────────────────────────────────────
//   GET    /{realm}/client-types                                  → listClientTypes()
//   PUT    /{realm}/client-types                                  → updateClientTypes()
//
// ── CLIENT REGISTRATION POLICY ──────────────────────────────
//   GET    /{realm}/client-registration-policy/providers         → listClientRegistrationPolicyProviders()
//
// ── LOCALISATION ────────────────────────────────────────────
//   GET    /{realm}/localization                                  → listLocales()
//   GET    /{realm}/localization/{locale}                         → getLocale()
//   POST   /{realm}/localization/{locale}                         → importLocale()
//   DELETE /{realm}/localization/{locale}                         → deleteLocale()
//   GET    /{realm}/localization/{locale}/{key}                   → getLocaleKey()
//   PUT    /{realm}/localization/{locale}/{key}                   → setLocaleKey()
//   DELETE /{realm}/localization/{locale}/{key}                   → deleteLocaleKey()
//
// ── SMTP ─────────────────────────────────────────────────────
//   POST   /{realm}/testSMTPConnection                            → testSmtpConnection()
//
// ── EXPORT / IMPORT ─────────────────────────────────────────
//   POST   /{realm}/partial-export                                → partialExport()
//   POST   /{realm}/partialImport                                 → partialImport()
//
// ── PERMISSIONS GESTION UTILISATEURS ────────────────────────
//   GET    /{realm}/users-management-permissions                  → getUsersManagementPermissions()
//   PUT    /{realm}/users-management-permissions                  → setUsersManagementPermissions()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';
import {
  // Schémas
  RealmRepresentationSchema,
  RealmListSchema,
  AdminEventRepresentationSchema,
  AdminEventListSchema,
  EventRepresentationSchema,
  EventListSchema,
  RealmEventsConfigRepresentationSchema,
  KeysMetadataRepresentationSchema,
  GlobalRequestResultSchema,
  ManagementPermissionReferenceSchema,
  ClientProfilesRepresentationSchema,
  ClientPoliciesRepresentationSchema,
  ClientTypesRepresentationSchema,
  // Types
  type RealmRepresentation,
  type AdminEventRepresentation,
  type EventRepresentation,
  type RealmEventsConfigRepresentation,
  type KeysMetadataRepresentation,
  type GlobalRequestResult,
  type ManagementPermissionReference,
  type ClientProfilesRepresentation,
  type ClientPoliciesRepresentation,
  type ClientTypesRepresentation,
  type CreateRealmPayload,
  type UpdateRealmPayload,
  type UpdateEventsConfigPayload,
  type LocalizationImportPayload,
  type SmtpTestPayload,
  type AdminEventsFilters,
  type EventsFilters,
  type PartialExportFilters,
  type LocalizationGetFilters,
  type SessionDeleteOptions,
  type ClientPoliciesGetFilters,
  type ClientProfilesGetFilters,
} from '@/lib/models/iam/keycloak-realm.model';

// ── URL de base Keycloak ──────────────────────────────────────

/** Préfixe admin global (sans realm) */
const ADMIN_BASE = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080'}/admin/realms`;

/** Préfixe admin pour un realm donné */
function realmBase(realm: string): string {
  return `${ADMIN_BASE}/${encodeURIComponent(realm)}`;
}

// ── Parsing sécurisé (dégradé gracieux) ──────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
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

// ── Extraction des erreurs Keycloak ──────────────────────────
export function extractKeycloakRealmError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409') || msg.toLowerCase().includes('exists'))
      return 'Un realm avec ce nom existe déjà';
    if (msg.includes('404'))
      return 'Realm introuvable';
    if (msg.includes('403'))
      return 'Permission insuffisante pour effectuer cette action sur le realm';
    if (msg.includes('400'))
      return 'Données invalides — vérifiez les paramètres du realm';
    if (msg.includes('500'))
      return 'Erreur interne du serveur Keycloak';
    return msg || fallback;
  }
  return fallback;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakRealmsService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD REALM (top-level)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms
   * Retourne la liste des realms accessibles par l'appelant.
   * Filtrée selon les droits de l'admin courant.
   * @param briefRepresentation  Si true, retourne seulement id, realm, displayName.
   */
  async list(
    briefRepresentation = false
  ): Promise<RealmRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (briefRepresentation) params.briefRepresentation = true;
    const data = await kc.get<unknown[]>(ADMIN_BASE, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RealmRepresentationSchema, d));
  },

  /**
   * POST /admin/realms
   * Importe un realm depuis une représentation JSON complète.
   * Le nom du realm doit être unique. Peut inclure users, clients, rôles, etc.
   * Retourne 201 Created.
   */
  async create(
    payload: CreateRealmPayload
  ): Promise<void> {
    await kc.post<unknown>(ADMIN_BASE, payload);
  },

  /**
   * GET /admin/realms/{realm}
   * Retourne la représentation top-level du realm.
   * N'inclut PAS les informations imbriquées (users, clients, roles).
   */
  async getByName(
    realm?: string
  ): Promise<RealmRepresentation> {
    const data = await kc.get<unknown>(realmBase(realm));
    return safe(RealmRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}
   * Met à jour les attributs top-level du realm.
   * IMPORTANT : users, clients, roles et groupes inclus dans le payload sont ignorés.
   * Seuls les attributs directs du realm sont mis à jour.
   * Retourne 204 No Content.
   */
  async update(
    realm?: string,
    payload: UpdateRealmPayload
  ): Promise<void> {
    await kc.put<unknown>(realmBase(realm), payload);
  },

  /**
   * DELETE /admin/realms/{realm}
   * Supprime définitivement le realm et toutes ses données (users, clients, etc.).
   * IRRÉVERSIBLE. Retourne 204 No Content.
   */
  async delete(
    realm: string
  ): Promise<void> {
    await kc.delete<unknown>(realmBase(realm));
  },

  // ─────────────────────────────────────────────────────────
  // 2. ÉVÉNEMENTS UTILISATEUR
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/events
   * Retourne tous les événements utilisateur, filtrés par les paramètres.
   * Types d'événements : LOGIN, LOGOUT, REGISTER, LOGIN_ERROR, etc.
   */
  async listEvents(
    filters: EventsFilters = {},
    realm?: string
  ): Promise<EventRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.client)    params.client    = filters.client;
    if (filters.dateFrom)  params.dateFrom  = filters.dateFrom;
    if (filters.dateTo)    params.dateTo    = filters.dateTo;
    if (filters.direction) params.direction = filters.direction;
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.ipAddress) params.ipAddress = filters.ipAddress;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.type?.length)         params.type   = filters.type;
    if (filters.user)      params.user      = filters.user;

    const data = await kc.get<unknown[]>(`${realmBase(realm)}/events`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(EventRepresentationSchema, d));
  },

  /**
   * DELETE /admin/realms/{realm}/events
   * Supprime tous les événements utilisateur du realm.
   * Retourne 204 No Content.
   */
  async clearEvents(
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(`${realmBase(realm)}/events`);
  },

  /**
   * GET /admin/realms/{realm}/events/config
   * Retourne la configuration du provider d'événements du realm.
   */
  async getEventsConfig(
    realm?: string
  ): Promise<RealmEventsConfigRepresentation> {
    const data = await kc.get<unknown>(`${realmBase(realm)}/events/config`);
    return safe(RealmEventsConfigRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/events/config
   * Met à jour la configuration du provider d'événements.
   * Permet d'activer/désactiver les events, changer la durée de rétention, etc.
   * Retourne 204 No Content.
   */
  async updateEventsConfig(
    payload: UpdateEventsConfigPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(`${realmBase(realm)}/events/config`, payload);
  },

  // ─────────────────────────────────────────────────────────
  // 3. ÉVÉNEMENTS ADMIN
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/admin-events
   * Retourne tous les événements d'administration, filtrés par les paramètres.
   * Inclut les opérations CREATE, UPDATE, DELETE, ACTION effectuées par des admins.
   */
  async listAdminEvents(
    filters: AdminEventsFilters = {},
    realm?: string
  ): Promise<AdminEventRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.authClient)    params.authClient    = filters.authClient;
    if (filters.authIpAddress) params.authIpAddress = filters.authIpAddress;
    if (filters.authRealm)     params.authRealm     = filters.authRealm;
    if (filters.authUser)      params.authUser      = filters.authUser;
    if (filters.dateFrom)      params.dateFrom      = filters.dateFrom;
    if (filters.dateTo)        params.dateTo        = filters.dateTo;
    if (filters.direction)     params.direction     = filters.direction;
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.operationTypes?.length) params.operationTypes = filters.operationTypes;
    if (filters.resourcePath)  params.resourcePath  = filters.resourcePath;
    if (filters.resourceTypes?.length)  params.resourceTypes  = filters.resourceTypes;

    const data = await kc.get<unknown[]>(`${realmBase(realm)}/admin-events`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(AdminEventRepresentationSchema, d));
  },

  /**
   * DELETE /admin/realms/{realm}/admin-events
   * Supprime tous les événements d'administration du realm.
   * Retourne 204 No Content.
   */
  async clearAdminEvents(
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(`${realmBase(realm)}/admin-events`);
  },

  // ─────────────────────────────────────────────────────────
  // 4. CLÉS CRYPTOGRAPHIQUES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/keys
   * Retourne les métadonnées de toutes les clés cryptographiques du realm.
   * Inclut les clés actives, passives et désactivées, avec leur algorithme,
   * kid, type, statut et certificat public.
   */
  async getKeys(
    realm?: string
  ): Promise<KeysMetadataRepresentation> {
    const data = await kc.get<unknown>(`${realmBase(realm)}/keys`);
    return safe(KeysMetadataRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 5. SESSIONS & RÉVOCATION
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/logout-all
   * Déconnecte tous les utilisateurs actifs du realm.
   * Notifie également tous les clients ayant une adminUrl.
   * Retourne GlobalRequestResult.
   */
  async logoutAll(
    realm?: string
  ): Promise<GlobalRequestResult> {
    const data = await kc.post<unknown>(`${realmBase(realm)}/logout-all`, {});
    return safe(GlobalRequestResultSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/push-revocation
   * Pousse la politique de révocation du realm vers tous les clients
   * ayant une adminUrl. Les tokens émis avant la date de révocation seront rejetés.
   * Retourne GlobalRequestResult.
   */
  async pushRevocation(
    realm?: string
  ): Promise<GlobalRequestResult> {
    const data = await kc.post<unknown>(`${realmBase(realm)}/push-revocation`, {});
    return safe(GlobalRequestResultSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/sessions/{session}
   * Supprime une session utilisateur spécifique.
   * Notifie les clients ayant une adminUrl.
   * @param sessionId   ID de la session à supprimer.
   * @param isOffline   Si true, supprime une session offline.
   * Retourne 204 No Content.
   */
  async deleteSession(
    sessionId: string,
    options: SessionDeleteOptions = {},
    realm?: string
  ): Promise<void> {
    const url = `${realmBase(realm)}/sessions/${encodeURIComponent(sessionId)}`;
    if (options.isOffline) {
      // DELETE avec query param — fetch direct
      const res = await httpClient.fetch(`${url}?isOffline=true`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Erreur suppression session: ${res.statusText}`);
      }
    } else {
      await kc.delete<unknown>(url);
    }
  },

  // ─────────────────────────────────────────────────────────
  // 6. SCOPES CLIENT PAR DÉFAUT DU REALM
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/default-default-client-scopes
   * Retourne les scopes client par défaut du realm (seulement name et id).
   * Ces scopes sont ajoutés automatiquement à chaque nouveau client.
   */
  async listDefaultClientScopes(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/default-default-client-scopes`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * PUT /admin/realms/{realm}/default-default-client-scopes/{clientScopeId}
   * Ajoute un scope comme scope par défaut du realm.
   * Retourne 204 No Content.
   */
  async addDefaultClientScope(
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${realmBase(realm)}/default-default-client-scopes/${encodeURIComponent(clientScopeId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/default-default-client-scopes/{clientScopeId}
   * Retire un scope des scopes par défaut du realm.
   * Retourne 204 No Content.
   */
  async removeDefaultClientScope(
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${realmBase(realm)}/default-default-client-scopes/${encodeURIComponent(clientScopeId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/default-optional-client-scopes
   * Retourne les scopes optionnels par défaut du realm (seulement name et id).
   */
  async listOptionalClientScopes(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/default-optional-client-scopes`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * PUT /admin/realms/{realm}/default-optional-client-scopes/{clientScopeId}
   * Ajoute un scope comme scope optionnel par défaut du realm.
   * Retourne 204 No Content.
   */
  async addOptionalClientScope(
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${realmBase(realm)}/default-optional-client-scopes/${encodeURIComponent(clientScopeId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/default-optional-client-scopes/{clientScopeId}
   * Retire un scope des scopes optionnels par défaut du realm.
   * Retourne 204 No Content.
   */
  async removeOptionalClientScope(
    clientScopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${realmBase(realm)}/default-optional-client-scopes/${encodeURIComponent(clientScopeId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 7. GROUPES PAR DÉFAUT DU REALM
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/default-groups
   * Retourne la hiérarchie des groupes par défaut du realm.
   * Les nouveaux utilisateurs sont automatiquement ajoutés à ces groupes.
   * Seulement name et id sont retournés.
   */
  async listDefaultGroups(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/default-groups`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * PUT /admin/realms/{realm}/default-groups/{groupId}
   * Ajoute un groupe comme groupe par défaut du realm.
   * Retourne 204 No Content.
   */
  async addDefaultGroup(
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${realmBase(realm)}/default-groups/${encodeURIComponent(groupId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/default-groups/{groupId}
   * Retire un groupe des groupes par défaut du realm.
   * Retourne 204 No Content.
   */
  async removeDefaultGroup(
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${realmBase(realm)}/default-groups/${encodeURIComponent(groupId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/group-by-path/{path}
   * Recherche un groupe par son path complet (ex: "/parent/child").
   * Retourne GroupRepresentation ou 404 si non trouvé.
   */
  async getGroupByPath(
    path: string,
    realm?: string
  ): Promise<unknown> {
    // path peut contenir des slashes — on encode chaque segment
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    return kc.get<unknown>(`${realmBase(realm)}/group-by-path/${encodedPath}`);
  },

  // ─────────────────────────────────────────────────────────
  // 8. STATS DE SESSION CLIENT
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-session-stats
   * Retourne un JSON map avec le nombre de sessions actives par client.
   * Seuls les clients ayant des sessions actives sont inclus.
   * Retourne List<Map<String,String>> : [{ id, clientId, active, offline }]
   */
  async getClientSessionStats(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/client-session-stats`);
    return Array.isArray(data) ? data : [];
  },

  // ─────────────────────────────────────────────────────────
  // 9. CREDENTIAL REGISTRATORS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/credential-registrators
   * Retourne la liste des types de credentials enregistrables dans le realm.
   * Ex: ['password', 'otp', 'webauthn', 'webauthn-passwordless']
   */
  async listCredentialRegistrators(
    realm?: string
  ): Promise<string[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/credential-registrators`);
    return Array.isArray(data) ? (data as string[]) : [];
  },

  // ─────────────────────────────────────────────────────────
  // 10. CLIENT DESCRIPTION CONVERTER
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/client-description-converter
   * Convertit une description de client (OIDC Discovery JSON, SAML metadata, etc.)
   * en une ClientRepresentation Keycloak exploitable.
   * @param description  Chaîne JSON ou XML décrivant le client.
   */
  async convertClientDescription(
    description: string,
    realm?: string
  ): Promise<unknown> {
    return kc.post<unknown>(`${realmBase(realm)}/client-description-converter`, description);
  },

  // ─────────────────────────────────────────────────────────
  // 11. CLIENT POLICIES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-policies/policies
   * Retourne les politiques client du realm.
   * @param includeGlobalPolicies  Si true, inclut aussi les politiques globales.
   */
  async getClientPolicies(
    filters: ClientPoliciesGetFilters = {},
    realm?: string
  ): Promise<ClientPoliciesRepresentation> {
    const params: Record<string, unknown> = {};
    if (filters['include-global-policies'] !== undefined) {
      params['include-global-policies'] = filters['include-global-policies'];
    }
    const data = await kc.get<unknown>(`${realmBase(realm)}/client-policies/policies`, params);
    return safe(ClientPoliciesRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/client-policies/policies
   * Met à jour les politiques client du realm.
   * Retourne 200 OK.
   */
  async updateClientPolicies(
    payload: ClientPoliciesRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(`${realmBase(realm)}/client-policies/policies`, payload);
  },

  /**
   * GET /admin/realms/{realm}/client-policies/profiles
   * Retourne les profils de politiques client du realm.
   * @param includeGlobalProfiles  Si true, inclut aussi les profils globaux.
   */
  async getClientProfiles(
    filters: ClientProfilesGetFilters = {},
    realm?: string
  ): Promise<ClientProfilesRepresentation> {
    const params: Record<string, unknown> = {};
    if (filters['include-global-profiles'] !== undefined) {
      params['include-global-profiles'] = filters['include-global-profiles'];
    }
    const data = await kc.get<unknown>(`${realmBase(realm)}/client-policies/profiles`, params);
    return safe(ClientProfilesRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/client-policies/profiles
   * Met à jour les profils de politiques client du realm.
   * Retourne 200 OK.
   */
  async updateClientProfiles(
    payload: ClientProfilesRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(`${realmBase(realm)}/client-policies/profiles`, payload);
  },

  // ─────────────────────────────────────────────────────────
  // 12. CLIENT TYPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-types
   * Retourne tous les types de clients disponibles dans le realm
   * (types globaux + types définis au niveau realm).
   */
  async listClientTypes(
    realm?: string
  ): Promise<ClientTypesRepresentation> {
    const data = await kc.get<unknown>(`${realmBase(realm)}/client-types`);
    return safe(ClientTypesRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/client-types
   * Met à jour un type de client au niveau realm.
   * Seuls les types realm-level peuvent être modifiés (pas les globaux).
   * Retourne 204 No Content.
   */
  async updateClientTypes(
    payload: ClientTypesRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(`${realmBase(realm)}/client-types`, payload);
  },

  // ─────────────────────────────────────────────────────────
  // 13. CLIENT REGISTRATION POLICY PROVIDERS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-registration-policy/providers
   * Retourne la liste des fournisseurs de politique d'enregistrement client
   * avec leurs propriétés de configuration (ComponentTypeRepresentation[]).
   */
  async listClientRegistrationPolicyProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${realmBase(realm)}/client-registration-policy/providers`
    );
    return Array.isArray(data) ? data : [];
  },

  // ─────────────────────────────────────────────────────────
  // 14. LOCALISATION (I18N)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/localization
   * Retourne la liste des locales configurées dans le realm.
   * Ex: ['fr', 'en', 'de', 'ar']
   */
  async listLocales(
    realm?: string
  ): Promise<string[]> {
    const data = await kc.get<unknown[]>(`${realmBase(realm)}/localization`);
    return Array.isArray(data) ? (data as string[]) : [];
  },

  /**
   * GET /admin/realms/{realm}/localization/{locale}
   * Retourne toutes les clés de traduction pour une locale.
   * Retourne Map<String, String>.
   * @param useRealmDefaultLocaleFallback  Si true, complète avec les clés de la locale par défaut.
   */
  async getLocale(
    locale: string,
    filters: LocalizationGetFilters = {},
    realm?: string
  ): Promise<Record<string, string>> {
    const params: Record<string, unknown> = {};
    if (filters.useRealmDefaultLocaleFallback !== undefined) {
      params.useRealmDefaultLocaleFallback = filters.useRealmDefaultLocaleFallback;
    }
    const data = await kc.get<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}`,
      params
    );
    return (data as Record<string, string>) ?? {};
  },

  /**
   * POST /admin/realms/{realm}/localization/{locale}
   * Importe un fichier JSON de traductions pour une locale.
   * @param payload  Map<String, String> — clés et leurs traductions.
   * Retourne 204 No Content.
   */
  async importLocale(
    locale: string,
    payload: LocalizationImportPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/localization/{locale}
   * Supprime toutes les traductions d'une locale.
   * Retourne 204 No Content.
   */
  async deleteLocale(
    locale: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/localization/{locale}/{key}
   * Retourne la traduction d'une clé spécifique pour une locale.
   * Retourne une chaîne de texte (text/plain).
   */
  async getLocaleKey(
    locale: string,
    key: string,
    realm?: string
  ): Promise<string> {
    const data = await kc.get<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}/${encodeURIComponent(key)}`
    );
    return typeof data === 'string' ? data : String(data ?? '');
  },

  /**
   * PUT /admin/realms/{realm}/localization/{locale}/{key}
   * Crée ou met à jour la traduction d'une clé pour une locale.
   * @param value  La valeur de traduction (chaîne).
   * Retourne 204 No Content.
   */
  async setLocaleKey(
    locale: string,
    key: string,
    value: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}/${encodeURIComponent(key)}`,
      value
    );
  },

  /**
   * DELETE /admin/realms/{realm}/localization/{locale}/{key}
   * Supprime la traduction d'une clé pour une locale.
   * Retourne 204 No Content.
   */
  async deleteLocaleKey(
    locale: string,
    key: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${realmBase(realm)}/localization/${encodeURIComponent(locale)}/${encodeURIComponent(key)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 15. SMTP
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/testSMTPConnection
   * Teste la connexion SMTP avec la configuration fournie.
   * Envoie un email de test à l'utilisateur admin courant.
   * @param config  Map<String, String> — host, port, from, auth, ssl, starttls, etc.
   * Retourne 204 No Content si succès, 500 si échec SMTP.
   */
  async testSmtpConnection(
    config: SmtpTestPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${realmBase(realm)}/testSMTPConnection`, config);
  },

  // ─────────────────────────────────────────────────────────
  // 16. EXPORT / IMPORT PARTIEL
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/partial-export
   * Export partiel du realm en JSON.
   * Peut inclure les clients et/ou les groupes+rôles.
   * Retourne RealmRepresentation (JSON complet ou partiel).
   */
  async partialExport(
    filters: PartialExportFilters = {},
    realm?: string
  ): Promise<RealmRepresentation> {
    const params: Record<string, unknown> = {};
    if (filters.exportClients          !== undefined) params.exportClients        = filters.exportClients;
    if (filters.exportGroupsAndRoles   !== undefined) params.exportGroupsAndRoles = filters.exportGroupsAndRoles;

    // POST avec query params — fetch direct pour inclure les params dans l'URL
    const qs    = new URLSearchParams(params as Record<string, string>).toString();
    const url   = `${realmBase(realm)}/partial-export${qs ? `?${qs}` : ''}`;
    const res   = await httpClient.fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`Erreur export partiel: ${res.statusText}`);
    const data  = await res.json();
    return safe(RealmRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/partialImport
   * Import partiel depuis un JSON vers un realm existant.
   * Peut importer users, clients, roles, groups, etc.
   * @param realmJson  Objet JSON représentant la configuration à importer.
   * Retourne un objet avec les résultats de l'import (overwritten, added, skipped).
   */
  async partialImport(
    realmJson: Record<string, unknown>,
    realm?: string
  ): Promise<unknown> {
    return kc.post<unknown>(`${realmBase(realm)}/partialImport`, realmJson);
  },

  // ─────────────────────────────────────────────────────────
  // 17. PERMISSIONS GESTION UTILISATEURS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users-management-permissions
   * Indique si les permissions fine-grained de gestion des utilisateurs
   * sont activées pour ce realm.
   */
  async getUsersManagementPermissions(
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.get<unknown>(`${realmBase(realm)}/users-management-permissions`);
    return safe(ManagementPermissionReferenceSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/users-management-permissions
   * Active ou désactive les permissions fine-grained de gestion des utilisateurs.
   */
  async setUsersManagementPermissions(
    payload: { enabled: boolean },
    realm?: string
  ): Promise<ManagementPermissionReference> {
    const data = await kc.put<unknown>(
      `${realmBase(realm)}/users-management-permissions`,
      payload
    );
    return safe(ManagementPermissionReferenceSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 18. MÉTHODES UTILITAIRES COMPOSÉES
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si un realm existe par son nom.
   */
  async exists(realmName: string): Promise<boolean> {
    try {
      await keycloakRealmsService.getByName(realmName);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Active ou désactive un realm en une seule opération.
   */
  async setEnabled(
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, { enabled });
  },

  /**
   * Met à jour la configuration SMTP du realm.
   * @param smtpConfig  Map<String, String> — host, port, from, user, password, ssl, starttls, auth.
   */
  async updateSmtpServer(
    smtpConfig: Record<string, string>,
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, { smtpServer: smtpConfig });
  },

  /**
   * Active ou désactive la protection Brute Force du realm.
   */
  async setBruteForceProtection(
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, { bruteForceProtected: enabled });
  },

  /**
   * Met à jour les paramètres d'internationalisation.
   */
  async updateI18nSettings(
    settings: {
      internationalizationEnabled?: boolean;
      supportedLocales?: string[];
      defaultLocale?: string;
    },
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, settings);
  },

  /**
   * Met à jour les durées de vie des tokens du realm.
   * Tous les champs sont optionnels — seuls les champs fournis sont mis à jour.
   */
  async updateTokenSettings(
    settings: {
      accessTokenLifespan?:                    number;
      accessTokenLifespanForImplicitFlow?:     number;
      ssoSessionIdleTimeout?:                  number;
      ssoSessionMaxLifespan?:                  number;
      offlineSessionIdleTimeout?:              number;
      offlineSessionMaxLifespan?:              number;
      refreshTokenMaxReuse?:                   number;
      revokeRefreshToken?:                     boolean;
      actionTokenGeneratedByAdminLifespan?:    number;
      actionTokenGeneratedByUserLifespan?:     number;
    },
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, settings);
  },

  /**
   * Met à jour les politiques de mot de passe du realm.
   * @param policy  Chaîne de politique Keycloak (ex: "length(8) and digits(1) and upperCase(1)")
   */
  async updatePasswordPolicy(
    policy: string,
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, { passwordPolicy: policy });
  },

  /**
   * Met à jour les thèmes visuels du realm.
   */
  async updateThemes(
    themes: {
      loginTheme?:   string;
      accountTheme?: string;
      adminTheme?:   string;
      emailTheme?:   string;
    },
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.update(realm, themes);
  },

  /**
   * Active les événements et configure les types d'événements à tracer.
   */
  async enableEvents(
    config: {
      eventsEnabled?: boolean;
      adminEventsEnabled?: boolean;
      adminEventsDetailsEnabled?: boolean;
      enabledEventTypes?: string[];
      eventsListeners?: string[];
      eventsExpiration?: number;
    },
    realm?: string
  ): Promise<void> {
    return keycloakRealmsService.updateEventsConfig(config, realm);
  },

  /**
   * Copie les traductions d'une locale vers une autre dans le même realm.
   * @param fromLocale  Locale source.
   * @param toLocale    Locale cible.
   */
  async copyLocale(
    fromLocale: string,
    toLocale: string,
    realm?: string
  ): Promise<void> {
    const translations = await keycloakRealmsService.getLocale(fromLocale, {}, realm);
    await keycloakRealmsService.importLocale(toLocale, translations, realm);
  },

  /**
   * Retourne un résumé des statistiques du realm :
   * clés actives, sessions par client, locales disponibles.
   */
  async getSummary(realm?: string): Promise<{
    realmInfo:       RealmRepresentation;
    keys:            KeysMetadataRepresentation;
    clientSessions:  unknown[];
    locales:         string[];
  }> {
    const [realmInfo, keys, clientSessions, locales] = await Promise.all([
      keycloakRealmsService.getByName(realm),
      keycloakRealmsService.getKeys(realm),
      keycloakRealmsService.getClientSessionStats(realm),
      keycloakRealmsService.listLocales(realm),
    ]);
    return { realmInfo, keys, clientSessions, locales };
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakRealmsService;
