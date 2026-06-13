// ============================================================
// hooks/useKeycloakClients.ts
// Hook React — Gestion complète des Clients Keycloak
// Branché sur keycloakClientsService (API réelle)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { keycloakClientsService } from '@/services/iam/keycloakClientsService';
import { getCurrentRealm } from '@/lib/realm-resolver';
import type {
  ClientRepresentation,
  ProtocolMapperRepresentation,
  RoleRepresentation,
  UserSessionRepresentation,
  ClientScopeRepresentation,
} from '@/lib/models/iam/keycloak-client.model';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ─────────────────────────────────────────────────────────────
// Hook liste des clients
// ─────────────────────────────────────────────────────────────
export function useKeycloakClients(params?: {
  clientId?: string;
  search?:   boolean;
  first?:    number;
  max?:      number;
  viewableOnly?: boolean;
}) {
  const [clients,  setClients]  = useState<ClientRepresentation[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const data = await keycloakClientsService.list(
        {
          clientId:     params?.clientId,
          search:       params?.search,
          first:        params?.first  ?? 0,
          max:          params?.max    ?? 200,
          viewableOnly: params?.viewableOnly,
        },
        getRealm()
      );
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, [params?.clientId, params?.search, params?.first, params?.max, params?.viewableOnly]);

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [load]);

  // ── Actions ────────────────────────────────────────────────

  const enable = useCallback(async (clientUuid: string) => {
    await keycloakClientsService.setEnabled(clientUuid, true, getRealm());
    setClients(prev => prev.map(c =>
      c.id === clientUuid ? { ...c, enabled: true } : c
    ));
  }, []);

  const disable = useCallback(async (clientUuid: string) => {
    await keycloakClientsService.setEnabled(clientUuid, false, getRealm());
    setClients(prev => prev.map(c =>
      c.id === clientUuid ? { ...c, enabled: false } : c
    ));
  }, []);

  const remove = useCallback(async (clientUuid: string) => {
    await keycloakClientsService.delete(clientUuid, getRealm());
    setClients(prev => prev.filter(c => c.id !== clientUuid));
  }, []);

  const create = useCallback(async (payload: Parameters<typeof keycloakClientsService.create>[0]) => {
    await keycloakClientsService.create(payload, getRealm());
    await load();
  }, [load]);

  const update = useCallback(async (clientUuid: string, payload: Parameters<typeof keycloakClientsService.update>[1]) => {
    await keycloakClientsService.update(clientUuid, payload, getRealm());
    setClients(prev => prev.map(c =>
      c.id === clientUuid ? { ...c, ...payload } : c
    ));
  }, []);

  const regenerateSecret = useCallback(async (clientUuid: string) => {
    return keycloakClientsService.regenerateSecret(clientUuid, getRealm());
  }, []);

  return {
    clients, setClients, loading, error,
    reload: load,
    enable, disable, remove, create, update, regenerateSecret,
  };
}

