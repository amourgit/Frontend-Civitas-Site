// ============================================================
// hooks/useIAMAuth.ts
// Hook principal d'authentification — VERSION KEYCLOAK
//
// FLUX D'AUTHENTIFICATION KEYCLOAK :
//  1. POST /realms/{realm}/protocol/openid-connect/token
//     → grant_type=password + username + password
//     → reçoit { access_token, refresh_token, session_state, expires_in }
//
//  2. GET  /realms/{realm}/protocol/openid-connect/userinfo
//     → Authorization: Bearer <access_token>
//     → reçoit profil + rôles (realm_access.roles)
//
//  3. Stockage sécurisé via Route Handler /api/auth/set-tokens (HttpOnly cookies)
//
//  4. SessionMonitor surveille l'expiration et rafraîchit automatiquement
//
// DIFFÉRENCES vs l'ancienne version (FastAPI backend) :
//  ✅ Pas de /tokens/login custom → OIDC standard Keycloak
//  ✅ Pas de /habilitations/moi  → rôles extraits du userinfo
//  ✅ session_id = session_state (UUID Keycloak)
//  ✅ logout = révocation du refresh_token côté Keycloak
//  ✅ changePassword via Admin REST API (PUT /users/{id}/reset-password)
//  ✅ Journal via Admin events API
// ============================================================


import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/lib/auth-store';
import { tokenManager }  from '@/lib/security/token-manager';
import { auditLogger }   from '@/lib/security/audit-logger';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { getCurrentRealm } from '@/lib/realm-resolver';
import {
  authService,
  profilService,
  adminUserService,
  extractErrorMessage,
  type KcSessionRepresentation,
} from '@/services/iam/authService';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// ── Types locaux ───────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface Session {
  id:         string;
  ipAddress:  string;
  start:      number;
  lastAccess: number;
  clients:    Record<string, string>;
}

