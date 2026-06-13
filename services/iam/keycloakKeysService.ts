// ============================================================
// services/iam/keycloakKeysService.ts
// Service complet — Gestion des Clés Cryptographiques Keycloak Admin REST API v26
//
// Couvre l'endpoint /admin/realms/{realm}/keys
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (1 au total) :
//   GET    /keys  → getKeys()
//
// Note : La gestion des Key Providers (création de clés RSA/AES/HMAC/etc.)
// se fait via keycloakComponentsService (composants de type KeyProvider).
// Cet endpoint retourne uniquement les clés actives/disponibles du realm.
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

const KeyUseSchema = z.enum(['SIG', 'ENC']).optional();

const KeyMetadataRepresentationSchema = z.object({
  providerId:     z.string().optional(),
  providerPriority: z.number().optional(),
  kid:            z.string().optional(),
  status:         z.string().optional(),
  type:           z.string().optional(),
  algorithm:      z.string().optional(),
  publicKey:      z.string().optional(),
  certificate:    z.string().optional(),
  use:            KeyUseSchema,
  validTo:        z.number().optional(),
}).passthrough();

const KeysMetadataRepresentationSchema = z.object({
  active: z.record(z.string()).optional(),
  keys:   z.array(KeyMetadataRepresentationSchema).optional(),
}).passthrough();

export type KeyMetadataRepresentation = z.infer<typeof KeyMetadataRepresentationSchema>;
export type KeysMetadataRepresentation = z.infer<typeof KeysMetadataRepresentationSchema>;
export type KeyUse = 'SIG' | 'ENC';

// ── Helper de parsing sécurisé ────────────────────────────────
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
};

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakKeysService = {

  // ─────────────────────────────────────────────────────────
  // 1. CLÉS ACTIVES DU REALM
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/keys
   * Retourne les métadonnées de toutes les clés cryptographiques actives du realm.
   * Inclut :
   *  - active : Map<String, String> — kid actif par algorithme
   *  - keys   : liste de toutes les clés avec détails (type, algorithme, certificat, etc.)
   */
  async getKeys(
    realm?: string
  ): Promise<KeysMetadataRepresentation> {
    const data = await kc.get<unknown>(`${adminBase(realm)}/keys`);
    return safe(KeysMetadataRepresentationSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 2. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Retourne uniquement les clés de signature (use = 'SIG').
   */
  async getSigningKeys(
    realm?: string
  ): Promise<KeyMetadataRepresentation[]> {
    const metadata = await keycloakKeysService.getKeys(realm);
    return (metadata.keys ?? []).filter((k) => k.use === 'SIG');
  },

  /**
   * Retourne uniquement les clés de chiffrement (use = 'ENC').
   */
  async getEncryptionKeys(
    realm?: string
  ): Promise<KeyMetadataRepresentation[]> {
    const metadata = await keycloakKeysService.getKeys(realm);
    return (metadata.keys ?? []).filter((k) => k.use === 'ENC');
  },

  /**
   * Retourne les clés actives par algorithme (Map<algorithme, kid>).
   */
  async getActiveKeyIds(
    realm?: string
  ): Promise<Record<string, string>> {
    const metadata = await keycloakKeysService.getKeys(realm);
    return metadata.active ?? {};
  },

  /**
   * Retourne les clés filtrées par algorithme (ex: 'RS256', 'ES256', 'HS256').
   */
  async getKeysByAlgorithm(
    algorithm: string,
    realm?: string
  ): Promise<KeyMetadataRepresentation[]> {
    const metadata = await keycloakKeysService.getKeys(realm);
    return (metadata.keys ?? []).filter((k) => k.algorithm === algorithm);
  },

  /**
   * Retourne les clés filtrées par statut (ex: 'ACTIVE', 'PASSIVE', 'DISABLED').
   */
  async getKeysByStatus(
    status: 'ACTIVE' | 'PASSIVE' | 'DISABLED',
    realm?: string
  ): Promise<KeyMetadataRepresentation[]> {
    const metadata = await keycloakKeysService.getKeys(realm);
    return (metadata.keys ?? []).filter((k) => k.status === status);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakKeysService;
