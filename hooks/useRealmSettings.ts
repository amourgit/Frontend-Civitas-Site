// ============================================================
// hooks/useRealmSettings.ts
// Hook complet — Administration du Realm Keycloak v26
// Branche toutes les requêtes de keycloakRealmsService
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { keycloakRealmsService } from '@/services/iam/keycloakRealmsService';
import { getCurrentRealm } from '@/lib/realm-resolver';
import type {
  RealmRepresentation,
  KeysMetadataRepresentation,
  RealmEventsConfigRepresentation,
  ManagementPermissionReference,
  ClientPoliciesRepresentation,
  ClientProfilesRepresentation,
  ClientTypesRepresentation,
} from '@/lib/models/iam/keycloak-realm.model';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Types exposés ─────────────────────────────────────────

export interface RealmFullData {
  realm:             RealmRepresentation | null;
  keys:              KeysMetadataRepresentation | null;
  eventsConfig:      RealmEventsConfigRepresentation | null;
  defaultClientScopes:  unknown[];
  optionalClientScopes: unknown[];
  defaultGroups:     unknown[];
  locales:           string[];
  clientSessionStats: unknown[];
  credentialRegistrators: string[];
  managementPermissions: ManagementPermissionReference | null;
  clientPolicies:    ClientPoliciesRepresentation | null;
  clientProfiles:    ClientProfilesRepresentation | null;
  clientTypes:       ClientTypesRepresentation | null;
}

export interface UseRealmSettingsReturn {
  data:         RealmFullData;
  loading:      boolean;
  saving:       boolean;
  error:        string | null;
  saveError:    string | null;
  realmName:    string;
  // Actions
  refresh:      () => Promise<void>;
  updateRealm:  (patch: Partial<RealmRepresentation>) => Promise<boolean>;
  updateEventsConfig: (cfg: Partial<RealmEventsConfigRepresentation>) => Promise<boolean>;
  testSmtp:     (config: Record<string, string>) => Promise<boolean>;
  logoutAll:    () => Promise<{ success: number; failed: number }>;
  pushRevocation: () => Promise<{ success: number; failed: number }>;
  setFineGrainedPermissions: (enabled: boolean) => Promise<boolean>;
  addDefaultClientScope:    (id: string) => Promise<boolean>;
  removeDefaultClientScope: (id: string) => Promise<boolean>;
  addOptionalClientScope:   (id: string) => Promise<boolean>;
  removeOptionalClientScope:(id: string) => Promise<boolean>;
  addDefaultGroup:          (id: string) => Promise<boolean>;
  removeDefaultGroup:       (id: string) => Promise<boolean>;
  updateClientPolicies:     (p: ClientPoliciesRepresentation) => Promise<boolean>;
  updateClientProfiles:     (p: ClientProfilesRepresentation) => Promise<boolean>;
  partialExport:            (opts?: { exportClients?: boolean; exportGroupsAndRoles?: boolean }) => Promise<RealmRepresentation | null>;
  clearError:   () => void;
}

// ── Helpers ───────────────────────────────────────────────

const EMPTY: RealmFullData = {
  realm: null, keys: null, eventsConfig: null,
  defaultClientScopes: [], optionalClientScopes: [],
  defaultGroups: [], locales: [], clientSessionStats: [],
  credentialRegistrators: [], managementPermissions: null,
  clientPolicies: null, clientProfiles: null, clientTypes: null,
};

// ── Hook ──────────────────────────────────────────────────

