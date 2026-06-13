// ============================================================
// lib/http-client.ts
// Client HTTP sécurisé — tokens via mémoire + Route Handlers.
//
// CHANGEMENTS vs ancienne version :
//  - getAccessToken() lit tokenManager (mémoire), plus localStorage
//  - Refresh 401 → POST /api/auth/refresh (Route Handler)
//    qui lit le cookie HttpOnly et retourne le nouveau token
//  - Le nouveau token est stocké en mémoire via tokenManager
//  - Jamais de contact direct avec localStorage pour les tokens
// ============================================================

import { tokenManager } from '@/lib/security/token-manager';
import { auditLogger } from '@/lib/security/audit-logger';
import { getCurrentRealm, resolveRealm } from '@/lib/realm-resolver';

const BACKEND_BASE = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8000';
const API_V1       = `${BACKEND_BASE}/api/v1`;

// ── Realm dynamique ───────────────────────────────────────
// Expose le realm courant pour les services qui en ont besoin
// sans recalcul à chaque requête (cache module-level).
export function getActiveRealm(): string {
  if (typeof window !== 'undefined') {
    return getCurrentRealm().realm;
  }
  // SSR fallback
  return resolveRealm().realm;
}

export function getActiveAdminBase(): string {
  const { adminBase } = typeof window !== 'undefined'
    ? getCurrentRealm()
    : resolveRealm();
  return adminBase;
}

export function getActiveOidcBase(): string {
  const { oidcBase } = typeof window !== 'undefined'
    ? getCurrentRealm()
    : resolveRealm();
  return oidcBase;
}

interface PendingRequest {
  resolve: (token: string) => void;
  reject:  (error: Error)  => void;
}

// ── Helper : extraction du message d'erreur Keycloak ─────────
// Keycloak peut retourner plusieurs formats selon la version et l'endpoint :
//   { errorMessage: "..." }                   → Admin API standard
//   { error: "...", error_description: "..." } → OAuth2 / Token endpoint
//   { detail: "..." }                          → Proxy FastAPI
//   { detail: [ { msg: "..." } ] }             → Pydantic validation
//   "plain text"                               → certains endpoints Keycloak < 26
async function parseKeycloakError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  if (!text) return `${res.status} ${res.statusText}`;
  try {
    const json = JSON.parse(text);
    return (
      json.errorMessage          // Keycloak Admin API
      ?? json.error_description  // OAuth2
      ?? (json.error && json.error !== 'unknown_error' ? json.error : undefined)
      ?? (typeof json.detail === 'string' ? json.detail : undefined)
      ?? (Array.isArray(json.detail) ? json.detail[0]?.msg : undefined)
      ?? `${res.status} ${res.statusText}`
    );
  } catch {
    // Réponse texte brute (ex: "Client not found")
    return text.length < 200 ? text : `${res.status} ${res.statusText}`;
  }
}

class HttpClient {
  private isRefreshing   = false;
  private pendingQueue:  PendingRequest[] = [];
  private onLogout?:     () => void;

  setLogoutCallback(callback: () => void) {
    this.onLogout = callback;
  }

  private resolveQueue(newToken: string) {
    this.pendingQueue.forEach((p) => p.resolve(newToken));
    this.pendingQueue = [];
  }

  private rejectQueue(error: Error) {
    this.pendingQueue.forEach((p) => p.reject(error));
    this.pendingQueue = [];
  }

  private waitForRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pendingQueue.push({ resolve, reject });
    });
  }

  /**
   * Rafraîchit le token via le Route Handler /api/auth/refresh.
   * Le Route Handler lit le cookie HttpOnly refresh_token,
   * appelle le backend, met à jour les cookies et retourne
   * le nouveau access_token en body JSON.
   */
  private async refreshTokens(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
      method:      'POST',
      credentials: 'same-origin', // envoie les cookies HttpOnly
      headers:     { 'Content-Type': 'application/json' },
      cache:       'no-store',
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    // Le Route Handler /api/auth/refresh retourne { accessToken, sessionId } en camelCase
    const newAccessToken: string = data.accessToken ?? data.access_token;

    if (!newAccessToken) throw new Error('No access token in refresh response');

    // Stocker en mémoire (jamais localStorage)
    tokenManager.setAccessToken(newAccessToken);
    auditLogger.logTokenRefreshed(tokenManager.getTokenPayload()?.sub);

    return newAccessToken;
  }

  /**
   * Requête HTTP avec injection Bearer + retry 401 automatique.
   */
  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = tokenManager.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept:         'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = endpoint.startsWith('http') ? endpoint : `${API_V1}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin',
      cache:       'no-store',
    });

    // ── Cas 401 : token expiré ou révoqué ─────────────────
    if (response.status === 401) {
      if (this.isRefreshing) {
        try {
          const newToken = await this.waitForRefresh();
          return this.fetch(endpoint, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
          });
        } catch {
          this.onLogout?.();
          throw new Error('Session expirée');
        }
      }

      this.isRefreshing = true;
      try {
        const newToken = await this.refreshTokens();
        this.isRefreshing = false;
        this.resolveQueue(newToken);

        return this.fetch(endpoint, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
      } catch (error) {
        this.isRefreshing = false;
        this.rejectQueue(error as Error);
        tokenManager.clear();
        auditLogger.logForceLogout(
          'refresh_failed',
          tokenManager.getTokenPayload()?.sub
        );
        this.onLogout?.();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    }

    return response;
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      if (qs) url += `?${qs}`;
    }
    const res = await this.fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(await parseKeycloakError(res));
    return res.json() as Promise<T>;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await this.fetch(endpoint, {
      method: 'POST',
      body:   JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseKeycloakError(res));
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await this.fetch(endpoint, { method: 'DELETE' });
    if (!res.ok) throw new Error(await parseKeycloakError(res));
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  /**
   * DELETE avec body JSON — requis par certains endpoints Keycloak
   * (ex: scope-mappings/realm, scope-mappings/clients/{id})
   */
  async deleteWithBody<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await this.fetch(endpoint, {
      method: 'DELETE',
      body:   JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseKeycloakError(res));
    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await this.fetch(endpoint, {
      method: 'PUT',
      body:   JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseKeycloakError(res));
    // Keycloak retourne 204 No Content pour les PUT réussis
    if (res.status === 204 || res.headers.get('content-length') === '0') return {} as T;
    return res.json() as Promise<T>;
  }
}

export const httpClient = new HttpClient();
