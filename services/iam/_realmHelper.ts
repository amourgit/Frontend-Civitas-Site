// ============================================================
// services/iam/_realmHelper.ts
// Helper interne partagé par tous les services IAM.
//
// Fournit adminBase() et oidcBase() dynamiques basées sur le
// sous-domaine courant via RealmResolver.
//
// USAGE dans chaque service IAM :
//   import { adminBase, oidcBase, getKcUrl } from './_realmHelper';
//
//   // Utilisation (realm extrait automatiquement du sous-domaine) :
//   const data = await kc.get(`${adminBase()}/users`);
//
//   // Surcharge manuelle du realm si besoin :
//   const data = await kc.get(`${adminBase('education')}/users`);
// ============================================================

import { getCurrentRealm, resolveRealm } from '@/lib/realm-resolver';

const KC_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';

/**
 * Retourne l'URL de base Admin REST API pour le realm courant.
 * Si `realm` est fourni, l'utilise directement (surcharge manuelle).
 *
 * @param realm  Realm Keycloak explicite (optionnel - sinon extrait du sous-domaine)
 */
export function adminBase(realm?: string): string {
  if (realm) return `${KC_URL}/admin/realms/${realm}`;

  const r = typeof window !== 'undefined'
    ? getCurrentRealm().realm
    : resolveRealm().realm;

  return `${KC_URL}/admin/realms/${r}`;
}

/**
 * Retourne l'URL de base OIDC pour le realm courant.
 *
 * @param realm  Realm Keycloak explicite (optionnel)
 */
export function oidcBase(realm?: string): string {
  if (realm) return `${KC_URL}/realms/${realm}/protocol/openid-connect`;

  const r = typeof window !== 'undefined'
    ? getCurrentRealm().realm
    : resolveRealm().realm;

  return `${KC_URL}/realms/${r}/protocol/openid-connect`;
}

/**
 * Retourne l'URL de base Keycloak (sans realm).
 */
export function getKcUrl(): string {
  return KC_URL;
}

/**
 * Retourne le realm courant (string).
 * Équivalent à getCurrentRealm().realm mais plus court.
 */
export function getCurrentRealmName(): string {
  if (typeof window !== 'undefined') return getCurrentRealm().realm;
  return resolveRealm().realm;
}
