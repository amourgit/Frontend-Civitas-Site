// ============================================================
// services/iam/keycloakComponentsService.ts
// Service complet — Gestion des Composants Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/components/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (6 au total) :
//   GET    /components                             → list()
//   POST   /components                             → create()
//   GET    /components/{id}                        → getById()
//   PUT    /components/{id}                        → update()
//   DELETE /components/{id}                        → delete()
//   GET    /components/{id}/sub-component-types    → listSubComponentTypes()
//
// Les composants couvrent : User Storage, LDAP, Kerberos, OTP Policy,
// AES, RSA, Client Registration Policy, Password Policy, etc.
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

const ComponentRepresentationSchema = z.object({
  id:            z.string().optional(),
  name:          z.string().optional(),
  providerId:    z.string().optional(),
  providerType:  z.string().optional(),
  parentId:      z.string().optional(),
  subType:       z.string().optional(),
  config:        z.record(z.array(z.string())).optional(),
}).passthrough();

const ComponentTypeRepresentationSchema = z.object({
  id:           z.string().optional(),
  helpText:     z.string().optional(),
  properties:   z.array(z.record(z.unknown())).optional(),
  metadata:     z.record(z.unknown()).optional(),
}).passthrough();

export type ComponentRepresentation = z.infer<typeof ComponentRepresentationSchema>;
export type ComponentTypeRepresentation = z.infer<typeof ComponentTypeRepresentationSchema>;

export interface CreateComponentPayload {
  name:          string;
  providerId:    string;
  providerType:  string;
  parentId?:     string;
  subType?:      string;
  config?:       Record<string, string[]>;
}

export interface UpdateComponentPayload extends Partial<CreateComponentPayload> {}

export interface ComponentsListFilters {
  /** ID du parent (pour lister les composants d'un parent) */
  parent?:      string;
  /** Type de provider (ex: 'org.keycloak.storage.UserStorageProvider') */
  type?:        string;
  /** Nom du composant */
  name?:        string;
}

// Types courants de providers Keycloak
export const COMPONENT_PROVIDER_TYPES = {
  USER_STORAGE:            'org.keycloak.storage.UserStorageProvider',
  CLIENT_STORAGE:          'org.keycloak.storage.ClientStorageProvider',
  GROUP_STORAGE:           'org.keycloak.storage.GroupStorageProvider',
  KEY_PROVIDER:            'org.keycloak.keys.KeyProvider',
  OTP_POLICY:              'org.keycloak.policy.OtpPolicyProvider',
  CLIENT_REGISTRATION:     'org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy',
  PASSWORD_POLICY:         'org.keycloak.policy.PasswordPolicyProvider',
  LDAP:                    'org.keycloak.storage.ldap.LDAPStorageMapper',
} as const;

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractComponentError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un composant avec ce nom existe déjà';
    if (msg.includes('404')) return 'Composant introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Configuration de composant invalide';
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

export const keycloakComponentsService = {

  // ─────────────────────────────────────────────────────────
  // 1. LISTE & FILTRAGE
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/components
   * Retourne la liste des composants du realm, filtrée optionnellement.
   * @param filters.parent  ID du composant parent (ex: ID du realm)
   * @param filters.type    Type de provider (ex: 'org.keycloak.storage.UserStorageProvider')
   * @param filters.name    Nom du composant
   */
  async list(
    filters: ComponentsListFilters = {},
    realm?: string
  ): Promise<ComponentRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.parent) params.parent = filters.parent;
    if (filters.type)   params.type   = filters.type;
    if (filters.name)   params.name   = filters.name;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/components`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ComponentRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 2. CRUD COMPOSANT
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/components
   * Crée un nouveau composant.
   * Retourne 201 Created avec l'URL du composant dans Location.
   */
  async create(
    payload: CreateComponentPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/components`, payload);
  },

  /**
   * GET /admin/realms/{realm}/components/{id}
   * Retourne les détails d'un composant par son ID.
   */
  async getById(
    id: string,
    realm?: string
  ): Promise<ComponentRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/components/${encodeURIComponent(id)}`
    );
    return safe(ComponentRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/components/{id}
   * Met à jour un composant existant.
   * Retourne 204 No Content.
   */
  async update(
    id: string,
    payload: UpdateComponentPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/components/${encodeURIComponent(id)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/components/{id}
   * Supprime un composant.
   * Retourne 204 No Content.
   */
  async delete(
    id: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/components/${encodeURIComponent(id)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. SOUS-TYPES DE COMPOSANTS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/components/{id}/sub-component-types
   * Retourne les types de sous-composants disponibles pour un composant.
   * Utile pour lister les mappers LDAP disponibles pour un User Storage Provider.
   * @param type  Type de provider à filtrer (optionnel)
   */
  async listSubComponentTypes(
    id: string,
    type?: string,
    realm?: string
  ): Promise<ComponentTypeRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (type) params.type = type;

    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/components/${encodeURIComponent(id)}/sub-component-types`,
      params
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ComponentTypeRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 4. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Retourne la liste des User Storage Providers (LDAP, Kerberos, etc.) du realm.
   */
  async listUserStorageProviders(
    realm?: string
  ): Promise<ComponentRepresentation[]> {
    return keycloakComponentsService.list(
      { type: COMPONENT_PROVIDER_TYPES.USER_STORAGE },
      realm
    );
  },

  /**
   * Retourne la liste des Key Providers (RSA, AES, HMAC, etc.) du realm.
   */
  async listKeyProviders(
    realm?: string
  ): Promise<ComponentRepresentation[]> {
    return keycloakComponentsService.list(
      { type: COMPONENT_PROVIDER_TYPES.KEY_PROVIDER },
      realm
    );
  },

  /**
   * Retourne les mappers LDAP configurés pour un User Storage Provider LDAP.
   * @param userStorageProviderId  ID du User Storage Provider LDAP
   */
  async listLdapMappers(
    userStorageProviderId: string,
    realm?: string
  ): Promise<ComponentRepresentation[]> {
    return keycloakComponentsService.list(
      {
        parent: userStorageProviderId,
        type:   COMPONENT_PROVIDER_TYPES.LDAP,
      },
      realm
    );
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakComponentsService;
