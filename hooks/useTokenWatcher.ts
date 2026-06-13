// ============================================================
// hooks/useTokenWatcher.ts
// Watcher permanent de l'état du token — intervalle 1 seconde.
//
// ARCHITECTURE VITE SPA (sans BFF / Route Handlers) :
//  Le refresh s'effectue directement via l'endpoint OIDC Keycloak :
//    POST /realms/{realm}/protocol/openid-connect/token
//    grant_type=refresh_token
//
//  Le refresh_token vit en sessionStorage (compromis SPA sans BFF).
//  Pour une sécurité maximale, déployer un BFF avec cookies HttpOnly.
//
// COMPORTEMENT :
//  - Toutes les 1 seconde, lit `exp` depuis le token en mémoire
//  - Si token proche expiration → refresh via Keycloak
//  - Si Keycloak répond 400/401 (invalid_grant) → session révoquée → logout
//  - Erreur réseau → failsafe (pas de logout)
//  - Expose { expiresInMs, expiresInPct, isExpired, isRefreshing }
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthContext } from '@/lib/auth-store';
import { tokenManager }  from '@/lib/security/token-manager';
import { decodeJWTUnsafe } from '@/lib/security/jwt-verifier';
import { auditLogger }    from '@/lib/security/audit-logger';
import { getCurrentRealm } from '@/lib/realm-resolver';

// ── Constantes ────────────────────────────────────────────
const WATCHER_INTERVAL_MS    = 1_000;
const MIN_REFRESH_COOLDOWN_MS = 10_000;
const REFRESH_THRESHOLD_RATIO = 0.20;
const REFRESH_MIN_AHEAD_MS    = 60_000;

// Clés sessionStorage pour le refresh token (SPA Vite)
const RT_STORAGE_KEY = 'iam_rt_session';
const AT_STORAGE_KEY = 'iam_at_session';

function getStoredRefreshToken(): string | null {
  try { return sessionStorage.getItem(RT_STORAGE_KEY); } catch { return null; }
}
function storeAccessToken(token: string): void {
  try { sessionStorage.setItem(AT_STORAGE_KEY, token); } catch { /* quota */ }
}
function storeRefreshToken(token: string): void {
  try { sessionStorage.setItem(RT_STORAGE_KEY, token); } catch { /* quota */ }
}
function clearStoredTokens(): void {
  try {
    sessionStorage.removeItem(RT_STORAGE_KEY);
    sessionStorage.removeItem(AT_STORAGE_KEY);
  } catch { /* ignore */ }
}

// ── Types exposés ─────────────────────────────────────────
export interface TokenState {
  expiresInMs:  number;
  expiresInPct: number;
  isExpired:    boolean;
  isRefreshing: boolean;
  lastError:    string | null;
}

