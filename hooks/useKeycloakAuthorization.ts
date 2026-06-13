// ============================================================
// hooks/useKeycloakAuthorization.ts
// Hooks React — Authorization Services Keycloak (UMA 2.0)
// Branché sur keycloakAuthorizationService
// Couvre : ResourceServer, Resources, Scopes, Policies, Permissions, Evaluate
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import keycloakAuthorizationService, {
import { getCurrentRealm } from '@/lib/realm-resolver';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }
  type ResourceServerRepresentation,
  type ResourceRepresentation,
  type ScopeRepresentation,
  type PolicyRepresentation,
  type PolicyEvaluationResponse,
  type PolicyEvaluationRequest,
  type CreateResourcePayload,
  type CreateScopePayload,
  type CreatePolicyPayload,
  type AuthzListFilters,
} from '@/services/iam/keycloakAuthorizationService';

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ─────────────────────────────────────────────────────────────
// Hook : Resource Server (config globale du client authz)
// ─────────────────────────────────────────────────────────────
export function useResourceServer(clientUuid: string | null) {
  const [server,  setServer]  = useState<ResourceServerRepresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthorizationService.getResourceServer(clientUuid, getRealm());
      setServer(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement resource server');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (payload: Partial<ResourceServerRepresentation>) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.updateResourceServer(clientUuid, payload, getRealm());
    setServer(prev => prev ? { ...prev, ...payload } : prev);
  }, [clientUuid]);

  const importConfig = useCallback(async (payload: ResourceServerRepresentation) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.importResourceServer(clientUuid, payload, getRealm());
    await load();
  }, [clientUuid, load]);

  return { server, loading, error, reload: load, update, importConfig };
}

// ─────────────────────────────────────────────────────────────
// Hook : Ressources UMA
// ─────────────────────────────────────────────────────────────
export function useAuthzResources(clientUuid: string | null, filters?: AuthzListFilters) {
  const [resources, setResources] = useState<ResourceRepresentation[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthorizationService.listResources(clientUuid, filters ?? {}, getRealm());
      setResources(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement ressources');
    } finally { setLoading(false); }
  }, [clientUuid, filters?.name, filters?.type, filters?.first, filters?.max]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: CreateResourcePayload) => {
    if (!clientUuid) return;
    const created = await keycloakAuthorizationService.createResource(clientUuid, payload, getRealm());
    setResources(prev => [...prev, created]);
    return created;
  }, [clientUuid]);

  const update = useCallback(async (resourceId: string, payload: Partial<ResourceRepresentation>) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.updateResource(clientUuid, resourceId, payload, getRealm());
    setResources(prev => prev.map(r => r._id === resourceId ? { ...r, ...payload } : r));
  }, [clientUuid]);

  const remove = useCallback(async (resourceId: string) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.deleteResource(clientUuid, resourceId, getRealm());
    setResources(prev => prev.filter(r => r._id !== resourceId));
  }, [clientUuid]);

  return { resources, loading, error, reload: load, create, update, remove };
}

// ─────────────────────────────────────────────────────────────
// Hook : Scopes d'autorisation
// ─────────────────────────────────────────────────────────────
export function useAuthzScopes(clientUuid: string | null) {
  const [scopes,  setScopes]  = useState<ScopeRepresentation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthorizationService.listScopes(clientUuid, {}, getRealm());
      setScopes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement scopes');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: CreateScopePayload) => {
    if (!clientUuid) return;
    const created = await keycloakAuthorizationService.createScope(clientUuid, payload, getRealm());
    setScopes(prev => [...prev, created]);
    return created;
  }, [clientUuid]);

  const update = useCallback(async (scopeId: string, payload: Partial<ScopeRepresentation>) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.updateScope(clientUuid, scopeId, payload, getRealm());
    setScopes(prev => prev.map(s => s.id === scopeId ? { ...s, ...payload } : s));
  }, [clientUuid]);

  const remove = useCallback(async (scopeId: string) => {
    if (!clientUuid) return;
    await keycloakAuthorizationService.deleteScope(clientUuid, scopeId, getRealm());
    setScopes(prev => prev.filter(s => s.id !== scopeId));
  }, [clientUuid]);

  return { scopes, loading, error, reload: load, create, update, remove };
}

