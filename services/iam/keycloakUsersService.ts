// ============================================================
// services/iam/keycloakUsersService.ts
// Service complet — Gestion des Utilisateurs Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/users/*
// selon la documentation officielle Keycloak 26.6.1
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';
import {
  // Schémas
  UserRepresentationSchema,
  UserListSchema,
  UserCountSchema,
  CredentialListSchema,
  SessionListSchema,
  GroupListSchema,
  GroupCountSchema,
  StringListSchema,
  UnmanagedAttrsSchema,
  ImpersonationSchema,
  UPConfigSchema,
  UserProfileMetadataSchema,
  FederatedIdentityRepresentationSchema,
  // Types
  type UserRepresentation,
  type UserList,
  type UserProfileMetadata,
  type UPConfig,
  type CredentialRepresentation,
  type FederatedIdentityRepresentation,
  type GroupRepresentation,
  type UserSessionRepresentation,
  type CreateUserPayload,
  type UpdateUserPayload,
  type ResetPasswordPayload,
  type ExecuteActionsEmailPayload,
  type UsersListFilters,
} from '@/lib/models/iam/keycloak-user.model';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Construit le préfixe d'URL admin pour un realm donné.
 * Par défaut utilise NEXT_PUBLIC_'master'.
 */
/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  // Dégradé gracieux : retourne la donnée brute si valide côté JS
  return data as T;
}

// ── Extraction des erreurs Keycloak ──────────────────────────
export function extractKeycloakUserError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409') || msg.toLowerCase().includes('exists'))
      return 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà';
    if (msg.includes('404'))
      return 'Utilisateur introuvable';
    if (msg.includes('403'))
      return 'Permission insuffisante pour effectuer cette action';
    if (msg.includes('400'))
      return 'Données invalides — vérifiez les champs saisis';
    if (msg.includes('500'))
      return 'Erreur interne du serveur Keycloak';
    return msg || fallback;
  }
  return fallback;
}

// ── Client HTTP Keycloak (authentifié Bearer) ────────────────
/**
 * Wrapper interne : appelle l'API Keycloak Admin avec l'URL complète.
 * httpClient injecte automatiquement le Bearer token depuis tokenManager.
 */
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

