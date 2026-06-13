// ============================================================
// lib/security/cookie-manager.ts
// Gestion des cookies d'authentification.
//
// CHANGEMENT CRITIQUE — SameSite=Lax (était Strict) :
//  SameSite=Strict bloquait les cookies sur les fetch() internes
//  Next.js App Router juste après une navigation navigate().
//  Cela provoquait une race condition : le SessionMonitor appelait
//  /api/auth/session avant que les cookies soient propagés →
//  authenticated:false → logout immédiat.
//
//  SameSite=Lax est le standard recommandé pour les SPA avec
//  authentification par cookie HttpOnly. Il protège contre le CSRF
//  sur les requêtes non-GET cross-site tout en permettant les
//  fetch() same-origin qui suivent une navigation.
//
// Architecture :
//  - access_token + refresh_token → cookies HttpOnly Lax (jamais JS-lisibles)
//  - iam_rt_exp → cookie JS-lisible (non HttpOnly) contenant l'expiry Unix
//    du refresh token, pour surveillance côté client (useTokenWatcher).
//  - session_active → cookie JS-lisible léger pour le middleware Edge
// ============================================================

import { COOKIE_NAMES, TOKEN_TTL } from './constants';

export interface TokenSet {
  accessToken:       string;
  refreshToken:      string;
  sessionId:         string;
  /** Secondes avant expiration du refresh token (depuis Keycloak).
   *  0 = token offline (pas d'expiration).
   *  undefined = utilise TOKEN_TTL.REFRESH_TOKEN_SECONDS par défaut. */
  refreshExpiresIn?: number;
}

// ── Attributs des cookies ─────────────────────────────────
function cookieAttributes(maxAge: number, httpOnly: boolean): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `path=/`,
    `max-age=${maxAge}`,
    `SameSite=Lax`,           // Lax (pas Strict) — voir commentaire en-tête
    httpOnly ? 'HttpOnly' : '',
    isProduction ? 'Secure' : '',
  ];
  return parts.filter(Boolean).join('; ');
}

export const cookieManager = {
  buildSetHeaders(tokens: TokenSet): Record<string, string[]> {
    // Durée effective du refresh token
    const rtTtlSeconds = (tokens.refreshExpiresIn !== undefined && tokens.refreshExpiresIn > 0)
      ? tokens.refreshExpiresIn
      : TOKEN_TTL.REFRESH_TOKEN_SECONDS;

    // Timestamp Unix (secondes) d'expiration du refresh token
    // Stocké dans un cookie JS-lisible pour surveillance côté client
    const rtExpAt = Math.floor(Date.now() / 1000) + rtTtlSeconds;

    return {
      'Set-Cookie': [
        `${COOKIE_NAMES.ACCESS_TOKEN}=${tokens.accessToken}; ${cookieAttributes(TOKEN_TTL.ACCESS_TOKEN_SECONDS, true)}`,
        `${COOKIE_NAMES.REFRESH_TOKEN}=${tokens.refreshToken}; ${cookieAttributes(rtTtlSeconds, true)}`,
        `${COOKIE_NAMES.SESSION_ID}=${tokens.sessionId}; ${cookieAttributes(rtTtlSeconds, true)}`,
        `${COOKIE_NAMES.SESSION_ACTIVE}=1; ${cookieAttributes(TOKEN_TTL.SESSION_ACTIVE_SECONDS, false)}`,
        // Cookie JS-lisible : expiry Unix du refresh token (non HttpOnly !)
        `${COOKIE_NAMES.REFRESH_TOKEN_EXP}=${rtExpAt}; ${cookieAttributes(rtTtlSeconds, false)}`,
      ],
    };
  },

  buildClearHeaders(): Record<string, string[]> {
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/; SameSite=Lax';
    return {
      'Set-Cookie': [
        `${COOKIE_NAMES.ACCESS_TOKEN}=; ${expired}; HttpOnly`,
        `${COOKIE_NAMES.REFRESH_TOKEN}=; ${expired}; HttpOnly`,
        `${COOKIE_NAMES.SESSION_ID}=; ${expired}; HttpOnly`,
        `${COOKIE_NAMES.SESSION_ACTIVE}=; ${expired}`,
        `${COOKIE_NAMES.REFRESH_TOKEN_EXP}=; ${expired}`,
      ],
    };
  },

  getAccessTokenFromRequest(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAMES.ACCESS_TOKEN}=([^;]+)`));
    return match?.[1] ?? null;
  },

  getRefreshTokenFromRequest(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAMES.REFRESH_TOKEN}=([^;]+)`));
    return match?.[1] ?? null;
  },

  getSessionIdFromRequest(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAMES.SESSION_ID}=([^;]+)`));
    return match?.[1] ?? null;
  },

  hasActiveSession(cookieHeader: string | null): boolean {
    if (!cookieHeader) return false;
    return cookieHeader.includes(`${COOKIE_NAMES.SESSION_ACTIVE}=1`);
  },
};

export const clientCookieManager = {
  clearSessionActiveCookie(): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${COOKIE_NAMES.SESSION_ACTIVE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  },

  hasActiveSession(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes(`${COOKIE_NAMES.SESSION_ACTIVE}=1`);
  },
};