// ─────────────────────────────────────────────────────────────
// Hook : Policies (toutes les politiques, pas les permissions)
// ─────────────────────────────────────────────────────────────
export function useAuthzPolicies(clientUuid: string | null) {
  const [policies, setPolicies] = useState<PolicyRepresentation[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      // permission=false → récupère uniquement les policies (pas les permissions)
      const data = await keycloakAuthorizationService.listPolicies(
        clientUuid,
        { permission: false, max: 200 },
        getRealm()
      );
      setPolicies(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement politiques');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: CreatePolicyPayload) => {
    if (!clientUuid) return;
    const created = await keycloakAuthorizationService.createPolicy(clientUuid, payload, getRealm());
    setPolicies(prev => [...prev, created]);
    return created;
  }, [clientUuid]);

  const remove = useCallback(async (policyId: string) => {
    if (!clientUuid) return;
    // Keycloak : suppression d'une policy via DELETE /policy/{id} (même endpoint que resource pour Keycloak v26)
    // En pratique Keycloak utilise le même DELETE /resource/{id} pour les deux en interne
    // Pour les policies, on passe par l'endpoint resource-server/resource (cf. docs)
    try {
      await keycloakAuthorizationService.deleteResource(clientUuid, policyId, getRealm());
    } catch {
      // Fallback : certaines versions Keycloak exposent /policy/{id}
      await keycloakAuthorizationService.deleteScope(clientUuid, policyId, getRealm());
    }
    setPolicies(prev => prev.filter(p => p.id !== policyId));
  }, [clientUuid]);

  return { policies, loading, error, reload: load, create, remove };
}

// ─────────────────────────────────────────────────────────────
// Hook : Permissions (resource-based + scope-based)
// ─────────────────────────────────────────────────────────────
export function useAuthzPermissions(clientUuid: string | null) {
  const [permissions, setPermissions] = useState<PolicyRepresentation[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientUuid) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthorizationService.listPermissions(
        clientUuid,
        { max: 200 },
        getRealm()
      );
      setPermissions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement permissions');
    } finally { setLoading(false); }
  }, [clientUuid]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload: CreatePolicyPayload) => {
    if (!clientUuid) return;
    const created = await keycloakAuthorizationService.createPermission(clientUuid, payload, getRealm());
    setPermissions(prev => [...prev, created]);
    return created;
  }, [clientUuid]);

  return { permissions, loading, error, reload: load, create };
}

// ─────────────────────────────────────────────────────────────
// Hook : Évaluation des permissions (Evaluate tab)
// ─────────────────────────────────────────────────────────────
export function useAuthzEvaluate(clientUuid: string | null) {
  const [result,    setResult]    = useState<PolicyEvaluationResponse | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const evaluate = useCallback(async (request: PolicyEvaluationRequest) => {
    if (!clientUuid) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await keycloakAuthorizationService.evaluatePermission(clientUuid, request, getRealm());
      setResult(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'évaluation');
    } finally { setLoading(false); }
  }, [clientUuid]);

  const reset = useCallback(() => {
    setResult(null); setError(null);
  }, []);

  return { result, loading, error, evaluate, reset };
}

// ─────────────────────────────────────────────────────────────
// Hook composite : toutes les données authz en parallèle
// ─────────────────────────────────────────────────────────────
export function useClientAuthorization(clientUuid: string | null) {
  const resourceServer = useResourceServer(clientUuid);
  const resources      = useAuthzResources(clientUuid);
  const scopes         = useAuthzScopes(clientUuid);
  const policies       = useAuthzPolicies(clientUuid);
  const permissions    = useAuthzPermissions(clientUuid);

  const loading = resourceServer.loading || resources.loading ||
                  scopes.loading || policies.loading || permissions.loading;

  return {
    resourceServer,
    resources,
    scopes,
    policies,
    permissions,
    loading,
  };
}

export type {
  ResourceServerRepresentation,
  ResourceRepresentation,
  ScopeRepresentation,
  PolicyRepresentation,
  PolicyEvaluationResponse,
  PolicyEvaluationRequest,
  CreateResourcePayload,
  CreateScopePayload,
  CreatePolicyPayload,
};
