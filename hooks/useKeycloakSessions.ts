// ============================================================
// hooks/useKeycloakSessions.ts  — v2
// Hook React — Gestion complète des Sessions Keycloak
// ✅ Fix : sessions offline via /clients/{uuid}/offline-sessions
// ✅ Ajout : useClientSessions (sessions réelles par client uuid)
// ✅ Ajout : useSessionsDashboard (métriques globales)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { keycloakRealmsService }   from '@/services/iam/keycloakRealmsService';
import { keycloakUsersService }    from '@/services/iam/keycloakUsersService';
import { keycloakClientsService }  from '@/services/iam/keycloakClientsService';
import { getCurrentRealm } from '@/lib/realm-resolver';
import type {
  SessionEntry, ClientSessionStat, RevocationPolicy,
} from '@/components/pages/module/sessions/ui/types';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

function toSessionEntry(raw: any, type: 'active' | 'offline'): SessionEntry {
  return {
    id:         raw.id          ?? '',
    username:   raw.username    ?? '?',
    userId:     raw.userId      ?? '',
    ipAddress:  raw.ipAddress   ?? '?',
    start:      typeof raw.start      === 'number' ? raw.start      : 0,
    lastAccess: typeof raw.lastAccess === 'number' ? raw.lastAccess : 0,
    rememberMe: raw.rememberMe  ?? false,
    clients:    raw.clients     ?? {},
    type,
  };
}

async function batchSettled<T, R>(
  items: T[], fn: (item: T) => Promise<R>, batchSize = 20,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(chunk.map(fn));
    settled.forEach(r => { if (r.status === 'fulfilled') results.push(r.value); });
  }
  return results;
}

