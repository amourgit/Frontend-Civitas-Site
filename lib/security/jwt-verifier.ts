// ============================================================
// lib/security/jwt-verifier.ts
// Vérification JWT — Edge Runtime compatible (middleware Next.js).
//
// KEYCLOAK SIGNE EN RS256 (asymétrique) :
//   - La clé publique est exposée sur le JWKS endpoint Keycloak :
//     GET /realms/{realm}/protocol/openid-connect/certs
//   - jose supporte createRemoteJWKSet() qui est Edge Runtime compatible.
//   - Les clés publiques sont mises en cache automatiquement par jose.
//
// ANCIENNE APPROCHE (FastAPI HS256) :
//   - Les tokens FastAPI étaient signés avec un secret HMAC-HS256.
//   - Keycloak NE partage PAS ce secret → la vérification HS256 échouait.
//   - JWT_SECRET (HMAC) est conservé uniquement pour la migration.
//
// ORDRE DE VÉRIFICATION :
//   1. JWKS Keycloak (RS256) → recommandé, production
//   2. Secret HMAC (HS256)   → fallback legacy uniquement si KC_REALM absent
//   3. Decode sans signature  → dev uniquement, jamais en production
// ============================================================

import { jwtVerify, decodeJwt, createRemoteJWKSet, type JWTPayload } from 'jose';

// ── Payload attendu des tokens Keycloak ───────────────────
export interface IAMJWTPayload extends JWTPayload {
  sub:            string;          // userId Keycloak (UUID)
  preferred_username?: string;
  email?:             string;
  realm_access?:      { roles: string[] };
  resource_access?:   Record<string, { roles: string[] }>;
  // Champs custom (si Protocol Mappers configurés dans Keycloak)
  username?:      string;
  type_profil?:   string;
  is_admin?:      boolean;
  session_id?:    string;
  token_type?:    'access' | 'refresh';
  // Champs standard JWT
  iat?:           number;
  exp?:           number;
  iss?:           string;
  session_state?: string;
}

// ── Résultat de vérification ──────────────────────────────
export type JWTVerifyResult =
  | { valid: true;  payload: IAMJWTPayload; expiresIn: number }
  | { valid: false; reason: 'expired' | 'invalid_signature' | 'malformed' | 'no_secret' };

// ── Cache du JWKS (module-level singleton, Edge Runtime OK) ─
// createRemoteJWKSet met lui-même en cache les clés publiques.
// Cache par realm pour supporter le multi-tenant.
const _jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJWKS(realm?: string): ReturnType<typeof createRemoteJWKSet> | null {
  const kcUrl      = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  // Utiliser le realm fourni, sinon fallback sur l'env (middleware Edge)
  const kcRealm    = realm || process.env.NEXT_PUBLIC_KEYCLOAK_REALM;

  if (!kcUrl || !kcRealm) return null;

  if (!_jwksCache.has(kcRealm)) {
    const jwksUrl = new URL(
      `/realms/${kcRealm}/protocol/openid-connect/certs`,
      kcUrl
    );
    _jwksCache.set(kcRealm, createRemoteJWKSet(jwksUrl));
  }
  return _jwksCache.get(kcRealm)!;
}

// ── Clé HMAC legacy (FastAPI) ─────────────────────────────
function getHMACKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

// ── Vérification principale ───────────────────────────────
export async function verifyJWT(token: string, realm?: string): Promise<JWTVerifyResult> {
  if (!token || token.split('.').length !== 3) {
    return { valid: false, reason: 'malformed' };
  }

  const now = Math.floor(Date.now() / 1000);

  // ── CHEMIN 1 : RS256 via JWKS Keycloak (production) ────
  const jwks = getJWKS(realm);
  if (jwks) {
    try {
      const { payload } = await jwtVerify(token, jwks, {
        algorithms: ['RS256'],
      });
      const expiresIn = (payload.exp ?? 0) - now;
      return {
        valid: true,
        payload: payload as IAMJWTPayload,
        expiresIn,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('expired') || msg.includes('"exp"')) {
        return { valid: false, reason: 'expired' };
      }
      // Signature invalide → ne pas tomber sur le fallback HMAC en prod
      if (process.env.NODE_ENV === 'production') {
        return { valid: false, reason: 'invalid_signature' };
      }
      // En dev, on peut tomber sur le fallback si le JWKS n'est pas accessible
    }
  }

  // ── CHEMIN 2 : HS256 HMAC legacy (FastAPI) ──────────────
  // Uniquement si JWKS non disponible (pas de KC_REALM configuré)
  // OU en développement sans accès Keycloak
  const hmacKey = getHMACKey();
  if (hmacKey && !jwks) {
    try {
      const { payload } = await jwtVerify(token, hmacKey, {
        algorithms: ['HS256'],
      });
      const expiresIn = (payload.exp ?? 0) - now;
      return {
        valid: true,
        payload: payload as IAMJWTPayload,
        expiresIn,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('expired') || msg.includes('"exp"')) {
        return { valid: false, reason: 'expired' };
      }
      return { valid: false, reason: 'invalid_signature' };
    }
  }

  // ── CHEMIN 3 : Decode sans vérification (dev uniquement) ─
  if (process.env.NODE_ENV !== 'production') {
    return decodeWithoutVerification(token);
  }

  return { valid: false, reason: 'no_secret' };
}

// ── Décodage sans vérification (dev/fallback uniquement) ──
function decodeWithoutVerification(token: string): JWTVerifyResult {
  try {
    const payload = decodeJwt(token) as IAMJWTPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, reason: 'expired' };
    }

    const expiresIn = payload.exp ? payload.exp - now : 3600;
    return { valid: true, payload, expiresIn };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}

// ── Utilitaires client-side (sans vérification de signature) ─
// Utilisés uniquement pour lire des métadonnées non-sensibles (exp, sub).
// NE PAS utiliser pour des décisions de sécurité.

export function decodeJWTUnsafe(token: string): IAMJWTPayload | null {
  try {
    return decodeJwt(token) as IAMJWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWTUnsafe(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

export function tokenExpiresInMs(token: string): number {
  const payload = decodeJWTUnsafe(token);
  if (!payload?.exp) return 0;
  return Math.max(0, payload.exp * 1000 - Date.now());
}
