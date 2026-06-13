// ============================================================
// services/iam/authService.ts
// Tous les appels Keycloak — OIDC Token Endpoint + Admin REST API
//
// ARCHITECTURE KEYCLOAK :
//  🔐 Auth   → POST /realms/{realm}/protocol/openid-connect/token
//  👤 Profil → GET  /realms/{realm}/protocol/openid-connect/userinfo
//  🛠 Admin  → /admin/realms/{realm}/users/**   (Bearer token admin)
//
// Variables d'environnement attendues (Next.js) :
//   NEXT_PUBLIC_KEYCLOAK_URL    = https://auth.mondomaine.com
//   NEXT_PUBLIC_KEYCLOAK_REALM  = mon-realm
//   NEXT_PUBLIC_KEYCLOAK_CLIENT = mon-client-id
//   KEYCLOAK_CLIENT_SECRET      = (si client confidentiel, côté serveur uniquement)
// ============================================================

import { httpClient } from '@/lib/http-client';
import { getCurrentRealm } from '@/lib/realm-resolver';

// ── Config Keycloak ────────────────────────────────────────
const KC_URL    = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
const KC_CLIENT = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT!;

/**
 * Retourne la base OIDC pour le realm courant (dynamique via sous-domaine).
 * Appelée à chaque requête pour garantir la cohérence multi-tenant.
 */
function getOidcBase(): string {
  const { realm } = getCurrentRealm();
  return `${KC_URL}/realms/${realm}/protocol/openid-connect`;
}

/**
 * Retourne la base Admin REST API pour le realm courant.
 */
function getAdminBase(): string {
  const { realm } = getCurrentRealm();
  return `${KC_URL}/admin/realms/${realm}`;
}

// ── Types Keycloak natifs ──────────────────────────────────
export interface KcTokenResponse {
  access_token:       string;
  refresh_token:      string;
  id_token?:          string;
  token_type:         string;         // "Bearer"
  expires_in:         number;         // secondes
  refresh_expires_in: number;
  session_state:      string;         // équivalent session_id
  scope:              string;
}

export interface KcUserInfo {
  sub:                string;         // userId Keycloak (UUID)
  preferred_username: string;
  email?:             string;
  email_verified?:    boolean;
  given_name?:        string;
  family_name?:       string;
  name?:              string;
  phone_number?:      string;
  realm_access?:      { roles: string[] };
  resource_access?:   Record<string, { roles: string[] }>;
  attributes?:        Record<string, string[]>;
}

export interface KcUserRepresentation {
  id:                string;
  username:          string;
  email?:            string;
  firstName?:        string;
  lastName?:         string;
  enabled:           boolean;
  emailVerified?:    boolean;
  attributes?:       Record<string, string[]>;
  realmRoles?:       string[];
  createdTimestamp?: number;
}

export interface KcSessionRepresentation {
  id:           string;
  username:     string;
  userId:       string;
  ipAddress:    string;
  start:        number;               // timestamp ms
  lastAccess:   number;               // timestamp ms
  clients:      Record<string, string>;
}

export interface KcCredentialRepresentation {
  type:      string;                  // "password"
  value:     string;
  temporary: boolean;
}

export interface KcRoleRepresentation {
  id?:          string;
  name:         string;
  description?: string;
  composite?:   boolean;
  clientRole?:  boolean;
  containerId?: string;
}

// ── Extraction du message d'erreur Keycloak ────────────────
export function extractErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Keycloak retourne { error: "invalid_grant", error_description: "..." }
    try {
      const parsed = JSON.parse(msg);
      if (parsed.error_description) return parsed.error_description;
      if (parsed.errorMessage)      return parsed.errorMessage;
      if (parsed.error)             return parsed.error;
    } catch { /* pas du JSON */ }

    if (msg.includes('401') || msg.toLowerCase().includes('invalid_grant'))
      return 'Identifiant ou mot de passe incorrect';
    if (msg.includes('403'))  return 'Accès refusé';
    if (msg.includes('404'))  return 'Ressource introuvable';
    if (msg.includes('409'))  return 'Conflit : ressource déjà existante';
    if (msg.includes('429'))  return 'Trop de tentatives, réessayez dans quelques minutes';
    if (msg.includes('500'))  return 'Erreur serveur, veuillez réessayer';
    return msg || fallback;
  }
  return fallback;
}

