// ============================================================
// hooks/useKeycloakEvenements.ts
// Hook React — Gestion complète des Événements Keycloak
// Branché sur keycloakRealmsService
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { keycloakRealmsService } from '@/services/iam/keycloakRealmsService';
import type { UserEvent, AdminEvent } from '@/components/pages/module/evenements/ui/types';
import { getCurrentRealm } from '@/lib/realm-resolver';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Adapter ─────────────────────────────────────────────────
function toUserEvent(raw: any): UserEvent {
  return {
    id:         raw.id         ?? `${raw.time}-${Math.random()}`,
    time:       typeof raw.time === 'number' ? raw.time : Date.now(),
    type:       raw.type       ?? 'UNKNOWN',
    realmId:    raw.realmId    ?? '',
    clientId:   raw.clientId   ?? '',
    userId:     raw.userId     ?? '',
    sessionId:  raw.sessionId  ?? '',
    ipAddress:  raw.ipAddress  ?? '',
    error:      raw.error,
    details:    raw.details,
    username:   raw.details?.username ?? '',
  };
}

function toAdminEvent(raw: any): AdminEvent {
  return {
    id:            raw.id ?? `${raw.time}-${Math.random()}`,
    time:          typeof raw.time === 'number' ? raw.time : Date.now(),
    operationType: raw.operationType ?? 'ACTION',
    resourceType:  raw.resourceType  ?? '',
    resourcePath:  raw.resourcePath  ?? '',
    realmId:       raw.realmId       ?? '',
    representation:raw.representation,
    error:         raw.error,
    authDetails: {
      realmId:   raw.authDetails?.realmId   ?? '',
      clientId:  raw.authDetails?.clientId  ?? '',
      userId:    raw.authDetails?.userId    ?? '',
      ipAddress: raw.authDetails?.ipAddress ?? '',
      username:  raw.authDetails?.username  ?? '',
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Hook : Événements utilisateur
// ─────────────────────────────────────────────────────────────
export function useUserEvents(params?: {
  type?:     string | string[];
  clientId?: string;
  dateFrom?: string;
  dateTo?:   string;
  user?:     string;
  max?:      number;
}) {
  const [events,  setEvents]  = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const raw = await keycloakRealmsService.listEvents(
        {
          type:     Array.isArray(params?.type) ? params!.type : (params?.type ? [params.type] : undefined),
          client:   params?.clientId,
          dateFrom: params?.dateFrom,
          dateTo:   params?.dateTo,
          user:     params?.user,
          max:      params?.max ?? 500,
        } as any,
        getRealm()
      );
      setEvents((raw as any[]).map(toUserEvent));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement événements');
    } finally {
      setLoading(false);
    }
  }, [params?.type, params?.clientId, params?.dateFrom, params?.dateTo, params?.user, params?.max]);

  useEffect(() => { load(); }, [load]);

  const clear = useCallback(async () => {
    await keycloakRealmsService.clearEvents(getRealm());
    setEvents([]);
  }, []);

  return { events, loading, error, reload: load, clear };
}

// ─────────────────────────────────────────────────────────────
// Hook : Événements admin
// ─────────────────────────────────────────────────────────────
export function useAdminEvents(params?: {
  operationTypes?: string[];
  resourceTypes?:  string[];
  resourcePath?:   string;
  dateFrom?:       string;
  dateTo?:         string;
  authUser?:       string;
  authClient?:     string;
  max?:            number;
}) {
  const [events,  setEvents]  = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const raw = await keycloakRealmsService.listAdminEvents(
        {
          operationTypes: params?.operationTypes,
          resourceTypes:  params?.resourceTypes,
          resourcePath:   params?.resourcePath,
          dateFrom:       params?.dateFrom,
          dateTo:         params?.dateTo,
          authUser:       params?.authUser,
          authClient:     params?.authClient,
          max:            params?.max ?? 500,
        } as any,
        getRealm()
      );
      setEvents((raw as any[]).map(toAdminEvent));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement événements admin');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  const clear = useCallback(async () => {
    await keycloakRealmsService.clearAdminEvents(getRealm());
    setEvents([]);
  }, []);

  return { events, loading, error, reload: load, clear };
}

// ─────────────────────────────────────────────────────────────
// Hook : Config événements
// ─────────────────────────────────────────────────────────────
export function useEventsConfig() {
  const [config,  setConfig]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakRealmsService.getEventsConfig(getRealm());
      setConfig(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement config événements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (payload: any) => {
    setSaving(true);
    try {
      await keycloakRealmsService.updateEventsConfig(payload, getRealm());
      setConfig((p: any) => ({ ...p, ...payload }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur mise à jour config');
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, error, reload: load, update };
}
