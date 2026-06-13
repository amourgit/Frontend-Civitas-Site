// ============================================================
// lib/realm-resolver.ts
// RealmResolver — Extraction dynamique du Realm Keycloak
//
// PRINCIPE ARCHITECTURAL :
//   Le realm Keycloak correspond au sous-domaine de l'URL.
//   Exemple :
//     https://monentite.iam-central.ga  →  realm = "monentite"
//     https://education.iam-central.ga  →  realm = "education"
//     https://sante.iam-central.ga      →  realm = "sante"
//     http://localhost:3001             →  realm = fallback (env ou "master")
//
// PRIORITÉ DE RÉSOLUTION (ordre décroissant) :
//   1. Paramètre explicite passé à resolveRealm(host)          — test / SSR
//   2. window.location.hostname        (client)                — navigateur
//   3. NEXT_PUBLIC_KEYCLOAK_REALM      (env)                  — fallback configuré
//   4. "master"                                                — fallback absolu
//
// FONCTIONNEMENT :
//   - Côté CLIENT  : lit window.location.hostname
//   - Côté SERVEUR : reçoit le header `host` via NextRequest
//   - Dans les Route Handlers : utiliser resolveRealmFromRequest(req)
//   - Dans les services IAM  : utiliser resolveRealm()
//
// Ce module est SYNCHRONE et sans effet de bord — safe pour SSR/Edge.
// ============================================================

// ── Configuration ─────────────────────────────────────────
const ENV_REALM   = (import.meta as any).env?.VITE_KEYCLOAK_REALM || process.env.NEXT_PUBLIC_KEYCLOAK_REALM || '';
const ENV_KC_URL  = (import.meta as any).env?.VITE_KEYCLOAK_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';

/**
 * Domaines racines à exclure de l'extraction du sous-domaine.
 * Si le hostname correspond à l'un de ces domaines (ou est localhost),
 * on retombe sur le realm de l'environnement ou "master".
 *
 * Enrichir cette liste selon l'infrastructure de déploiement.
 */
import { getTopSubdomain } from './subdomain-resolver';

const ROOT_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '::1',
  'iam-central.ga',
  'iam-central.com',
  'iam-central.io',
  'iamcentral.ga',
] as const;

// ── Types ─────────────────────────────────────────────────

export interface ResolvedRealm {
  /** Nom du realm Keycloak */
  realm: string;
  /** Sous-domaine extrait (null si fallback) */
  subdomain: string | null;
  /** true si le realm vient d'un sous-domaine réel */
  isDynamic: boolean;
  /** URL de base OIDC pour ce realm */
  oidcBase: string;
  /** URL de base Admin REST pour ce realm */
  adminBase: string;
  /** URL complète Keycloak */
  keycloakUrl: string;
}

// ── Extraction du sous-domaine ────────────────────────────

/**
 * Extrait le sous-domaine depuis un hostname.
 *
 * Règles :
 *  - "monentite.iam-central.ga"  →  "monentite"
 *  - "sub.monentite.iam-central.ga"  →  "sub"  (premier segment)
 *  - "localhost" / IP / domaine racine  →  null
 *
 * @param hostname  Le hostname brut (ex: "monentite.iam-central.ga")
 * @returns Le sous-domaine ou null si inexistant / non pertinent
 */
export function extractSubdomain(hostname: string): string | null {
  if (!hostname) return null;
  // Délègue au SubdomainResolver multi-niveaux
  // Retourne le sous-domaine le plus éloigné du rootDomain (= tenant principal)
  return getTopSubdomain(hostname);
}

// ── Résolution principale ─────────────────────────────────

/**
 * Résout le realm Keycloak depuis un hostname.
 * Utilisable côté CLIENT et SERVEUR (Route Handlers).
 *
 * @param hostname  Hostname explicite (pour SSR/Edge). Si omis, utilise
 *                  window.location.hostname côté client.
 * @returns ResolvedRealm avec toutes les URLs pré-calculées
 */