// ── useIAMAuth ─────────────────────────────────────────────
export function useIAMAuth() {
  const ctx    = useAuthContext();
  const navigate = useNavigate();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError,     setLoginError]     = useState<string | null>(null);

  // Activer le SessionMonitor dès que l'utilisateur est authentifié
  useSessionMonitor();

  // ── LOGIN ────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (credentials: LoginRequest, redirectTo = '/home') => {
      setIsLoginLoading(true);
      setLoginError(null);

      try {
        // ── ÉTAPE 1 : Authentification OIDC Keycloak ─────
        // POST /realms/{realm}/protocol/openid-connect/token
        // Content-Type: application/x-www-form-urlencoded
        // Body: client_id + grant_type=password + username + password
        const tokenResponse = await authService.login(
          credentials.username,
          credentials.password,
        );

        // ── ÉTAPE 2 : Sécurisation des tokens (HttpOnly) ─
        // Les tokens ne touchent JAMAIS localStorage
        const setTokensRes = await fetch('/api/auth/set-tokens', {
          method:      'POST',
          credentials: 'include',
          cache:       'no-store',
          headers:     { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken:      tokenResponse.access_token,
            refreshToken:     tokenResponse.refresh_token,
            // session_state = identifiant de session Keycloak (UUID)
            sessionId:        tokenResponse.session_state,
            // Durée de vie du refresh token (en secondes) depuis Keycloak.
            // Permet de synchroniser le cookie iam_rt_exp pour la surveillance
            // côté client de l'expiration du refresh token (useTokenWatcher).
            refreshExpiresIn: tokenResponse.refresh_expires_in,
          }),
        });

        if (!setTokensRes.ok) {
          throw new Error('Échec de la sécurisation des tokens');
        }

        // ── ÉTAPE 3 : Récupération du profil et des rôles ─
        // GET /realms/{realm}/protocol/openid-connect/userinfo
        // Authorization: Bearer <access_token>
        //
        // Les rôles sont dans userInfo.realm_access.roles
        // et userInfo.resource_access[clientId].roles
        let permCodes:  string[] = [];
        let roleCodes:  string[] = [];
        let userInfo: Awaited<ReturnType<typeof profilService.getMonProfil>> | null = null;

        try {
          tokenManager.setAccessToken(tokenResponse.access_token);
          tokenManager.setSessionId(tokenResponse.session_state);

          userInfo = await profilService.getMonProfil(tokenResponse.access_token);
          const hab = profilService.getMesHabilitations(userInfo);
          roleCodes = hab.roles_actifs;
          permCodes = hab.permissions.map((p) => p.code);
        } catch {
          // Non-bloquant : on continue même si userinfo échoue
        }

        // ── ÉTAPE 4 : Construction de l'objet utilisateur ─
        // Keycloak userinfo → mapping vers notre modèle interne
        const userData = {
          id:                   userInfo?.sub                  ?? '',
          username:             userInfo?.preferred_username   ?? credentials.username,
          nom:                  userInfo?.family_name          ?? '',
          prenom:               userInfo?.given_name           ?? '',
          email:                userInfo?.email                ?? '',
          telephone:            userInfo?.phone_number         ?? '',
          identifiant_national: userInfo?.sub                  ?? '',
          type_profil:          roleCodes.includes('realm-admin') ? 'admin' : 'standard',
          statut:               'actif',
          is_admin:             roleCodes.includes('realm-admin'),
          created_at:           undefined,
          updated_at:           undefined,
        };

        // ── ÉTAPE 5 : Hydratation du contexte React ───────
        ctx.login(
          tokenResponse.access_token,
          tokenResponse.session_state,   // session_id Keycloak
          userData as any,
          permCodes,
          roleCodes,
        );

        // ── ÉTAPE 6 : Redirection ─────────────────────────
        router.prefetch(redirectTo);
        setTimeout(() => navigate(redirectTo), 300);
        return { success: true };

      } catch (error) {
        const msg = extractErrorMessage(error, 'Identifiant ou mot de passe incorrect');
        setLoginError(msg);
        tokenManager.clear();
        return { success: false, error: msg };
      } finally {
        setIsLoginLoading(false);
      }
    },
    [ctx, router],
  );

  // ── LOGOUT ───────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      // Révoquer la session côté Keycloak via le Route Handler /api/auth/logout
      // Ce RH lit le refresh_token depuis le cookie HttpOnly et appelle
      // POST /realms/{realm}/protocol/openid-connect/logout
      await fetch('/api/auth/logout', {
        method:      'POST',
        credentials: 'include',
        cache:       'no-store',
      }).catch(() => { /* non-bloquant */ });
    } catch { /* non-bloquant */ }

    // Déléguer le logout au contexte (nettoyage mémoire + cookies)
    ctx.logout();
  }, [ctx]);

  return {
    // État
    user:            ctx.user,
    isAuthenticated: ctx.isAuthenticated,
    isLoading:       ctx.isLoading,
    isLoginLoading,
    loginError,
    permissions:     ctx.permissions,
    roles:           ctx.roles,
    sessionId:       ctx.sessionId,

    // Actions
    login:           handleLogin,
    logout:          handleLogout,
    clearLoginError: () => setLoginError(null),

    // Utilitaires
    hasPermission: ctx.hasPermission,
    hasRole:       ctx.hasRole,
    refreshUser:   ctx.refreshUser,
  };
}