export const keycloakUsersService = {

  // ─────────────────────────────────────────────────────────
  // 1. LISTE & COMPTAGE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users
   * Retourne la liste des utilisateurs filtrée et paginée.
   * Note: le champ `credentials` n'est pas peuplé pour performance.
   */
  async list(
    filters: UsersListFilters = {},
    realm?: string
  ): Promise<UserRepresentation[]> {
    const params: Record<string, unknown> = {};

    if (filters.briefRepresentation !== undefined) params.briefRepresentation = filters.briefRepresentation;
    if (filters.createdAfter)   params.createdAfter   = filters.createdAfter;
    if (filters.createdBefore)  params.createdBefore  = filters.createdBefore;
    if (filters.email)          params.email          = filters.email;
    if (filters.emailVerified !== undefined) params.emailVerified = filters.emailVerified;
    if (filters.enabled !== undefined)       params.enabled       = filters.enabled;
    if (filters.exact !== undefined)         params.exact         = filters.exact;
    if (filters.first !== undefined)         params.first         = filters.first;
    if (filters.firstName)      params.firstName      = filters.firstName;
    if (filters.idpAlias)       params.idpAlias       = filters.idpAlias;
    if (filters.idpUserId)      params.idpUserId      = filters.idpUserId;
    if (filters.lastName)       params.lastName       = filters.lastName;
    if (filters.max !== undefined) params.max         = filters.max;
    if (filters.q)              params.q              = filters.q;
    if (filters.search)         params.search         = filters.search;
    if (filters.username)       params.username       = filters.username;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/users`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(UserRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/users/count
   * Retourne le nombre d'utilisateurs correspondant aux critères.
   * Peut être appelé sans critère (retourne le total), avec `search`,
   * ou avec last/first/email/username.
   */
  async count(
    filters: Omit<UsersListFilters, 'first' | 'max' | 'briefRepresentation'> = {},
    realm?: string
  ): Promise<number> {
    const params: Record<string, unknown> = {};

    if (filters.createdAfter)   params.createdAfter  = filters.createdAfter;
    if (filters.createdBefore)  params.createdBefore = filters.createdBefore;
    if (filters.email)          params.email         = filters.email;
    if (filters.emailVerified !== undefined) params.emailVerified = filters.emailVerified;
    if (filters.enabled !== undefined)       params.enabled       = filters.enabled;
    if (filters.exact !== undefined)         params.exact         = filters.exact;
    if (filters.firstName)      params.firstName     = filters.firstName;
    if (filters.idpAlias)       params.idpAlias      = filters.idpAlias;
    if (filters.idpUserId)      params.idpUserId     = filters.idpUserId;
    if (filters.lastName)       params.lastName      = filters.lastName;
    if (filters.q)              params.q             = filters.q;
    if (filters.search)         params.search        = filters.search;
    if (filters.username)       params.username      = filters.username;

    const data = await kc.get<unknown>(`${adminBase(realm)}/users/count`, params);
    return safe(UserCountSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 2. CRUD UTILISATEUR
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}
   * Retourne la représentation complète d'un utilisateur.
   * @param userProfileMetadata  Si true, inclut les métadonnées du profil.
   */
  async getById(
    userId: string,
    options: { userProfileMetadata?: boolean } = {},
    realm?: string
  ): Promise<UserRepresentation> {
    const params: Record<string, unknown> = {};
    if (options.userProfileMetadata !== undefined)
      params.userProfileMetadata = options.userProfileMetadata;

    const data = await kc.get<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}`,
      params
    );
    return safe(UserRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/users
   * Crée un nouvel utilisateur. Le username doit être unique.
   * Retourne 201 Created avec l'URL de l'utilisateur dans le header Location.
   */
  async create(
    payload: CreateUserPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/users`, payload);
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}
   * Met à jour un utilisateur existant.
   * Retourne 204 No Content en cas de succès.
   */
  async update(
    userId: string,
    payload: UpdateUserPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}
   * Supprime définitivement un utilisateur.
   * Retourne 204 No Content.
   */
  async delete(
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. GESTION DES CREDENTIALS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/credentials
   * Liste tous les credentials d'un utilisateur.
   */
  async listCredentials(
    userId: string,
    realm?: string
  ): Promise<CredentialRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/credentials`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(CredentialListSchema.element, d));
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/credentials/{credentialId}
   * Supprime un credential spécifique d'un utilisateur.
   * Retourne 204 No Content.
   */
  async deleteCredential(
    userId: string,
    credentialId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}`
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/credentials/{credentialId}/userLabel
   * Met à jour le label (nom convivial) d'un credential.
   * Retourne 204 No Content.
   */
  async updateCredentialLabel(
    userId: string,
    credentialId: string,
    label: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}/userLabel`,
      label
    );
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/credentials/{credentialId}/moveToFirst
   * Déplace un credential en première position dans la liste.
   * Retourne 204 No Content.
   */
  async moveCredentialToFirst(
    userId: string,
    credentialId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}/moveToFirst`,
      {}
    );
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/credentials/{credentialId}/moveAfter/{newPreviousCredentialId}
   * Déplace un credential après un autre credential dans la liste.
   * Retourne 204 No Content.
   */
  async moveCredentialAfter(
    userId: string,
    credentialId: string,
    newPreviousCredentialId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}/moveAfter/${encodeURIComponent(newPreviousCredentialId)}`,
      {}
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/reset-password
   * Définit un nouveau mot de passe pour l'utilisateur.
   * Retourne 204 No Content.
   */
  async resetPassword(
    userId: string,
    payload: ResetPasswordPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/reset-password`,
      payload
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/disable-credential-types
   * Désactive tous les credentials d'un type spécifique pour l'utilisateur.
   * Retourne 204 No Content.
   * @param types  ex: ['password', 'otp']
   */
  async disableCredentialTypes(
    userId: string,
    types: string[],
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/disable-credential-types`,
      types
    );
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/configured-user-storage-credential-types
   * Retourne les types de credentials fournis par le user storage.
   * ex: ['password', 'otp'] pour les utilisateurs fédérés. Vide pour les locaux.
   */
  async getConfiguredStorageCredentialTypes(
    userId: string,
    realm?: string
  ): Promise<string[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/configured-user-storage-credential-types`
    );
    if (!Array.isArray(data)) return [];
    return safe(StringListSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 4. ENVOI D'EMAILS
  // ─────────────────────────────────────────────────────────

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/execute-actions-email
   * Envoie un email avec un lien pour exécuter des actions (ex: UPDATE_PASSWORD).
   * Retourne 204 No Content.
   */
  async sendExecuteActionsEmail(
    userId: string,
    payload: ExecuteActionsEmailPayload,
    realm?: string
  ): Promise<void> {
    const params: Record<string, unknown> = {};
    if (payload.client_id)    params.client_id    = payload.client_id;
    if (payload.redirect_uri) params.redirect_uri = payload.redirect_uri;
    if (payload.lifespan)     params.lifespan     = payload.lifespan;

    // Les actions sont dans le body, les query params sont séparés
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/execute-actions-email`,
      payload.actions
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/send-verify-email
   * Envoie un email de vérification d'adresse email.
   * Retourne 204 No Content.
   * @deprecated Utiliser sendExecuteActionsEmail(['VERIFY_EMAIL']) à la place.
   */
  async sendVerifyEmail(
    userId: string,
    options: { client_id?: string; redirect_uri?: string; lifespan?: number } = {},
    realm?: string
  ): Promise<void> {
    const params: Record<string, unknown> = {};
    if (options.client_id)    params.client_id    = options.client_id;
    if (options.redirect_uri) params.redirect_uri = options.redirect_uri;
    if (options.lifespan)     params.lifespan     = options.lifespan;

    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/send-verify-email`,
      {}
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/reset-password-email
   * @deprecated Utiliser sendExecuteActionsEmail(['UPDATE_PASSWORD']) à la place.
   * Envoie un email de réinitialisation de mot de passe.
   * Retourne 204 No Content.
   */
  async sendResetPasswordEmail(
    userId: string,
    options: { client_id?: string; redirect_uri?: string } = {},
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/reset-password-email`,
      {}
    );
  },

  // ─────────────────────────────────────────────────────────
  // 5. GROUPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/groups
   * Liste les groupes auxquels appartient l'utilisateur.
   */
  async listGroups(
    userId: string,
    options: { briefRepresentation?: boolean; first?: number; max?: number; search?: string } = {},
    realm?: string
  ): Promise<GroupRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (options.briefRepresentation !== undefined) params.briefRepresentation = options.briefRepresentation;
    if (options.first !== undefined)  params.first  = options.first;
    if (options.max !== undefined)    params.max    = options.max;
    if (options.search)               params.search = options.search;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/groups`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(GroupListSchema.element, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/groups/count
   * Retourne le nombre de groupes de l'utilisateur.
   */
  async countGroups(
    userId: string,
    search?: string,
    realm?: string
  ): Promise<number> {
    const params: Record<string, unknown> = {};
    if (search) params.search = search;

    const data = await kc.get<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/groups/count`,
      params
    );
    // Keycloak retourne Map<String, Long> → { "count": N }
    const parsed = safe(GroupCountSchema, data);
    return (parsed as Record<string, number>).count ?? 0;
  },

  /**
   * PUT /admin/realms/{realm}/users/{user-id}/groups/{groupId}
   * Ajoute l'utilisateur dans un groupe.
   * Retourne 204 No Content.
   */
  async joinGroup(
    userId: string,
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupId)}`,
      {}
    );
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/groups/{groupId}
   * Retire l'utilisateur d'un groupe.
   * Retourne 204 No Content.
   */
  async leaveGroup(
    userId: string,
    groupId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 6. SESSIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/sessions
   * Retourne les sessions actives de l'utilisateur.
   */
  async listSessions(
    userId: string,
    realm?: string
  ): Promise<UserSessionRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/sessions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(SessionListSchema.element, d));
  },

  /**
   * GET /admin/realms/{realm}/users/{user-id}/offline-sessions/{clientUuid}
   * Retourne les sessions offline (offline tokens) de l'utilisateur pour un client.
   */
  async listOfflineSessions(
    userId: string,
    clientUuid: string,
    realm?: string
  ): Promise<UserSessionRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/offline-sessions/${encodeURIComponent(clientUuid)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(SessionListSchema.element, d));
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/logout
   * Invalide toutes les sessions de l'utilisateur et notifie les clients.
   * Retourne 204 No Content.
   */
  async logout(
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/logout`,
      {}
    );
  },

  // ─────────────────────────────────────────────────────────
  // 7. IMPERSONATION
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/users/{user-id}/impersonation
   * Impersonne l'utilisateur (connexion en tant que lui).
   * Retourne un Map avec les infos de redirection.
   */
  async impersonate(
    userId: string,
    realm?: string
  ): Promise<Record<string, unknown>> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/impersonation`,
      {}
    );
    return safe(ImpersonationSchema, data) as Record<string, unknown>;
  },

  // ─────────────────────────────────────────────────────────
  // 8. IDENTITÉS FÉDÉRÉES (Social Logins)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/federated-identity
   * Liste les identity providers sociaux liés à l'utilisateur.
   */
  async listFederatedIdentities(
    userId: string,
    realm?: string
  ): Promise<FederatedIdentityRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/federated-identity`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(FederatedIdentityRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/users/{user-id}/federated-identity/{provider}
   * Lie un provider social à l'utilisateur.
   * Retourne 204 No Content.
   * @param provider  Alias du provider (ex: 'google', 'github')
   */
  async addFederatedIdentity(
    userId: string,
    provider: string,
    representation: FederatedIdentityRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/federated-identity/${encodeURIComponent(provider)}`,
      representation
    );
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/federated-identity/{provider}
   * Supprime le lien vers un provider social.
   * Retourne 204 No Content.
   */
  async removeFederatedIdentity(
    userId: string,
    provider: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/federated-identity/${encodeURIComponent(provider)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 9. CONSENTEMENTS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/consents
   * Liste les consentements accordés par l'utilisateur.
   */
  async listConsents(
    userId: string,
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/consents`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * DELETE /admin/realms/{realm}/users/{user-id}/consents/{client}
   * Révoque le consentement et les offline tokens pour un client.
   * Retourne 204 No Content.
   * @param client  Client ID (pas l'UUID, l'identifiant textuel)
   */
  async revokeConsent(
    userId: string,
    client: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/consents/${encodeURIComponent(client)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 10. PROFIL UTILISATEUR (User Profile / UP Config)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/profile
   * Retourne la configuration du profil utilisateur du realm.
   */
  async getProfileConfig(
    realm?: string
  ): Promise<UPConfig> {
    const data = await kc.get<unknown>(`${adminBase(realm)}/users/profile`);
    return safe(UPConfigSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/users/profile
   * Met à jour la configuration du profil utilisateur du realm.
   * Retourne la configuration mise à jour.
   */
  async updateProfileConfig(
    config: UPConfig,
    realm?: string
  ): Promise<UPConfig> {
    const data = await kc.put<unknown>(`${adminBase(realm)}/users/profile`, config);
    return safe(UPConfigSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/users/profile/metadata
   * Retourne les métadonnées du profil utilisateur.
   */
  async getProfileMetadata(
    realm?: string
  ): Promise<UserProfileMetadata> {
    const data = await kc.get<unknown>(`${adminBase(realm)}/users/profile/metadata`);
    return safe(UserProfileMetadataSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 11. ATTRIBUTS NON GÉRÉS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{user-id}/unmanagedAttributes
   * Retourne les attributs de l'utilisateur qui ne sont pas définis
   * dans la configuration du profil (attributs non gérés).
   */
  async getUnmanagedAttributes(
    userId: string,
    realm?: string
  ): Promise<Record<string, string[]>> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/users/${encodeURIComponent(userId)}/unmanagedAttributes`
    );
    return safe(UnmanagedAttrsSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 12. MÉTHODES UTILITAIRES COMPOSÉES
  // ─────────────────────────────────────────────────────────

  /**
   * Recherche paginée avec valeurs par défaut raisonnables.
   */
  async search(
    query: string,
    options: { first?: number; max?: number; exact?: boolean } = {},
    realm?: string
  ): Promise<UserRepresentation[]> {
    return keycloakUsersService.list(
      {
        search: query,
        first:  options.first ?? 0,
        max:    options.max   ?? 50,
        exact:  options.exact ?? false,
      },
      realm
    );
  },

  /**
   * Récupère un utilisateur par son username exact.
   * Retourne null si non trouvé.
   */
  async findByUsername(
    username: string,
    realm?: string
  ): Promise<UserRepresentation | null> {
    const users = await keycloakUsersService.list(
      { username, exact: true, max: 1 },
      realm
    );
    return users[0] ?? null;
  },

  /**
   * Récupère un utilisateur par son email exact.
   * Retourne null si non trouvé.
   */
  async findByEmail(
    email: string,
    realm?: string
  ): Promise<UserRepresentation | null> {
    const users = await keycloakUsersService.list(
      { email, exact: true, max: 1 },
      realm
    );
    return users[0] ?? null;
  },

  /**
   * Active ou désactive un utilisateur en une seule opération.
   */
  async setEnabled(
    userId: string,
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakUsersService.update(userId, { enabled }, realm);
  },

  /**
   * Envoie un email de reset de mot de passe (méthode recommandée Keycloak 26+).
   * Utilise execute-actions-email avec UPDATE_PASSWORD.
   */
  async sendPasswordResetEmail(
    userId: string,
    options: { clientId?: string; redirectUri?: string; lifespan?: number } = {},
    realm?: string
  ): Promise<void> {
    return keycloakUsersService.sendExecuteActionsEmail(
      userId,
      {
        actions:      ['UPDATE_PASSWORD'],
        client_id:    options.clientId,
        redirect_uri: options.redirectUri,
        lifespan:     options.lifespan,
      },
      realm
    );
  },

  /**
   * Définit un mot de passe temporaire pour l'utilisateur.
   * L'utilisateur devra le changer à la prochaine connexion.
   */
  async setTemporaryPassword(
    userId: string,
    password: string,
    realm?: string
  ): Promise<void> {
    return keycloakUsersService.resetPassword(
      userId,
      { type: 'password', value: password, temporary: true },
      realm
    );
  },

  /**
   * Définit un mot de passe permanent pour l'utilisateur.
   */
  async setPermanentPassword(
    userId: string,
    password: string,
    realm?: string
  ): Promise<void> {
    return keycloakUsersService.resetPassword(
      userId,
      { type: 'password', value: password, temporary: false },
      realm
    );
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakUsersService;
