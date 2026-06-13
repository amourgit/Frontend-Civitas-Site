// ============================================================
// hooks/useSessionMonitor.ts
// Monitor de SESSION — Vérification directe côté Keycloak.
//
// ARCHITECTURE VITE SPA (sans BFF / Route Handlers) :
//  Ce hook vérifie la validité de la session Keycloak en
//  utilisant l'endpoint userinfo OIDC standard :
//    GET /realms/{realm}/protocol/openid-connect/userinfo
//    Authorization: Bearer <access_token>
//
//  Si Keycloak répond 401 → token invalide/révoqué → logout.
//  Si réseau down (5xx, timeout) → on conserve la session (failsafe).
//
// SÉPARATION DES RESPONSABILITÉS :
//  - useTokenWatcher   → refresh proactif (exp lu depuis le JWT)
//  - useSessionMonitor → vérification révocation Keycloak (polling)
//
// GRACE PERIOD post-login :
//  8s sans vérification réseau après le login pour éviter la race
//  condition avec la propagation de session Keycloak.
//
// FAILSAFE :
//  Erreur réseau (5xx, timeout, CORS) → on ne déconnecte PAS.
//  Seul un 401/403 confirme une révocation réelle.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '@/lib/auth-store';
import { tokenManager }  from '@/lib/security/token-manager';
import { auditLogger }   from '@/lib/security/audit-logger';
import { getCurrentRealm } from '@/lib/realm-resolver';
import {
  SESSION_MONITOR,
  INACTIVITY,
} from '@/lib/security/constants';

// Grace period post-login (session Keycloak pas encore propagée)
const LOGIN_GRACE_PERIOD_MS = 8_000;

// ── useSessionMonitor ─────────────────────────────────────────
export function useSessionMonitor() {
  const { isAuthenticated, logout, user, sessionId } = useAuthContext();

  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCheckingRef    = useRef(false);
  const lastCheckRef     = useRef<number>(0);
  const authStartTimeRef = useRef<number>(0);

  // Polling toutes les 60s
  const pollIntervalMs = SESSION_MONITOR.POLL_STANDARD_MS;

  // Enregistrer le moment où l'auth devient true
  useEffect(() => {
    if (isAuthenticated && authStartTimeRef.current === 0) {
      authStartTimeRef.current = Date.now();
    }
    if (!isAuthenticated) {
      authStartTimeRef.current = 0;
    }
  }, [isAuthenticated]);

  // ── Vérification de session via Keycloak userinfo ─────────
  //
  // Appelle directement l'endpoint userinfo OIDC de Keycloak.
  // Cela vérifie :
  //   1. Que l'access token est valide (non expiré)
  //   2. Que la session Keycloak existe toujours (non révoquée)
  //   3. Que le compte utilisateur est actif
  //
  // Retourne 401 si :
  //   - Token expiré ou révoqué
  //   - Session terminée côté Keycloak (déconnexion admin, autre device)
  //   - Compte désactivé
  const checkSession = useCallback(async () => {
    if (isCheckingRef.current) return;
    if (!isAuthenticated)      return;

    // Grace period post-login
    const timeSinceAuth = Date.now() - authStartTimeRef.current;
    if (timeSinceAuth < LOGIN_GRACE_PERIOD_MS) return;

    // Anti-flood : min 4s entre deux vérifications
    const now = Date.now();
    if (now - lastCheckRef.current < 4_000) return;
    lastCheckRef.current  = now;
    isCheckingRef.current = true;

    try {
      const accessToken = tokenManager.getAccessToken();

      // Pas de token en mémoire mais isAuthenticated = true → incohérence → logout
      if (!accessToken) {
        auditLogger.logSessionRevoked(user?.id, sessionId || undefined);
        await logout(false);
        return;
      }

      // Appel direct Keycloak userinfo — vérification de révocation réelle
      const { oidcBase } = getCurrentRealm();
      const res = await fetch(`${oidcBase}/userinfo`, {
        method:  'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-store',
        },
        signal: AbortSignal.timeout(10_000),
      });

      if (res.status === 401 || res.status === 403) {
        // Session révoquée côté Keycloak
        auditLogger.logSessionRevoked(user?.id, sessionId || undefined);
        tokenManager.clear();
        await logout(false);
        return;
      }

      // 5xx ou erreur non-auth → failsafe, on garde la session
      if (!res.ok) {
        console.warn('[SessionMonitor] Keycloak userinfo error:', res.status);
        return;
      }

      // 200 OK → session valide

    } catch (err) {
      // AbortError (timeout) ou erreur réseau → failsafe, session conservée
      if (err instanceof Error && err.name !== 'AbortError') {
        // Erreur réseau silencieuse — normale en cas de perte de connexion
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAuthenticated, logout, user?.id, sessionId]);

  // ── Polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    // Premier check après la grace period
    const initialDelay = setTimeout(() => {
      checkSession();
      intervalRef.current = setInterval(checkSession, pollIntervalMs);
    }, LOGIN_GRACE_PERIOD_MS);

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isAuthenticated, checkSession, pollIntervalMs]);

  // ── Vérification au retour sur l'onglet ──────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = () => {
      if (document.visibilityState === 'visible') {
        lastCheckRef.current = 0; // Force vérification immédiate
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [isAuthenticated, checkSession]);

  // ── Vérification au focus fenêtre ────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = () => {
      lastCheckRef.current = 0; // Force vérification immédiate
      checkSession();
    };
    window.addEventListener('focus', handle);
    return () => window.removeEventListener('focus', handle);
  }, [isAuthenticated, checkSession]);
}

// ── useInactivityGuard ────────────────────────────────────────
export function useInactivityGuard(onWarning?: (secondsLeft: number) => void) {
  const { isAuthenticated, logout, user, sessionId } = useAuthContext();

  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timerRef.current)   clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    timerRef.current   = null;
    warningRef.current = null;
  }, []);

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;
    clearTimers();
    lastActivityRef.current = Date.now();

    const warnDelay = INACTIVITY.TIMEOUT_MS - INACTIVITY.WARNING_BEFORE_MS;
    warningRef.current = setTimeout(() => {
      onWarning?.(Math.round(INACTIVITY.WARNING_BEFORE_MS / 1000));
    }, warnDelay);

    timerRef.current = setTimeout(async () => {
      auditLogger.logInactivityTimeout(
        window.location.pathname,
        user?.id,
        sessionId || undefined
      );
      tokenManager.clear();
      await logout(true);
    }, INACTIVITY.TIMEOUT_MS);
  }, [isAuthenticated, clearTimers, logout, onWarning, user?.id, sessionId]);

  useEffect(() => {
    if (!isAuthenticated) { clearTimers(); return; }
    resetTimers();

    let lastReset = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset < 1_000) return;
      lastReset = now;
      resetTimers();
    };

    INACTIVITY.RESET_EVENTS.forEach(evt =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    return () => {
      clearTimers();
      INACTIVITY.RESET_EVENTS.forEach(evt =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [isAuthenticated, resetTimers, clearTimers]);

  return {
    getInactiveMs: () => Date.now() - lastActivityRef.current,
    resetActivity: resetTimers,
  };
}
