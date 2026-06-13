// ============================================================
// services/iam/keycloakAttackDetectionService.ts
// Service complet — Détection d'attaques Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/attack-detection/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (3 au total) :
//   DELETE /attack-detection/brute-force/users              → clearAllBruteForce()
//   DELETE /attack-detection/brute-force/users/{userId}     → clearUserBruteForce()
//   GET    /attack-detection/brute-force/users/{userId}     → getUserBruteForceStatus()
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

/**
 * Statut brute force d'un utilisateur.
 * Keycloak retourne un Map<String, Object> avec des champs variables.
 */
const BruteForceStatusSchema = z.object({
  disabled:             z.boolean().optional(),
  numFailures:          z.number().optional(),
  lastFailure:          z.number().optional(),
  lastIPFailure:        z.string().optional(),
  failedLoginNotBefore: z.number().optional(),
}).passthrough();

export type BruteForceStatus = z.infer<typeof BruteForceStatusSchema>;

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractAttackDetectionError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('404')) return 'Utilisateur introuvable';
    if (msg.includes('403')) return 'Permission insuffisante pour cette action';
    if (msg.includes('400')) return 'Requête invalide';
    return msg || fallback;
  }
  return fallback;
}

// ── Wrapper interne ───────────────────────────────────────────
const kc = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return httpClient.get<T>(url, params);
  },
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakAttackDetectionService = {

  // ─────────────────────────────────────────────────────────
  // 1. BRUTE FORCE — TOUS LES UTILISATEURS
  // ─────────────────────────────────────────────────────────

  /**
   * DELETE /admin/realms/{realm}/attack-detection/brute-force/users
   * Efface tous les échecs de connexion pour tous les utilisateurs.
   * Permet de libérer les utilisateurs temporairement bloqués.
   * Retourne 204 No Content.
   */
  async clearAllBruteForce(
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/attack-detection/brute-force/users`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. BRUTE FORCE — UTILISATEUR SPÉCIFIQUE
  // ─────────────────────────────────────────────────────────

  /**
   * DELETE /admin/realms/{realm}/attack-detection/brute-force/users/{userId}
   * Efface tous les échecs de connexion pour un utilisateur spécifique.
   * Permet de libérer un utilisateur temporairement bloqué.
   * Retourne 204 No Content.
   */
  async clearUserBruteForce(
    userId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/attack-detection/brute-force/users/${encodeURIComponent(userId)}`
    );
  },

  /**
   * GET /admin/realms/{realm}/attack-detection/brute-force/users/{userId}
   * Retourne le statut de détection brute force pour un utilisateur.
   * Champs retournés : disabled, numFailures, lastFailure, lastIPFailure, failedLoginNotBefore.
   */
  async getUserBruteForceStatus(
    userId: string,
    realm?: string
  ): Promise<BruteForceStatus> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/attack-detection/brute-force/users/${encodeURIComponent(userId)}`
    );
    return safe(BruteForceStatusSchema, data);
  },

  // ─────────────────────────────────────────────────────────
  // 3. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Vérifie si un utilisateur est actuellement bloqué par le brute force.
   * Retourne true si l'utilisateur est désactivé par le brute force.
   */
  async isUserBruteForceDisabled(
    userId: string,
    realm?: string
  ): Promise<boolean> {
    const status = await keycloakAttackDetectionService.getUserBruteForceStatus(userId, realm);
    return status.disabled === true;
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakAttackDetectionService;