export function useActiveSessions(params?: { first?: number; max?: number }) {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const clients = await keycloakClientsService.list({}, getRealm());
      const allSessionsArr = await batchSettled(
        clients,
        c => keycloakClientsService.listUserSessions(c.id ?? '', { max: params?.max ?? 500 }, getRealm()),
        10
      );
      const seen = new Set<string>();
      const deduped: SessionEntry[] = [];
      allSessionsArr.flat().forEach(s => {
        const entry = toSessionEntry(s, 'active');
        if (!seen.has(entry.id)) { seen.add(entry.id); deduped.push(entry); }
      });
      setSessions(deduped);
    } catch (e) {
      try {
        const users = await keycloakUsersService.list({ max: params?.max ?? 500 }, getRealm());
        const rawSessions = await batchSettled(users, u => keycloakUsersService.listSessions(u.id ?? '', getRealm()));
        const seen = new Set<string>();
        const deduped: SessionEntry[] = [];
        rawSessions.flat().forEach(s => {
          const entry = toSessionEntry(s, 'active');
          if (!seen.has(entry.id)) { seen.add(entry.id); deduped.push(entry); }
        });
        setSessions(deduped);
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : 'Erreur chargement sessions actives');
      }
    } finally { setLoading(false); }
  }, [params?.max]);

  useEffect(() => { load(); }, [load]);

  const revokeSession = useCallback(async (sessionId: string) => {
    await keycloakRealmsService.deleteSession(sessionId, { isOffline: false }, getRealm());
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  const revokeAll = useCallback(async () => {
    await keycloakRealmsService.logoutAll(getRealm());
    setSessions([]);
  }, []);

  return { sessions, setSessions, loading, error, reload: load, revokeSession, revokeAll };
}

// ✅ FIX MAJEUR : listOfflineSessions attend (userId, clientUuid, realm)
// On passe par /clients/{uuid}/offline-sessions à la place
export function useOfflineSessions(params?: { first?: number; max?: number }) {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const clients = await keycloakClientsService.list({}, getRealm());
      const allSessionsArr = await batchSettled(
        clients,
        c => keycloakClientsService.listOfflineSessions(c.id ?? '', { max: params?.max ?? 500 }, getRealm()),
        10
      );
      const seen = new Set<string>();
      const deduped: SessionEntry[] = [];
      allSessionsArr.flat().forEach(s => {
        const entry = toSessionEntry(s, 'offline');
        if (!seen.has(entry.id)) { seen.add(entry.id); deduped.push(entry); }
      });
      setSessions(deduped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement sessions offline');
    } finally { setLoading(false); }
  }, [params?.max]);

  useEffect(() => { load(); }, [load]);

  const revokeSession = useCallback(async (sessionId: string) => {
    await keycloakRealmsService.deleteSession(sessionId, { isOffline: true }, getRealm());
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  return { sessions, setSessions, loading, error, reload: load, revokeSession };
}

export function useClientSessionStats() {
  const [stats,   setStats]   = useState<ClientSessionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakRealmsService.getClientSessionStats(getRealm());
      setStats((data as any[]).map(d => ({
        id:       d.id       ?? '',
        clientId: d.clientId ?? '',
        active:   Number(d.active  ?? 0),
        offline:  Number(d.offline ?? 0),
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement stats sessions');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { stats, loading, error, reload: load };
}

// ✅ NOUVEAU : sessions réelles d'un client (par uuid Keycloak)
export function useClientSessions(clientUuid: string) {
  const [active,   setActive]   = useState<SessionEntry[]>([]);
  const [offline,  setOffline]  = useState<SessionEntry[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const [actRaw, offRaw] = await Promise.allSettled([
        keycloakClientsService.listUserSessions(clientUuid, { max: 500 }, getRealm()),
        keycloakClientsService.listOfflineSessions(clientUuid, { max: 500 }, getRealm()),
      ]);
      setActive(actRaw.status === 'fulfilled'  ? actRaw.value.map(s => toSessionEntry(s, 'active'))  : []);
      setOffline(offRaw.status === 'fulfilled' ? offRaw.value.map(s => toSessionEntry(s, 'offline')) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement sessions client');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);
  return { active, offline, loading, error, reload: load };
}

// ✅ NOUVEAU : métriques globales sessions pour le dashboard
export interface SessionsDashboardMetrics {
  totalActive:      number;
  totalOffline:     number;
  uniqueUsers:      number;
  uniqueClients:    number;
  rememberMeCount:  number;
  topClients:       { clientId: string; active: number; offline: number }[];
  recentSessions:   SessionEntry[];
  peakHour:         number | null;
}

export function useSessionsDashboard() {
  const [metrics,  setMetrics]  = useState<SessionsDashboardMetrics | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [clientStatsResult, clientsResult] = await Promise.allSettled([
        keycloakRealmsService.getClientSessionStats(getRealm()),
        keycloakClientsService.list({ max: 50 }, getRealm()),
      ]);

      const statsRaw  = clientStatsResult.status === 'fulfilled' ? (clientStatsResult.value as any[]) : [];
      const clientArr = clientsResult.status    === 'fulfilled'  ? clientsResult.value                : [];

      // Sessions actives pour les 8 premiers clients
      const top8 = clientArr.slice(0, 8);
      const activeArr = await batchSettled(
        top8,
        c => keycloakClientsService.listUserSessions(c.id ?? '', { max: 50 }, getRealm()),
        4
      );

      const allActive: SessionEntry[] = [];
      const seenIds = new Set<string>();
      activeArr.flat().forEach(s => {
        const e = toSessionEntry(s, 'active');
        if (!seenIds.has(e.id)) { seenIds.add(e.id); allActive.push(e); }
      });

      const totalActive   = statsRaw.reduce((a: number, d: any) => a + Number(d.active  ?? 0), 0);
      const totalOffline  = statsRaw.reduce((a: number, d: any) => a + Number(d.offline ?? 0), 0);
      const uniqueUsers   = new Set(allActive.map(s => s.userId)).size;
      const uniqueClients = new Set(allActive.flatMap(s => Object.keys(s.clients))).size;
      const rememberMe    = allActive.filter(s => s.rememberMe).length;

      const topClients = statsRaw
        .map((d: any) => ({ clientId: d.clientId ?? '', active: Number(d.active ?? 0), offline: Number(d.offline ?? 0) }))
        .sort((a: any, b: any) => (b.active + b.offline) - (a.active + a.offline))
        .slice(0, 6);

      const recentSessions = [...allActive]
        .sort((a, b) => b.lastAccess - a.lastAccess)
        .slice(0, 5);

      const hourCount: Record<number, number> = {};
      allActive.forEach(s => {
        const h = new Date(s.start).getHours();
        hourCount[h] = (hourCount[h] ?? 0) + 1;
      });
      const peakHour = Object.keys(hourCount).length > 0
        ? Number(Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0])
        : null;

      setMetrics({
        totalActive, totalOffline, uniqueUsers, uniqueClients,
        rememberMeCount: rememberMe, topClients, recentSessions, peakHour,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur dashboard sessions');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { metrics, loading, error, reload: load };
}

export function useRevocationPolicy() {
  const [policy,  setPolicy]  = useState<RevocationPolicy>({
    notBefore: 0, lastPush: 0, successPush: 0, failedPush: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const realm = await keycloakRealmsService.getByName(getRealm());
      setPolicy(prev => ({ ...prev, notBefore: (realm as any).notBefore ?? 0 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement politique de révocation');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setNotBefore = useCallback(async (timestamp: number) => {
    setSaving(true); setError(null);
    try {
      await keycloakRealmsService.update(getRealm(), { notBefore: timestamp } as any);
      setPolicy(prev => ({ ...prev, notBefore: timestamp }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur mise à jour Not Before');
      throw e;
    } finally { setSaving(false); }
  }, []);

  const pushRevocation = useCallback(async () => {
    setPushing(true); setError(null);
    try {
      const result = await keycloakRealmsService.pushRevocation(getRealm());
      const res = result as any;
      setPolicy(prev => ({
        ...prev, lastPush: Date.now() / 1000,
        successPush: res?.successRequests ?? 0, failedPush: res?.failedRequests ?? 0,
      }));
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur push révocation');
      throw e;
    } finally { setPushing(false); }
  }, []);

  const clearRevocation = useCallback(async () => {
    setSaving(true); setError(null);
    try {
      await keycloakRealmsService.update(getRealm(), { notBefore: 0 } as any);
      setPolicy(prev => ({ ...prev, notBefore: 0, lastPush: 0, successPush: 0, failedPush: 0 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur effacement politique');
      throw e;
    } finally { setSaving(false); }
  }, []);

  return { policy, loading, saving, pushing, error, reload: load, setNotBefore, pushRevocation, clearRevocation };
}
