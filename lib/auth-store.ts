// ============================================================
// lib/auth-store.ts
// Context React d'authentification — état global en mémoire.
//
// ARCHITECTURE SÉCURISÉE :
//  - Les tokens NE sont JAMAIS dans cet objet côté client.
//  - Les tokens vivent dans tokenManager (mémoire) + cookies HttpOnly.
//  - Ce store contient uniquement : user, permissions, roles, flags.
//  - La lecture/écriture des tokens passe par /api/auth/* (Route Handlers).
//
// tokenStore (legacy) : conservé pour compatibilité mais NE STOCKE PLUS
//   les tokens en localStorage. Il délègue à tokenManager.
// ============================================================


import { createContext, useContext } from 'react';
import { tokenManager, userDataStore } from '@/lib/security/token-manager';
import { clientCookieManager } from '@/lib/security/cookie-manager';
import type { CurrentUser, AuthState } from '@/lib/models/iam/auth.model';

// ── tokenStore (compatibilité descendante) ───────────────
// Les anciens composants qui importent tokenStore continuent de fonctionner.
// Les méthodes de tokens délèguent à tokenManager (en mémoire).
// Les méthodes de user/permissions délèguent à userDataStore (localStorage OK).
export const tokenStore = {
  // ── Tokens → mémoire uniquement (plus de localStorage) ─
  setTokens(accessToken: string, _refreshToken: string, sessionId?: string): void {
    tokenManager.setAccessToken(accessToken);
    if (sessionId) tokenManager.setSessionId(sessionId);
    // refresh_token : géré côté serveur via cookie HttpOnly
    // On NE le stocke PLUS nulle part côté client
  },

  setUser(user: CurrentUser): void {
    userDataStore.setUser(user);
  },

  setPermissionsAndRoles(permissions: string[], roles: string[]): void {
    userDataStore.setPermissionsAndRoles(permissions, roles);
  },

  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },

  // refresh_token : inaccessible côté client (cookie HttpOnly)
  // Retourne null — le refresh passe par /api/auth/refresh
  getRefreshToken(): null {
    return null;
  },

  getSessionId(): string | null {
    return tokenManager.getSessionId();
  },

  getUser(): CurrentUser | null {
    return userDataStore.getUser<CurrentUser>();
  },

  getPermissions(): string[] {
    return userDataStore.getPermissions();
  },

  getRoles(): string[] {
    return userDataStore.getRoles();
  },

  hasValidSession(): boolean {
    return tokenManager.hasValidToken() || clientCookieManager.hasActiveSession();
  },

  /**
   * Nettoyage complet — mémoire + localStorage + cookie miroir.
   * Les cookies HttpOnly sont effacés par POST /api/auth/logout.
   */
  clear(): void {
    tokenManager.clearAll();
    clientCookieManager.clearSessionActiveCookie();
  },
};

// ── Context Auth ──────────────────────────────────────────
export interface AuthContextType extends AuthState {
  login: (
    accessToken: string,
    sessionId: string,
    user: CurrentUser,
    permissions: string[],
    roles: string[]
  ) => void;
  logout: (callApi?: boolean) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  accessToken:    null,
  refreshToken:   null,
  sessionId:      null,
  user:           null,
  isAuthenticated: false,
  isLoading:      true,
  permissions:    [],
  roles:          [],
  login:          () => {},
  logout:         async () => {},
  hasPermission:  () => false,
  hasRole:        () => false,
  refreshUser:    async () => {},
});

export const useAuthContext = () => useContext(AuthContext);