export function useRealmSettings(realm: string = getRealm()): UseRealmSettingsReturn {
  const [data,      setData     ] = useState<RealmFullData>(EMPTY);
  const [loading,   setLoading  ] = useState(true);
  const [saving,    setSaving   ] = useState(false);
  const [error,     setError    ] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Chargement principal ────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(null);

    try {
      // Requêtes critiques en parallèle — on tolère les échecs partiels
      const [realmData, keysData, eventsConfigData] = await Promise.all([
        keycloakRealmsService.getByName(realm).catch(() => null),
        keycloakRealmsService.getKeys(realm).catch(() => null),
        keycloakRealmsService.getEventsConfig(realm).catch(() => null),
      ]);

      // Requêtes secondaires
      // NOTE: getUsersManagementPermissions → nécessite feature 'admin_fine_grained_authz'
      //       listClientTypes               → nécessite feature 'client_types'
      // Ces deux features ne sont pas activées dans cette installation Keycloak.
      // Les appels sont désactivés pour éviter les erreurs 500 serveur répétées.
      const [
        defaultScopes, optionalScopes, defaultGroups,
        locales, sessionStats, credentials,
        clientPolicies, clientProfiles,
      ] = await Promise.all([
        keycloakRealmsService.listDefaultClientScopes(realm).catch(() => []),
        keycloakRealmsService.listOptionalClientScopes(realm).catch(() => []),
        keycloakRealmsService.listDefaultGroups(realm).catch(() => []),
        keycloakRealmsService.listLocales(realm).catch(() => []),
        keycloakRealmsService.getClientSessionStats(realm).catch(() => []),
        keycloakRealmsService.listCredentialRegistrators(realm).catch(() => []),
        keycloakRealmsService.getClientPolicies({}, realm).catch(() => null),
        keycloakRealmsService.getClientProfiles({}, realm).catch(() => null),
      ]);

      if (!mountedRef.current) return;

      setData({
        realm:                realmData,
        keys:                 keysData,
        eventsConfig:         eventsConfigData,
        defaultClientScopes:  defaultScopes,
        optionalClientScopes: optionalScopes,
        defaultGroups:        defaultGroups,
        locales:              locales,
        clientSessionStats:   sessionStats,
        credentialRegistrators: credentials,
        managementPermissions:  null,   // feature admin_fine_grained_authz non activée
        clientPolicies:         clientPolicies,
        clientProfiles:         clientProfiles,
        clientTypes:            null,   // feature client_types non activée
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Erreur de chargement du realm');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [realm]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Mise à jour du realm ────────────────────────────────
  const updateRealm = useCallback(async (patch: Partial<RealmRepresentation>): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await keycloakRealmsService.update(realm, patch);
      // Rafraîchit seulement les données du realm
      const updated = await keycloakRealmsService.getByName(realm);
      if (mountedRef.current) {
        setData(d => ({ ...d, realm: updated }));
      }
      return true;
    } catch (err) {
      if (mountedRef.current) {
        setSaveError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
      }
      return false;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Mise à jour config events ───────────────────────────
  const updateEventsConfig = useCallback(async (cfg: Partial<RealmEventsConfigRepresentation>): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await keycloakRealmsService.updateEventsConfig(cfg, realm);
      const updated = await keycloakRealmsService.getEventsConfig(realm);
      if (mountedRef.current) setData(d => ({ ...d, eventsConfig: updated }));
      return true;
    } catch (err) {
      if (mountedRef.current) setSaveError(err instanceof Error ? err.message : 'Erreur config events');
      return false;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Test SMTP ───────────────────────────────────────────
  const testSmtp = useCallback(async (config: Record<string, string>): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await keycloakRealmsService.testSmtpConnection(config, realm);
      return true;
    } catch (err) {
      if (mountedRef.current) setSaveError(err instanceof Error ? err.message : 'Échec test SMTP');
      return false;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Logout all ──────────────────────────────────────────
  const logoutAll = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setSaving(true);
    try {
      const result = await keycloakRealmsService.logoutAll(realm);
      return {
        success: result.successRequests?.length ?? 0,
        failed:  result.failedRequests?.length  ?? 0,
      };
    } catch {
      return { success: 0, failed: 1 };
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Push revocation ─────────────────────────────────────
  const pushRevocation = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setSaving(true);
    try {
      const result = await keycloakRealmsService.pushRevocation(realm);
      return {
        success: result.successRequests?.length ?? 0,
        failed:  result.failedRequests?.length  ?? 0,
      };
    } catch {
      return { success: 0, failed: 1 };
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Fine-grained permissions ────────────────────────────
  // DÉSACTIVÉ : nécessite feature 'admin_fine_grained_authz' non activée sur ce serveur
  const setFineGrainedPermissions = useCallback(async (_enabled: boolean): Promise<boolean> => {
    setSaveError('La fonctionnalité "Fine-grained Admin Permissions" n\'est pas activée sur ce serveur Keycloak. Ajoutez --features=admin_fine_grained_authz au démarrage pour l\'activer.');
    return false;
  }, []);

  // ── Scopes par défaut ───────────────────────────────────
  const addDefaultClientScope = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.addDefaultClientScope(id, realm);
      const updated = await keycloakRealmsService.listDefaultClientScopes(realm);
      if (mountedRef.current) setData(d => ({ ...d, defaultClientScopes: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  const removeDefaultClientScope = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.removeDefaultClientScope(id, realm);
      const updated = await keycloakRealmsService.listDefaultClientScopes(realm);
      if (mountedRef.current) setData(d => ({ ...d, defaultClientScopes: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  const addOptionalClientScope = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.addOptionalClientScope(id, realm);
      const updated = await keycloakRealmsService.listOptionalClientScopes(realm);
      if (mountedRef.current) setData(d => ({ ...d, optionalClientScopes: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  const removeOptionalClientScope = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.removeOptionalClientScope(id, realm);
      const updated = await keycloakRealmsService.listOptionalClientScopes(realm);
      if (mountedRef.current) setData(d => ({ ...d, optionalClientScopes: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  // ── Groupes par défaut ──────────────────────────────────
  const addDefaultGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.addDefaultGroup(id, realm);
      const updated = await keycloakRealmsService.listDefaultGroups(realm);
      if (mountedRef.current) setData(d => ({ ...d, defaultGroups: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  const removeDefaultGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      await keycloakRealmsService.removeDefaultGroup(id, realm);
      const updated = await keycloakRealmsService.listDefaultGroups(realm);
      if (mountedRef.current) setData(d => ({ ...d, defaultGroups: updated }));
      return true;
    } catch { return false; }
  }, [realm]);

  // ── Client Policies ─────────────────────────────────────
  const updateClientPolicies = useCallback(async (p: ClientPoliciesRepresentation): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await keycloakRealmsService.updateClientPolicies(p, realm);
      const updated = await keycloakRealmsService.getClientPolicies({}, realm);
      if (mountedRef.current) setData(d => ({ ...d, clientPolicies: updated }));
      return true;
    } catch (err) {
      if (mountedRef.current) setSaveError(err instanceof Error ? err.message : 'Erreur policies');
      return false;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Client Profiles ─────────────────────────────────────
  const updateClientProfiles = useCallback(async (p: ClientProfilesRepresentation): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      await keycloakRealmsService.updateClientProfiles(p, realm);
      const updated = await keycloakRealmsService.getClientProfiles({}, realm);
      if (mountedRef.current) setData(d => ({ ...d, clientProfiles: updated }));
      return true;
    } catch (err) {
      if (mountedRef.current) setSaveError(err instanceof Error ? err.message : 'Erreur profiles');
      return false;
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [realm]);

  // ── Partial Export ──────────────────────────────────────
  const partialExport = useCallback(async (opts: { exportClients?: boolean; exportGroupsAndRoles?: boolean } = {}): Promise<RealmRepresentation | null> => {
    setSaving(true);
    try {
      return await keycloakRealmsService.partialExport(opts, realm);
    } catch { return null; }
    finally { if (mountedRef.current) setSaving(false); }
  }, [realm]);

  return {
    data,
    loading,
    saving,
    error,
    saveError,
    realmName: realm,
    refresh:   fetchAll,
    updateRealm,
    updateEventsConfig,
    testSmtp,
    logoutAll,
    pushRevocation,
    setFineGrainedPermissions,
    addDefaultClientScope,
    removeDefaultClientScope,
    addOptionalClientScope,
    removeOptionalClientScope,
    addDefaultGroup,
    removeDefaultGroup,
    updateClientPolicies,
    updateClientProfiles,
    partialExport,
    clearError: () => { setError(null); setSaveError(null); },
  };
}
