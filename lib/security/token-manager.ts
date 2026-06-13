// ============================================================
// lib/security/token-manager.ts
// Gestionnaire de tokens en mémoire — remplace localStorage.
//
// Principes de sécurité :
//  1. Les tokens NE sont JAMAIS persistés en localStorage.
//  2. Ils vivent UNIQUEMENT en mémoire JavaScript (module-level singleton).
//  3. Le refresh_token vit dans un cookie HttpOnly (jamais JS-accessible).
//  4. En cas de rechargement de page → re-hydratation via /api/auth/session.
//  5. Le module-level singleton survit aux re-renders React mais pas aux
//     rechargements de page → c'est voulu (sécurité > confort).
//
// Flux de rechargement de page :
//   Page load → AuthProvider monte → appel GET /api/auth/session
//   → Route Handler lit les cookies HttpOnly → retourne { user, permissions }
//   → tokenManager.setAccessToken(token_opaque_fourni_par_le_serveur)
//   → état React hydraté → app fonctionnelle
// ============================================================

import { decodeJWTUnsafe, isTokenExpired, tokenExpiresInMs } from './jwt-verifier';
import type { IAMJWTPayload } from './jwt-verifier';

// ── Singleton en mémoire ──────────────────────────────────
// Ces variables survivent aux re-renders mais pas aux rechargements.
let _accessToken: string | null = null;
let _sessionId: string | null = null;

// ── TokenManager ─────────────────────────────────────────
export const tokenManager = {
  // ── Setters ────────────────────────────────────────────
  setAccessToken(token: string): void {
    _accessToken = token;
  },

  setSessionId(id: string): void {
    _sessionId = id;
  },

  // ── Getters ────────────────────────────────────────────
  getAccessToken(): string | null {
    return _accessToken;
  },

  getSessionId(): string | null {
    return _sessionId;
  },

  // ── Validation ─────────────────────────────────────────
  hasValidToken(): boolean {
    if (!_accessToken) return false;
    return !isTokenExpired(_accessToken);
  },

  getTokenPayload(): IAMJWTPayload | null {
    if (!_accessToken) return null;
    return decodeJWTUnsafe(_accessToken);
  },

  /**
   * Millisecondes avant expiration du token en mémoire.
   * Retourne 0 si pas de token ou expiré.
   */
  expiresInMs(): number {
    if (!_accessToken) return 0;
    return tokenExpiresInMs(_accessToken);
  },

  /**
   * Pourcentage de vie restante du token (0-100).
   * Utile pour afficher une barre de progression de session.
   */
  lifePercent(totalLifeSec = 3600): number {
    const remainingMs = this.expiresInMs();
    if (remainingMs <= 0) return 0;
    return Math.min(100, Math.round((remainingMs / (totalLifeSec * 1000)) * 100));
  },

  // ── Nettoyage ──────────────────────────────────────────
  /**
   * Efface les tokens de la mémoire.
   * Les cookies HttpOnly sont effacés par le Route Handler /api/auth/logout.
   */
  clear(): void {
    _accessToken = null;
    _sessionId = null;
  },

  /**
   * Nettoyage complet : mémoire + données utilisateur localStorage.
   * Appelé au logout.
   */
  clearAll(): void {
    this.clear();
    if (typeof window === 'undefined') return;
    // Supprimer uniquement les clés IAM (pas le thème, etc.)
    const IAM_KEYS = ['iam_user', 'iam_permissions', 'iam_roles',
                      // Nettoyage des anciennes clés legacy
                      'iam_access_token', 'iam_refresh_token', 'iam_session_id'];
    IAM_KEYS.forEach((k) => localStorage.removeItem(k));
    try { sessionStorage.clear(); } catch { /* ignore */ }
  },
} as const;

// ── UserDataStore — localStorage acceptable pour user/permissions ─
// Les permissions et données utilisateur ne sont pas des secrets.
// Elles sont vérifiées côté serveur à chaque requête API.
// Les stocker en localStorage permet de restaurer l'UI sans appel réseau.
const USER_KEYS = {
  USER:        'iam_user',
  PERMISSIONS: 'iam_permissions',
  ROLES:       'iam_roles',
} as const;

export const userDataStore = {
  setUser(user: object): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(USER_KEYS.USER, JSON.stringify(user)); } catch { /* quota */ }
  },

  setPermissionsAndRoles(permissions: string[], roles: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USER_KEYS.PERMISSIONS, JSON.stringify(permissions));
      localStorage.setItem(USER_KEYS.ROLES, JSON.stringify(roles));
    } catch { /* quota */ }
  },

  getUser<T = unknown>(): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  getPermissions(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(USER_KEYS.PERMISSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  getRoles(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(USER_KEYS.ROLES);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    Object.values(USER_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