// ── Helper : appel OIDC token endpoint (x-www-form-urlencoded) ──
async function oidcTokenRequest(params: Record<string, string>): Promise<KcTokenResponse> {
  const body = new URLSearchParams({
    client_id: KC_CLIENT,
    ...params,
  });

  const res = await fetch(`${getOidcBase()}/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err) || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Helper : appel Admin REST API (JSON + Bearer) ──────────
async function adminRequest<T>(
  method: string,
  path:   string,
  token:  string,
  body?:  unknown,
): Promise<T> {
  const res = await fetch(`${getAdminBase()}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err) || `HTTP ${res.status}`);
  }

  // 204 No Content → pas de body
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ============================================================
// AUTH SERVICE  — OIDC Token Endpoint
// ============================================================
export const authService = {

  /**
   * POST /realms/{realm}/protocol/openid-connect/token
   * grant_type=password  (Resource Owner Password Credentials)
   *
   * ⚠️  Ce grant doit être activé dans Keycloak :
   *     Client → Settings → "Direct access grants" = ON
   */
  async login(username: string, password: string): Promise<KcTokenResponse> {
    return oidcTokenRequest({
      grant_type: 'password',
      username,
      password,
      scope: 'openid profile email',
    });
  },

  /**
   * POST /realms/{realm}/protocol/openid-connect/token
   * grant_type=refresh_token
   */
  async refreshToken(refreshToken: string): Promise<KcTokenResponse> {
    return oidcTokenRequest({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    });
  },

  /**
   * POST /realms/{realm}/protocol/openid-connect/logout
   * Révoque la session côté Keycloak
   *
   * Headers : Content-Type: application/x-www-form-urlencoded
   * Body    : client_id + refresh_token
   */
  async logout(refreshToken: string): Promise<void> {
    const body = new URLSearchParams({
      client_id:     KC_CLIENT,
      refresh_token: refreshToken,
    });
    await fetch(`${getOidcBase()}/logout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    // Keycloak retourne 204 — on ignore les erreurs de logout
  },

  /**
   * POST /realms/{realm}/protocol/openid-connect/token/introspect
   * Valide un token et retourne ses métadonnées
   *
   * ⚠️  Nécessite client_secret si client confidentiel.
   *     En public client, utiliser la validation JWT locale à la place.
   */
  async introspectToken(token: string, clientSecret?: string): Promise<Record<string, unknown>> {
    const body = new URLSearchParams({
      client_id: KC_CLIENT,
      token,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
    });
    const res = await fetch(`${getOidcBase()}/token/introspect`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
    if (!res.ok) throw new Error(`Introspection failed: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * GET /realms/{realm}/protocol/openid-connect/userinfo
   * Retourne les claims de l'utilisateur courant (profil + rôles si mappés)
   *
   * Authorization: Bearer <access_token>
   */
  async getUserInfo(accessToken: string): Promise<KcUserInfo> {
    const res = await fetch(`${getOidcBase()}/userinfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`UserInfo failed: HTTP ${res.status}`);
    return res.json();
  },

  // ── Sessions utilisateur courant ──────────────────────────

  /**
   * GET /admin/realms/{realm}/users/{userId}/sessions
   * Liste les sessions actives d'un utilisateur
   *
   * ⚠️  Requiert un token admin (realm-admin ou view-users)
   *     Pour les sessions de l'utilisateur courant, utilise userId extrait du token JWT
   */
  async getUserSessions(userId: string, adminToken: string): Promise<KcSessionRepresentation[]> {
    return adminRequest<KcSessionRepresentation[]>('GET', `/users/${userId}/sessions`, adminToken);
  },

  /**
   * DELETE /admin/realms/{realm}/sessions/{sessionId}
   * Révoque une session spécifique (toutes applications)
   *
   * ⚠️  Requiert un token admin
   */
  async revokeSession(sessionId: string, adminToken: string): Promise<void> {
    return adminRequest<void>('DELETE', `/sessions/${sessionId}`, adminToken);
  },

  /**
   * DELETE /admin/realms/{realm}/users/{userId}/sessions
   * Révoque TOUTES les sessions d'un utilisateur
   */
  async revokeAllUserSessions(userId: string, adminToken: string): Promise<void> {
    return adminRequest<void>('DELETE', `/users/${userId}/sessions`, adminToken);
  },
};

// ============================================================
// PROFIL SERVICE  — Profil + Rôles de l'utilisateur courant
// ============================================================
export const profilService = {

  /**
   * GET /realms/{realm}/protocol/openid-connect/userinfo
   * Profil complet de l'utilisateur authentifié
   *
   * Les rôles sont dans :
   *   userInfo.realm_access.roles        → rôles du realm
   *   userInfo.resource_access[clientId] → rôles du client
   *
   * ⚠️  Pour que les rôles apparaissent, configurer les Protocol Mappers
   *     dans Keycloak : Client → Client Scopes → roles → mapper "realm roles"
   */
  async getMonProfil(accessToken: string): Promise<KcUserInfo> {
    return authService.getUserInfo(accessToken);
  },

  /**
   * Extrait permissions et rôles depuis un KcUserInfo
   * Retourne { roles_actifs, permissions }
   */
  getMesHabilitations(userInfo: KcUserInfo, clientId = KC_CLIENT) {
    const realmRoles  = userInfo.realm_access?.roles ?? [];
    const clientRoles = userInfo.resource_access?.[clientId]?.roles ?? [];
    const roles_actifs = [...new Set([...realmRoles, ...clientRoles])];

    // On mappe les rôles comme "permissions" pour garder la compatibilité
    const permissions = roles_actifs.map((code) => ({ code, label: code }));

    return {
      profil_id:   userInfo.sub,
      roles_actifs,
      permissions,
      groupes_actifs: [] as string[], // Keycloak ne retourne pas les groupes dans userinfo par défaut
    };
  },

  /**
   * GET /admin/realms/{realm}/users/{userId}/role-mappings/realm
   * Rôles realm d'un utilisateur (admin uniquement)
   */
  async getRealmRoles(userId: string, adminToken: string): Promise<KcRoleRepresentation[]> {
    return adminRequest<KcRoleRepresentation[]>(
      'GET', `/users/${userId}/role-mappings/realm`, adminToken
    );
  },

  /**
   * GET /admin/realms/{realm}/events
   * Journal des événements (login, logout, etc.) pour le realm
   * Filtrer par user : ?user={userId}&type=LOGIN&type=LOGOUT
   *
   * ⚠️  Requiert token admin avec permission view-events
   */
  async getMonJournal(
    userId: string,
    adminToken: string,
    skip = 0,
    limit = 50,
  ): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams({
      user:  userId,
      first: String(skip),
      max:   String(limit),
    });
    const res = await fetch(`${getAdminBase()}/events?${params}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`Events failed: HTTP ${res.status}`);
    return res.json();
  },
};

// ============================================================
// ADMIN USER SERVICE  — Gestion des utilisateurs (admin)
// ============================================================
export const adminUserService = {

  /**
   * GET /admin/realms/{realm}/users
   * Liste les utilisateurs avec pagination et recherche
   *
   * Params optionnels : search, username, email, firstName, lastName,
   *                     first (offset), max (limit), enabled, emailVerified
   */
  async listUsers(
    adminToken: string,
    params: {
      search?:        string;
      username?:      string;
      email?:         string;
      first?:         number;
      max?:           number;
      enabled?:       boolean;
    } = {},
  ): Promise<KcUserRepresentation[]> {
    const qs = new URLSearchParams();
    if (params.search   !== undefined) qs.set('search',   params.search);
    if (params.username !== undefined) qs.set('username', params.username);
    if (params.email    !== undefined) qs.set('email',    params.email);
    if (params.first    !== undefined) qs.set('first',    String(params.first));
    if (params.max      !== undefined) qs.set('max',      String(params.max));
    if (params.enabled  !== undefined) qs.set('enabled',  String(params.enabled));

    const res = await fetch(`${getAdminBase()}/users?${qs}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`List users failed: HTTP ${res.status}`);
    return res.json();
  },

  /**
   * GET /admin/realms/{realm}/users/{userId}
   * Récupère un utilisateur par son ID Keycloak
   */
  async getUser(userId: string, adminToken: string): Promise<KcUserRepresentation> {
    return adminRequest<KcUserRepresentation>('GET', `/users/${userId}`, adminToken);
  },

  /**
   * POST /admin/realms/{realm}/users
   * Crée un nouvel utilisateur
   * Retourne 201 Created (l'ID est dans le header Location)
   *
   * Body minimal : { username, enabled: true }
   */
  async createUser(
    adminToken: string,
    user: {
      username:     string;
      email?:       string;
      firstName?:   string;
      lastName?:    string;
      enabled?:     boolean;
      credentials?: KcCredentialRepresentation[];
      attributes?:  Record<string, string[]>;
    },
  ): Promise<{ userId: string }> {
    const res = await fetch(`${getAdminBase()}/users`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ enabled: true, ...user }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err) || `Create user failed: HTTP ${res.status}`);
    }

    // Keycloak met l'ID dans le header Location : .../users/{id}
    const location = res.headers.get('Location') ?? '';
    const userId   = location.split('/').pop() ?? '';
    return { userId };
  },

  /**
   * PUT /admin/realms/{realm}/users/{userId}
   * Met à jour un utilisateur (remplace les champs fournis)
   */
  async updateUser(
    userId:     string,
    adminToken: string,
    updates:    Partial<KcUserRepresentation>,
  ): Promise<void> {
    return adminRequest<void>('PUT', `/users/${userId}`, adminToken, updates);
  },

  /**
   * DELETE /admin/realms/{realm}/users/{userId}
   * Supprime un utilisateur
   */
  async deleteUser(userId: string, adminToken: string): Promise<void> {
    return adminRequest<void>('DELETE', `/users/${userId}`, adminToken);
  },

  /**
   * PUT /admin/realms/{realm}/users/{userId}/reset-password
   * Réinitialise le mot de passe d'un utilisateur (admin)
   *
   * Body : { type: "password", value: "newPassword", temporary: true|false }
   * temporary=true → l'utilisateur devra changer son MDP à la prochaine connexion
   */
  async resetPassword(
    userId:      string,
    adminToken:  string,
    newPassword: string,
    temporary  = true,
  ): Promise<void> {
    return adminRequest<void>(
      'PUT',
      `/users/${userId}/reset-password`,
      adminToken,
      { type: 'password', value: newPassword, temporary } satisfies KcCredentialRepresentation,
    );
  },

  /**
   * PUT /admin/realms/{realm}/users/{userId}
   * Active ou désactive un compte utilisateur
   */
  async setUserEnabled(userId: string, adminToken: string, enabled: boolean): Promise<void> {
    return adminRequest<void>('PUT', `/users/${userId}`, adminToken, { enabled });
  },

  /**
   * POST /admin/realms/{realm}/users/{userId}/role-mappings/realm
   * Assigne des rôles realm à un utilisateur
   *
   * Body : [{ id, name }]  (tableau de KcRoleRepresentation)
   */
  async assignRealmRoles(
    userId:     string,
    adminToken: string,
    roles:      KcRoleRepresentation[],
  ): Promise<void> {
    return adminRequest<void>('POST', `/users/${userId}/role-mappings/realm`, adminToken, roles);
  },

  /**
   * DELETE /admin/realms/{realm}/users/{userId}/role-mappings/realm
   * Retire des rôles realm d'un utilisateur
   */
  async removeRealmRoles(
    userId:     string,
    adminToken: string,
    roles:      KcRoleRepresentation[],
  ): Promise<void> {
    return adminRequest<void>('DELETE', `/users/${userId}/role-mappings/realm`, adminToken, roles);
  },

  /**
   * GET /admin/realms/{realm}/users/count
   * Nombre total d'utilisateurs du realm
   */
  async countUsers(adminToken: string): Promise<number> {
    return adminRequest<number>('GET', '/users/count', adminToken);
  },
};

// ============================================================
// ADMIN SESSION SERVICE  — Métriques et stats (admin)
// ============================================================
export const adminSessionService = {

  /**
   * GET /admin/realms/{realm}/sessions/stats
   * Statistiques des sessions actives par client
   */
  async getSessionStats(adminToken: string): Promise<Record<string, number>> {
    return adminRequest<Record<string, number>>('GET', '/sessions/stats', adminToken);
  },

  /**
   * GET /admin/realms/{realm}/clients/{clientUuid}/session-count
   * Nombre de sessions actives pour un client spécifique
   */
  async getClientSessionCount(
    clientUuid: string,
    adminToken: string,
  ): Promise<{ count: number }> {
    return adminRequest<{ count: number }>(
      'GET', `/clients/${clientUuid}/session-count`, adminToken
    );
  },

  /**
   * GET /admin/realms/{realm}/clients/{clientUuid}/user-sessions
   * Liste des sessions utilisateur pour un client
   */
  async getClientUserSessions(
    clientUuid: string,
    adminToken: string,
    first = 0,
    max   = 100,
  ): Promise<KcSessionRepresentation[]> {
    return adminRequest<KcSessionRepresentation[]>(
      'GET',
      `/clients/${clientUuid}/user-sessions?first=${first}&max=${max}`,
      adminToken,
    );
  },
};