export function resolveRealm(hostname?: string): ResolvedRealm {
  // 1. Déterminer le hostname source
  let host: string;

  if (hostname) {
    host = hostname;
  } else if (typeof window !== 'undefined') {
    host = window.location.hostname;
  } else {
    // SSR sans hostname fourni → fallback
    host = '';
  }

  // 2. Extraire le sous-domaine
  const subdomain = extractSubdomain(host);

  // 3. Déterminer le realm final
  const realm = subdomain || ENV_REALM || 'master';
  const isDynamic = !!subdomain;

  // 4. Pré-calculer les URLs Keycloak
  const keycloakUrl = ENV_KC_URL;
  const oidcBase    = `${keycloakUrl}/realms/${realm}/protocol/openid-connect`;
  const adminBase   = `${keycloakUrl}/admin/realms/${realm}`;

  return {
    realm,
    subdomain,
    isDynamic,
    oidcBase,
    adminBase,
    keycloakUrl,
  };
}

/**
 * Version simplifiée — retourne uniquement le nom du realm.
 * À utiliser dans les services IAM comme remplacement de la constante.
 *
 * @param hostname  Hostname optionnel (pour SSR)
 * @returns Nom du realm
 */
export function getRealm(hostname?: string): string {
  return resolveRealm(hostname).realm;
}

/**
 * Retourne l'URL de base Admin REST API pour un realm.
 *
 * @param realm     Realm explicite (si déjà connu)
 * @param hostname  Hostname pour extraction automatique
 */
export function getAdminBase(realm?: string, hostname?: string): string {
  if (realm) return `${ENV_KC_URL}/admin/realms/${realm}`;
  return resolveRealm(hostname).adminBase;
}

/**
 * Retourne l'URL de base OIDC pour un realm.
 *
 * @param realm     Realm explicite (si déjà connu)
 * @param hostname  Hostname pour extraction automatique
 */
export function getOidcBase(realm?: string, hostname?: string): string {
  if (realm) return `${ENV_KC_URL}/realms/${realm}/protocol/openid-connect`;
  return resolveRealm(hostname).oidcBase;
}

// ── Route Handler helper ──────────────────────────────────

/**
 * Extrait le realm depuis un objet NextRequest (header `host`).
 * À utiliser dans les Route Handlers (app/api/**).
 *
 * @param request  NextRequest de Next.js
 * @returns ResolvedRealm
 *
 * @example
 * // Dans app/api/auth/login/route.ts
 * import { resolveRealmFromRequest } from '@/lib/realm-resolver';
 *
 * export async function POST(request: NextRequest) {
 *   const { realm, oidcBase, adminBase } = resolveRealmFromRequest(request);
 *   const OIDC_TOKEN_URL = `${oidcBase}/token`;
 *   // ...
 * }
 */
export function resolveRealmFromRequest(
  request: { headers: { get: (key: string) => string | null } }
): ResolvedRealm {
  // Next.js Edge / Node : le hostname réel est dans le header `host`
  // En production derrière un reverse-proxy, `x-forwarded-host` est prioritaire
  const xForwardedHost = request.headers.get('x-forwarded-host');
  const host           = request.headers.get('host');
  const hostname       = xForwardedHost || host || '';

  return resolveRealm(hostname);
}

// ── Hook React (Client uniquement) ────────────────────────

/**
 * Retourne le ResolvedRealm courant depuis window.location.
 * Doit être appelé uniquement côté client (dans un composant ou hook React).
 *
 * Utilise un cache module-level pour éviter de recalculer à chaque render.
 */
let _cachedRealm: ResolvedRealm | null = null;

export function getCurrentRealm(): ResolvedRealm {
  if (typeof window === 'undefined') {
    // SSR : retourner sans cache (le hostname peut varier par requête)
    return resolveRealm();
  }

  // Invalider le cache si le hostname a changé (ex: dev multi-tenants)
  const currentHost = window.location.hostname;
  if (!_cachedRealm || extractSubdomain(currentHost) !== _cachedRealm.subdomain) {
    _cachedRealm = resolveRealm(currentHost);
  }

  return _cachedRealm;
}

/**
 * Invalide le cache du realm (utile pour les tests).
 */
export function clearRealmCache(): void {
  _cachedRealm = null;
}

// ── Export par défaut ─────────────────────────────────────
export default {
  resolveRealm,
  resolveRealmFromRequest,
  getCurrentRealm,
  getRealm,
  getAdminBase,
  getOidcBase,
  extractSubdomain,
  clearRealmCache,
};