// ── Hook principal ────────────────────────────────────────
export function useTokenWatcher(): TokenState {
  const { isAuthenticated, logout } = useAuthContext();

  const [state, setState] = useState<TokenState>({
    expiresInMs:  0,
    expiresInPct: 100,
    isExpired:    false,
    isRefreshing: false,
    lastError:    null,
  });

  const isRefreshingRef = useRef(false);
  const lastRefreshRef  = useRef(0);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoggingOutRef = useRef(false);

  const getRefreshAheadMs = useCallback((): number => {
    const token = tokenManager.getAccessToken();
    if (!token) return REFRESH_MIN_AHEAD_MS;
    const payload = decodeJWTUnsafe(token);
    if (!payload?.exp || !payload?.iat) return REFRESH_MIN_AHEAD_MS;
    const totalLifetimeMs = (payload.exp - payload.iat) * 1000;
    return Math.max(totalLifetimeMs * REFRESH_THRESHOLD_RATIO, REFRESH_MIN_AHEAD_MS);
  }, []);

  // ── Logout immédiat (session révoquée confirmée) ──────
  const immediateLogout = useCallback(async (reason: string) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    auditLogger.logForceLogout(reason);
    clearStoredTokens();
    tokenManager.clear();
    await logout(false); // false = pas de révocation Keycloak (déjà révoqué)
  }, [logout]);

  // ── Refresh direct via Keycloak OIDC ─────────────────
  const doRefresh = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    if (isLoggingOutRef.current) return false;

    const now = Date.now();
    if (now - lastRefreshRef.current < MIN_REFRESH_COOLDOWN_MS) return false;

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      // Pas de refresh token → session perdue
      await immediateLogout('no_refresh_token');
      return false;
    }

    isRefreshingRef.current = true;
    setState(s => ({ ...s, isRefreshing: true, lastError: null }));

    try {
      const { oidcBase } = getCurrentRealm();
      const clientId = (import.meta as any).env?.VITE_KEYCLOAK_CLIENT || 'frontend-app';

      const body = new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     clientId,
        refresh_token: refreshToken,
      });

      const res = await fetch(`${oidcBase}/token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
        signal:  AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        // 400 = invalid_grant (RT expiré/révoqué), 401 = non autorisé
        const errData = await res.json().catch(() => ({}));
        const errCode = (errData as any)?.error ?? `HTTP ${res.status}`;
        setState(s => ({ ...s, isRefreshing: false, lastError: errCode }));

        // Révocation confirmée → logout immédiat
        if (res.status === 400 || res.status === 401) {
          await immediateLogout('refresh_token_revoked');
        }
        return false;
      }

      const data = await res.json();
      tokenManager.setAccessToken(data.access_token);
      if (data.session_state) tokenManager.setSessionId(data.session_state);
      storeAccessToken(data.access_token);
      storeRefreshToken(data.refresh_token);

      lastRefreshRef.current = Date.now();
      auditLogger.logTokenRefreshed();
      setState(s => ({ ...s, isRefreshing: false, lastError: null }));
      return true;

    } catch (err) {
      // Erreur réseau → failsafe (ne pas déconnecter)
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      setState(s => ({ ...s, isRefreshing: false, lastError: isTimeout ? 'Timeout' : 'Erreur réseau' }));
      return false;

    } finally {
      isRefreshingRef.current = false;
    }
  }, [immediateLogout]);

  // ── Tick principal — toutes les 1 seconde ────────────
  const tick = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isLoggingOutRef.current) return;

    const token = tokenManager.getAccessToken();
    if (!token) {
      await doRefresh();
      return;
    }

    const payload = decodeJWTUnsafe(token);
    if (!payload?.exp) { await doRefresh(); return; }

    const nowMs        = Date.now();
    const expMs        = payload.exp * 1000;
    const iatMs        = (payload.iat ?? payload.exp - 1800) * 1000;
    const expiresInMs  = Math.max(0, expMs - nowMs);
    const totalLifeMs  = expMs - iatMs;
    const expiresInPct = totalLifeMs > 0 ? Math.round((expiresInMs / totalLifeMs) * 100) : 0;
    const isExpired    = expiresInMs === 0;

    setState(s => ({
      ...s,
      expiresInMs,
      expiresInPct: Math.min(100, Math.max(0, expiresInPct)),
      isExpired,
    }));

    const refreshAheadMs = getRefreshAheadMs();
    if (isExpired || expiresInMs < refreshAheadMs) {
      await doRefresh();
    }
  }, [isAuthenticated, doRefresh, getRefreshAheadMs]);

  // ── Démarrer / arrêter le watcher ────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      isLoggingOutRef.current = false;
      setState({ expiresInMs: 0, expiresInPct: 100, isExpired: false, isRefreshing: false, lastError: null });
      return;
    }

    tick();
    intervalRef.current = setInterval(tick, WATCHER_INTERVAL_MS);
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isAuthenticated, tick]);

  // ── Checks au retour sur l'onglet / focus ────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [isAuthenticated, tick]);

  useEffect(() => {
    if (!isAuthenticated) return;
    window.addEventListener('focus', tick);
    return () => window.removeEventListener('focus', tick);
  }, [isAuthenticated, tick]);

  return state;
}