// ─────────────────────────────────────────────────────────────
// Hook détail d'un client
// ─────────────────────────────────────────────────────────────
export function useKeycloakClientDetail(clientUuid: string | null) {
  const [client,  setClient]  = useState<ClientRepresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Ref pour avoir toujours la version la plus récente du client dans save()
  // sans dépendre du state (évite les stale closures)
  const clientRef = useRef<ClientRepresentation | null>(null);
  useEffect(() => { clientRef.current = client; }, [client]);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await keycloakClientsService.getById(clientUuid, getRealm());
      setClient(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Client introuvable');
    } finally {
      setLoading(false);
    }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  /**
   * PUT /admin/realms/{realm}/clients/{uuid} — remplacement TOTAL.
   *
   * Keycloak 26 retourne 400 Bad Request dans ces cas :
   *  1. attributes['pkce.code.challenge.method'] = '' (chaîne vide non acceptée)
   *  2. authenticationFlowBindingOverrides contient des UUID invalides ou ''
   *  3. Champs read-only : access, authorizationSettings
   *  4. registeredNodes avec structure inattendue
   *  5. id absent du body (doit correspondre au UUID du path)
   *  6. publicClient=false SANS serviceAccountsEnabled quand authorizationServicesEnabled=true
   */
  const save = useCallback(async (partial: Partial<ClientRepresentation>) => {
    if (!clientUuid) return;

    const current = clientRef.current ?? {};

    // ── 1. Fusion complète ─────────────────────────────────
    const merged: ClientRepresentation = { ...current, ...partial };

    // ── 2. Règles métier Keycloak ──────────────────────────
    const isConfidential = merged.publicClient === false;
    if (!isConfidential) {
      merged.serviceAccountsEnabled       = false;
      merged.authorizationServicesEnabled = false;
      if (merged.attributes) {
        merged.attributes['standard.token.exchange.enabled']        = 'false';
        merged.attributes['oauth2.jwt.authorization.grant.enabled'] = 'false';
        merged.attributes['oidc.ciba.grant.enabled']                = 'false';
      }
    }
    if (merged.authorizationServicesEnabled && !merged.serviceAccountsEnabled) {
      merged.serviceAccountsEnabled = true;
    }
    if (!merged.serviceAccountsEnabled) {
      merged.authorizationServicesEnabled = false;
    }

    // ── 3. Nettoyage des champs rejetés par Keycloak ───────
    // Source: PDF officiel ClientRepresentation Keycloak 26.6.1 (30/04/2026)
    const {
      access: _access,                              // read-only
      authorizationSettings: _authzSet,             // read-only
      registeredNodes: _regNodes,                   // interne Keycloak
      // Champs qui N'EXISTENT PAS dans ClientRepresentation Keycloak 26
      // (Device Auth Grant → attributes["oauth2.device.authorization.grant.enabled"])
      oauth2DeviceAuthorizationGrantEnabled: _d1,   // GitHub issue #25649
      deviceAuthorizationGrantEnabled:       _d2,   // variante incorrecte
      ...base
    } = merged as any;

    // ── 4. Assurer que id est présent dans le body ─────────
    // Keycloak valide que body.id == UUID du path
    if (!base.id) base.id = clientUuid;

    // ── 5. Nettoyer les attributs ──────────────────────────
    // Keycloak 26 rejette les attributs avec valeur vide '' pour certains champs validés
    // Règle : supprimer les clés dont la valeur est '' ou null
    if (base.attributes && typeof base.attributes === 'object') {
      const REMOVABLE_IF_EMPTY = [
        'pkce.code.challenge.method',         // doit être 'S256', 'plain', ou absent
        'backchannel.logout.url',              // doit être une URL valide ou absent
        'backchannel.logout.session.required', // booléen string ou absent
        'logo.uri',
        'policy.uri',
        'tos.uri',
      ];
      const cleanAttrs: Record<string, string> = {};
      for (const [k, v] of Object.entries(base.attributes as Record<string, unknown>)) {
        if (v === null || v === undefined) continue;
        const str = String(v);
        // Pour les champs sensibles : ne pas inclure si vide
        if (REMOVABLE_IF_EMPTY.includes(k) && str === '') continue;
        cleanAttrs[k] = str;
      }
      base.attributes = cleanAttrs;
    }

    // ── 6. Nettoyer authenticationFlowBindingOverrides ─────
    // Ne conserver que les entrées avec une vraie valeur (UUID non-vide)
    // Un override vide '' fait planter Keycloak car il tente de résoudre le flow
    if (base.authenticationFlowBindingOverrides && typeof base.authenticationFlowBindingOverrides === 'object') {
      const cleanOverrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(base.authenticationFlowBindingOverrides as Record<string, unknown>)) {
        if (v && String(v).trim() !== '') {
          cleanOverrides[k] = String(v);
        }
      }
      // Keycloak accepte un objet vide {} mais pas des valeurs ''
      base.authenticationFlowBindingOverrides = cleanOverrides;
    }

    // ── 7. Envoyer ────────────────────────────────────────
    await keycloakClientsService.update(clientUuid, base, getRealm());

    // ── 8. Mettre à jour le state local ──────────────────
    setClient(base as ClientRepresentation);
  }, [clientUuid]);

  return { client, setClient, loading, error, reload: load, save };
}

// ─────────────────────────────────────────────────────────────
// Hook : Rôles d'un client
// ─────────────────────────────────────────────────────────────
export function useClientRoles(clientUuid: string | null) {
  const [roles,   setRoles]   = useState<RoleRepresentation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakClientsService.listRoles(clientUuid, {}, getRealm());
      setRoles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement rôles');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: { name: string; description?: string }) => {
    if (!clientUuid) return;
    await keycloakClientsService.createRole(clientUuid, payload, getRealm());
    await load();
  }, [clientUuid, load]);

  const remove = useCallback(async (roleName: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.deleteRole(clientUuid, roleName, getRealm());
    setRoles(prev => prev.filter(r => r.name !== roleName));
  }, [clientUuid]);

  return { roles, loading, error, reload: load, create, remove };
}

