// ============================================================
// hooks/useKeycloakClientScopes.ts — v2 COMPLÈTE
// Hook React — toutes les méthodes du service client scopes
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { keycloakClientScopesService } from '@/services/iam/keycloakClientScopesService';

const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'master';

export function useKeycloakClientScopes() {
  const [scopes,  setScopes]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Chargement initial ─────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakClientScopesService.list(REALM);
      setScopes(data as any[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement client scopes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD scopes ────────────────────────────────────────
  const create = useCallback(async (payload: { name:string; description?:string; protocol?:string; type?:string }) => {
    await keycloakClientScopesService.create(payload as any, REALM);
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await keycloakClientScopesService.delete(id, REALM);
    setScopes(prev => prev.filter((s: any) => s.id !== id));
  }, []);

  const update = useCallback(async (id: string, payload: any) => {
    await keycloakClientScopesService.update(id, payload, REALM);
    setScopes(prev => prev.map((s: any) => s.id === id ? { ...s, ...payload } : s));
  }, []);

  const getById = useCallback(async (id: string) => {
    return keycloakClientScopesService.getById(id, REALM);
  }, []);

  // ── Protocol mappers ───────────────────────────────────
  const listMappers = useCallback(async (id: string) => {
    return keycloakClientScopesService.listProtocolMappers(id, REALM);
  }, []);

  const getMapper = useCallback(async (id: string, mapperId: string) => {
    return keycloakClientScopesService.getProtocolMapper(id, mapperId, REALM);
  }, []);

  const createMapper = useCallback(async (id: string, payload: any) => {
    return keycloakClientScopesService.createProtocolMapper(id, payload, REALM);
  }, []);

  const createMappers = useCallback(async (id: string, payloads: any[]) => {
    return keycloakClientScopesService.createProtocolMappers(id, payloads, REALM);
  }, []);

  const updateMapper = useCallback(async (id: string, mapperId: string, payload: any) => {
    return keycloakClientScopesService.updateProtocolMapper(id, mapperId, payload, REALM);
  }, []);

  const deleteMapper = useCallback(async (id: string, mapperId: string) => {
    return keycloakClientScopesService.deleteProtocolMapper(id, mapperId, REALM);
  }, []);

  const listMappersByProtocol = useCallback(async (id: string, protocol: string) => {
    return keycloakClientScopesService.listProtocolMappersByProtocol(id, protocol, REALM);
  }, []);

  // ── Scope mappings (Realm) ─────────────────────────────
  const listAllScopeMappings = useCallback(async (id: string) => {
    return keycloakClientScopesService.listScopeMappings(id, REALM);
  }, []);

  const listRealmScopeMappings = useCallback(async (id: string) => {
    return keycloakClientScopesService.listRealmScopeMappings(id, REALM);
  }, []);

  const listAvailableRealmScopeMappings = useCallback(async (id: string) => {
    return keycloakClientScopesService.listAvailableRealmScopeMappings(id, REALM);
  }, []);

  const listCompositeRealmScopeMappings = useCallback(async (id: string) => {
    return keycloakClientScopesService.listCompositeRealmScopeMappings(id, REALM);
  }, []);

  const addRealmScopeMappings = useCallback(async (id: string, roles: any[]) => {
    return keycloakClientScopesService.addRealmScopeMappings(id, roles, REALM);
  }, []);

  const removeRealmScopeMappings = useCallback(async (id: string, roles: any[]) => {
    return keycloakClientScopesService.removeRealmScopeMappings(id, roles, REALM);
  }, []);

  // ── Scope mappings (Client) ────────────────────────────
  const listClientScopeMappings = useCallback(async (id: string, clientId: string) => {
    return keycloakClientScopesService.listClientScopeMappings(id, clientId, REALM);
  }, []);

  const listAvailableClientScopeMappings = useCallback(async (id: string, clientId: string) => {
    return keycloakClientScopesService.listAvailableClientScopeMappings(id, clientId, REALM);
  }, []);

  const listCompositeClientScopeMappings = useCallback(async (id: string, clientId: string) => {
    return keycloakClientScopesService.listCompositeClientScopeMappings(id, clientId, REALM);
  }, []);

  const addClientScopeMappings = useCallback(async (id: string, clientId: string, roles: any[]) => {
    return keycloakClientScopesService.addClientScopeMappings(id, clientId, roles, REALM);
  }, []);

  const removeClientScopeMappings = useCallback(async (id: string, clientId: string, roles: any[]) => {
    return keycloakClientScopesService.removeClientScopeMappings(id, clientId, roles, REALM);
  }, []);

  // ── Templates ──────────────────────────────────────────
  const listTemplates = useCallback(async () => {
    return keycloakClientScopesService.listTemplates(REALM);
  }, []);

  const listTemplateMappers = useCallback(async (id: string) => {
    return keycloakClientScopesService.listTemplateProtocolMappers(id, REALM);
  }, []);

  return {
    // State
    scopes, loading, error, reload: load,

    // CRUD
    create, remove, update, getById,

    // Protocol Mappers
    listMappers, getMapper, createMapper, createMappers,
    updateMapper, deleteMapper, listMappersByProtocol,

    // Scope Mappings — Realm
    listAllScopeMappings,
    listRealmScopeMappings, listAvailableRealmScopeMappings, listCompositeRealmScopeMappings,
    addRealmScopeMappings, removeRealmScopeMappings,

    // Scope Mappings — Client
    listClientScopeMappings, listAvailableClientScopeMappings, listCompositeClientScopeMappings,
    addClientScopeMappings, removeClientScopeMappings,

    // Templates
    listTemplates, listTemplateMappers,
  };
}
