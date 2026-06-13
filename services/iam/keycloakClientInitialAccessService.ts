// ============================================================
// services/iam/keycloakClientInitialAccessService.ts
// Service complet — Accès Initial Client Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/clients-initial-access/*
// et /admin/realms/{realm}/client-registration-policy/providers
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (4 au total) :
//
// ── CLIENT INITIAL ACCESS ────────────────────────────────────
//   GET    /clients-initial-access        → list()
//   POST   /clients-initial-access        → create()
//   DELETE /clients-initial-access/{id}   → delete()
//
// ── CLIENT REGISTRATION POLICY ───────────────────────────────
//   GET    /client-registration-policy/providers → listRegistrationPolicyProviders()
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

const ClientInitialAccessPresentationSchema = z.object({
  id:              z.string().optional(),
  token:           z.string().optional(),
  timestamp:       z.number().optional(),
  expiration:      z.number().optional(),
  count:           z.number().optional(),
  remainingCount:  z.number().optional(),
}).passthrough();

const ClientInitialAccessCreatePresentationSchema = z.object({
  expiration: z.number().optional(),
  count:      z.number().optional(),
}).passthrough();

export type ClientInitialAccessPresentation = z.infer<typeof ClientInitialAccessPresentationSchema>;
export type ClientInitialAccessCreatePresentation = z.infer<typeof ClientInitialAccessCreatePresentationSchema>;

export interface CreateClientInitialAccessPayload {
  /** Durée de validité en secondes. 0 = pas d'expiration. */
  expiration?: number;
  /** Nombre d'utilisations autorisées. 0 = illimité. */
  count?:      number;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractClientInitialAccessError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('404')) return 'Token d\'accès initial introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Paramètres invalides';
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
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakClientInitialAccessService = {

  // ─────────────────────────────────────────────────────────
  // 1. CLIENT INITIAL ACCESS TOKENS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/clients-initial-access
   * Retourne la liste de tous les tokens d'accès initial pour l'enregistrement de clients.
   */
  async list(
    realm?: string
  ): Promise<ClientInitialAccessPresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/clients-initial-access`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientInitialAccessPresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/clients-initial-access
   * Crée un nouveau token d'accès initial pour l'enregistrement de clients.
   * Retourne le token créé (inclut le token brut, visible seulement à la création).
   */
  async create(
    payload: CreateClientInitialAccessPayload,
    realm?: string
  ): Promise<ClientInitialAccessPresentation> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/clients-initial-access`,
      payload
    );
    return safe(ClientInitialAccessPresentationSchema, data);
  },

  /**
   * DELETE /admin/realms/{realm}/clients-initial-access/{id}
   * Supprime un token d'accès initial.
   * Retourne 204 No Content.
   */
  async delete(
    id: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/clients-initial-access/${encodeURIComponent(id)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. CLIENT REGISTRATION POLICY
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-registration-policy/providers
   * Retourne la liste des providers de politique d'enregistrement client disponibles.
   */
  async listRegistrationPolicyProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/client-registration-policy/providers`
    );
    return Array.isArray(data) ? data : [];
  },

  // ─────────────────────────────────────────────────────────
  // 3. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Crée un token à usage unique (count=1) sans expiration.
   * Pratique pour les intégrations ponctuelles.
   */
  async createSingleUseToken(
    realm?: string
  ): Promise<ClientInitialAccessPresentation> {
    return keycloakClientInitialAccessService.create({ count: 1 }, realm);
  },

  /**
   * Crée un token limité dans le temps (en secondes) et en nombre d'utilisations.
   */
  async createLimitedToken(
    options: { expirationSeconds?: number; maxCount?: number } = {},
    realm?: string
  ): Promise<ClientInitialAccessPresentation> {
    return keycloakClientInitialAccessService.create(
      {
        expiration: options.expirationSeconds,
        count:      options.maxCount,
      },
      realm
    );
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakClientInitialAccessService;