// ─────────────────────────────────────────────────────────────
// Hook : Protocol Mappers d'un client
// ─────────────────────────────────────────────────────────────
export function useClientMappers(clientUuid: string | null) {
  const [mappers,  setMappers]  = useState<ProtocolMapperRepresentation[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakClientsService.listProtocolMappers(clientUuid, getRealm());
      setMappers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement mappers');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: Parameters<typeof keycloakClientsService.createProtocolMapper>[1]) => {
    if (!clientUuid) return;
    await keycloakClientsService.createProtocolMapper(clientUuid, payload, getRealm());
    await load();
  }, [clientUuid, load]);

  const update = useCallback(async (mapperId: string, payload: Parameters<typeof keycloakClientsService.updateProtocolMapper>[2]) => {
    if (!clientUuid) return;
    await keycloakClientsService.updateProtocolMapper(clientUuid, mapperId, payload, getRealm());
    await load();
  }, [clientUuid, load]);

  const remove = useCallback(async (mapperId: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.deleteProtocolMapper(clientUuid, mapperId, getRealm());
    setMappers(prev => prev.filter(m => m.id !== mapperId));
  }, [clientUuid]);

  return { mappers, loading, error, reload: load, create, update, remove };
}

// ─────────────────────────────────────────────────────────────
// Hook : Client Scopes (default + optional)
// ─────────────────────────────────────────────────────────────
export function useClientScopes(clientUuid: string | null) {
  const [defaultScopes,   setDefaultScopes]   = useState<ClientScopeRepresentation[]>([]);
  const [optionalScopes,  setOptionalScopes]  = useState<ClientScopeRepresentation[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const [def, opt] = await Promise.all([
        keycloakClientsService.listDefaultClientScopes(clientUuid, getRealm()),
        keycloakClientsService.listOptionalClientScopes(clientUuid, getRealm()),
      ]);
      setDefaultScopes(def);
      setOptionalScopes(opt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement scopes');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const addDefault = useCallback(async (scopeId: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.addDefaultClientScope(clientUuid, scopeId, getRealm());
    await load();
  }, [clientUuid, load]);

  const removeDefault = useCallback(async (scopeId: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.removeDefaultClientScope(clientUuid, scopeId, getRealm());
    setDefaultScopes(prev => prev.filter(s => s.id !== scopeId));
  }, [clientUuid]);

  const addOptional = useCallback(async (scopeId: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.addOptionalClientScope(clientUuid, scopeId, getRealm());
    await load();
  }, [clientUuid, load]);

  const removeOptional = useCallback(async (scopeId: string) => {
    if (!clientUuid) return;
    await keycloakClientsService.removeOptionalClientScope(clientUuid, scopeId, getRealm());
    setOptionalScopes(prev => prev.filter(s => s.id !== scopeId));
  }, [clientUuid]);

  return {
    defaultScopes, optionalScopes, loading, error, reload: load,
    addDefault, removeDefault, addOptional, removeOptional,
  };
}

// ─────────────────────────────────────────────────────────────
// Hook : Sessions d'un client
// ─────────────────────────────────────────────────────────────
export function useClientSessions(clientUuid: string | null) {
  const [sessions,       setSessions]       = useState<UserSessionRepresentation[]>([]);
  const [offlineSessions,setOfflineSessions]= useState<UserSessionRepresentation[]>([]);
  const [sessionCount,   setSessionCount]   = useState(0);
  const [offlineCount,   setOfflineCount]   = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const [sess, offline, cnt, ocnt] = await Promise.all([
        keycloakClientsService.listUserSessions(clientUuid, { max: 50 }, getRealm()),
        keycloakClientsService.listOfflineSessions(clientUuid, { max: 50 }, getRealm()),
        keycloakClientsService.getSessionCount(clientUuid, getRealm()),
        keycloakClientsService.getOfflineSessionCount(clientUuid, getRealm()),
      ]);
      setSessions(sess);
      setOfflineSessions(offline);
      setSessionCount(cnt);
      setOfflineCount(ocnt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement sessions');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  return {
    sessions, offlineSessions, sessionCount, offlineCount,
    loading, error, reload: load,
  };
}