// ── useIAMSessions ─────────────────────────────────────────
//
// Keycloak ne fournit pas d'endpoint "mes sessions" accessible avec
// le token de l'utilisateur courant. Il faut passer par l'Admin API :
//   GET /admin/realms/{realm}/users/{userId}/sessions
//
// ⚠️  Cela requiert un token admin.
//     Solution recommandée : créer un Route Handler côté serveur
//     /api/auth/sessions → qui appelle l'Admin API avec un service account.
//
export function useIAMSessions() {
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const { sessionId: currentSessionId } = useAuthContext();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Appel via notre Route Handler (qui a accès au token admin service account)
      // Le Route Handler appelle : GET /admin/realms/{realm}/users/{userId}/sessions
      const res = await fetch('/api/auth/sessions', {
        credentials: 'include',
        cache:       'no-store',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const kcSessions: KcSessionRepresentation[] = await res.json();

      // Mapping Keycloak → notre modèle Session
      setSessions(
        kcSessions.map((s) => ({
          id:         s.id,
          ipAddress:  s.ipAddress,
          start:      s.start,
          lastAccess: s.lastAccess,
          clients:    s.clients,
        })),
      );
    } catch (err) {
      setError(extractErrorMessage(err, 'Erreur lors du chargement des sessions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      // DELETE /admin/realms/{realm}/sessions/{sessionId}  (via Route Handler)
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method:      'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      return { success: true };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Erreur lors de la révocation');
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    currentSessionId,
    fetchSessions,
    revokeSession,
  };
}

// ── useChangePassword ───────────────────────────────────────
//
// Keycloak ne fournit PAS d'endpoint "change-password" pour l'utilisateur
// courant via OIDC. Deux approches possibles :
//
//   A) Admin API : PUT /admin/realms/{realm}/users/{userId}/reset-password
//      → Body: { type: "password", value, temporary: false }
//      → Requiert un token admin (service account côté serveur)
//
//   B) Account REST API : POST /realms/{realm}/account/credentials/password
//      → Body: { currentPassword, newPassword, confirmation }
//      → Fonctionne avec le token de l'utilisateur courant ✅
//      → Nécessite que le client ait le scope "account" activé
//
// On utilise l'approche B (Account API) ici.
//
export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) throw new Error('Non authentifié');

      const KC_URL   = process.env.NEXT_PUBLIC_KEYCLOAK_URL!;
      const KC_REALM = getCurrentRealm().realm;

      // POST /realms/{realm}/account/credentials/password
      // Authorization: Bearer <access_token>
      // Body: { currentPassword, newPassword, confirmation }
      const res = await fetch(
        `${KC_URL}/realms/${KC_REALM}/account/credentials/password`,
        {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            currentPassword: oldPassword,
            newPassword,
            confirmation:    newPassword,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as any)?.errorMessage ?? (err as any)?.error ?? `HTTP ${res.status}`
        );
      }

      setSuccess(true);
      return { success: true };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Erreur lors du changement de mot de passe');
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    success,
    changePassword,
    reset: () => { setError(null); setSuccess(false); },
  };
}

// ── useJournal ─────────────────────────────────────────────
//
// Keycloak expose les événements utilisateur via l'Admin REST API :
//   GET /admin/realms/{realm}/events?user={userId}&type=LOGIN&type=LOGOUT
//
// ⚠️  Cette API est admin-only. Il faut un Route Handler côté serveur
//     /api/auth/journal → qui appelle l'Admin API avec un service account.
//
export function useJournal(limit = 10) {
  const [entries,   setEntries]   = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchJournal = useCallback(async (skip = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      // Route Handler côté serveur (service account → Admin API events)
      const res = await fetch(
        `/api/auth/journal?first=${skip}&max=${limit}`,
        { credentials: 'include', cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Record<string, unknown>[] = await res.json();
      setEntries(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Erreur lors du chargement du journal'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchJournal(); }, [fetchJournal]);

  return { entries, isLoading, error, refetch: fetchJournal };
}

// ── useAdminResetPassword ───────────────────────────────────
//
// Réinitialisation du MDP par un admin :
//   PUT /admin/realms/{realm}/users/{userId}/reset-password
//   Body: { type: "password", value, temporary: true }
//
export function useAdminResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const resetPassword = useCallback(async (
    userId:      string,
    newPassword: string,
    temporary  = true,
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Via Route Handler admin (service account)
      // PUT /admin/realms/{realm}/users/{userId}/reset-password
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method:      'PUT',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, temporary }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.errorMessage ?? `HTTP ${res.status}`);
      }

      setSuccess(true);
      return { success: true };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Erreur lors de la réinitialisation');
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    success,
    resetPassword,
    reset: () => { setError(null); setSuccess(false); },
  };
}