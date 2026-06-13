// ============================================================
// lib/security/audit-logger.ts
// Journal d'audit côté client.
//
// Rôle :
//  - Enregistrer les événements de session (expiration, révocation)
//  - Enregistrer les changements de permissions détectés
//  - Enregistrer les déconnexions (timeout, 401, révocation, manuel)
//
// Chaque entrée est envoyée au backend via POST /audit/frontend
// de façon asynchrone et non-bloquante (fire-and-forget).
// Si le backend est indisponible → entrée bufférisée en mémoire.
// ============================================================

// ── Types ─────────────────────────────────────────────────
export type AuditEventType =
  | 'session_expired'       // Token expiré
  | 'session_revoked'       // Session révoquée côté serveur
  | 'inactivity_timeout'    // Déconnexion par inactivité
  | 'token_refreshed'       // Token rafraîchi automatiquement
  | 'permission_mismatch'   // Permissions client ≠ serveur
  | 'logout_manual'         // Déconnexion volontaire
  | 'logout_forced';        // Déconnexion forcée (401 non récupérable)

export interface AuditEntry {
  event:       AuditEventType;
  timestamp:   string;          // ISO 8601
  route?:      string;
  user_id?:    string;
  session_id?: string;
  details?:    Record<string, unknown>;
  user_agent?: string;
}

// ── Buffer en mémoire (si le backend est down) ────────────
const MAX_BUFFER = 50;
let _buffer: AuditEntry[] = [];

// ── AuditLogger ───────────────────────────────────────────
export const auditLogger = {
  log(
    event: AuditEventType,
    options: Omit<AuditEntry, 'event' | 'timestamp' | 'user_agent'> = {}
  ): void {
    const entry: AuditEntry = {
      event,
      timestamp:  new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...options,
    };

    _buffer.push(entry);
    if (_buffer.length > MAX_BUFFER) _buffer.shift();
    this._send(entry);
  },

  _send(entry: AuditEntry): void {
    if (typeof window === 'undefined') return;

    const base = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8000';
    const url  = `${base}/api/v1/audit/frontend`;
    const body = JSON.stringify(entry);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    fetch(url, {
      method:    'POST',
      body,
      headers:   { 'Content-Type': 'application/json' },
      keepalive: true,
      cache:     'no-store',
    }).catch(() => {});
  },

  getBuffer(): Readonly<AuditEntry[]> { return _buffer; },
  clearBuffer(): void { _buffer = []; },

  // ── Helpers sémantiques ───────────────────────────────

  logInactivityTimeout(route: string, userId?: string, sessionId?: string): void {
    this.log('inactivity_timeout', { route, user_id: userId, session_id: sessionId });
  },

  logSessionRevoked(userId?: string, sessionId?: string): void {
    this.log('session_revoked', { user_id: userId, session_id: sessionId });
  },

  logTokenRefreshed(userId?: string): void {
    this.log('token_refreshed', { user_id: userId });
  },

  logForceLogout(reason: string, userId?: string, sessionId?: string): void {
    this.log('logout_forced', { user_id: userId, session_id: sessionId, details: { reason } });
  },

  logManualLogout(userId?: string, sessionId?: string): void {
    this.log('logout_manual', { user_id: userId, session_id: sessionId });
  },
};
