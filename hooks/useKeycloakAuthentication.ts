// ============================================================
// hooks/useKeycloakAuthentication.ts
// Hook React complet — Gestion de l'Authentification Keycloak
// Branché sur keycloakAuthenticationService + keycloakRealmsService
// Couvre : Flows, Exécutions, Configs, Required Actions,
//          Password Policy, OTP Policy, WebAuthn Policy, Bindings
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import keycloakAuthenticationService, {
  type AuthenticationFlowRepresentation,
  type AuthenticationExecutionInfoRepresentation,
  type AuthenticatorConfigRepresentation,
  type RequiredActionProviderRepresentation,
  type AddFlowExecutionPayload,
  type AddFlowExecutionFlowPayload,
  type CopyFlowPayload,
  type UpdateRequiredActionPayload,
  type CreateAuthenticatorConfigPayload,
} from '@/services/iam/keycloakAuthenticationService';
import { keycloakRealmsService } from '@/services/iam/keycloakRealmsService';
import { getCurrentRealm } from '@/lib/realm-resolver';

/** Realm courant (dynamique via sous-domaine) */
function getRealm(): string { return getCurrentRealm().realm; }

// Realm résolu dynamiquement via sous-domaine (voir getRealm())

// ── Types exportés pour les composants ────────────────────────

export type { AuthenticationFlowRepresentation };
export type { AuthenticationExecutionInfoRepresentation };
export type { AuthenticatorConfigRepresentation };
export type { RequiredActionProviderRepresentation };

export interface PasswordPolicyRule {
  type: string;
  value?: string | number;
}

export interface OtpPolicy {
  otpPolicyType:            string;
  otpPolicyAlgorithm:       string;
  otpPolicyDigits:          number;
  otpPolicyLookAheadWindow: number;
  otpPolicyPeriod:          number;
  otpPolicyInitialCounter:  number;
  otpPolicyCodeReusable:    boolean;
  otpSupportedApplications: string[];
}

export interface WebAuthnPolicy {
  rpEntityName:                    string;
  rpId:                            string;
  signatureAlgorithms:             string[];
  attestationConveyancePreference: string;
  authenticatorAttachment:         string;
  requireResidentKey:              string;
  userVerificationRequirement:     string;
  createTimeout:                   number;
  avoidSameAuthenticatorRegister:  boolean;
  acceptableAaguids:               string[];
  extraOrigins:                    string[];
}

export interface BindingsConfig {
  browserFlow:              string;
  registrationFlow:         string;
  directGrantFlow:          string;
  resetCredentialsFlow:     string;
  clientAuthenticationFlow: string;
  dockerAuthenticationFlow: string;
  firstBrokerLoginFlow:     string;
}

// ── Parseur politique de mot de passe ─────────────────────────
export function parsePasswordPolicy(raw: string): PasswordPolicyRule[] {
  if (!raw) return [];
  // Format Keycloak: "length(8) and digits(2) and upperCase(1)"
  const parts = raw.split(/\s+and\s+/i);
  return parts.map(p => {
    const m = p.trim().match(/^(\w+)(?:\(([^)]+)\))?$/);
    if (!m) return { type: p.trim() };
    return { type: m[1], value: isNaN(Number(m[2])) ? m[2] : Number(m[2]) };
  });
}

export function buildPasswordPolicy(rules: PasswordPolicyRule[]): string {
  return rules.map(r => r.value !== undefined ? `${r.type}(${r.value})` : r.type).join(' and ');
}

// ─────────────────────────────────────────────────────────────
// 1. Hook : Flux d'authentification
// ─────────────────────────────────────────────────────────────
export function useAuthFlows(realm: string = getRealm()) {
  const [flows,   setFlows]   = useState<AuthenticationFlowRepresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthenticationService.listFlows(realm);
      setFlows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement flows');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const createFlow = useCallback(async (payload: Partial<AuthenticationFlowRepresentation>) => {
    await keycloakAuthenticationService.createFlow(payload, realm);
    await load();
  }, [realm, load]);

  const updateFlow = useCallback(async (id: string, payload: Partial<AuthenticationFlowRepresentation>) => {
    await keycloakAuthenticationService.updateFlow(id, payload, realm);
    await load();
  }, [realm, load]);

  const deleteFlow = useCallback(async (id: string) => {
    await keycloakAuthenticationService.deleteFlow(id, realm);
    await load();
  }, [realm, load]);

  const copyFlow = useCallback(async (flowAlias: string, payload: CopyFlowPayload) => {
    await keycloakAuthenticationService.copyFlow(flowAlias, payload, realm);
    await load();
  }, [realm, load]);

  return { flows, loading, error, reload: load, createFlow, updateFlow, deleteFlow, copyFlow };
}

// ─────────────────────────────────────────────────────────────
// 2. Hook : Exécutions d'un flow
// ─────────────────────────────────────────────────────────────
export function useFlowExecutions(flowAlias: string, realm: string = getRealm()) {
  const [executions, setExecutions] = useState<AuthenticationExecutionInfoRepresentation[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!flowAlias) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthenticationService.listFlowExecutions(flowAlias, realm);
      setExecutions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement exécutions');
    } finally { setLoading(false); }
  }, [flowAlias, realm]);

  useEffect(() => { load(); }, [load]);

  const updateRequirement = useCallback(async (execution: AuthenticationExecutionInfoRepresentation) => {
    await keycloakAuthenticationService.updateFlowExecutions(flowAlias, execution, realm);
    await load();
  }, [flowAlias, realm, load]);

  const addExecution = useCallback(async (payload: AddFlowExecutionPayload) => {
    await keycloakAuthenticationService.addFlowExecution(flowAlias, payload, realm);
    await load();
  }, [flowAlias, realm, load]);

  const addSubFlow = useCallback(async (payload: AddFlowExecutionFlowPayload) => {
    await keycloakAuthenticationService.addFlowExecutionFlow(flowAlias, payload, realm);
    await load();
  }, [flowAlias, realm, load]);

  const deleteExecution = useCallback(async (executionId: string) => {
    await keycloakAuthenticationService.deleteExecution(executionId, realm);
    await load();
  }, [realm, load]);

  const raisePriority = useCallback(async (executionId: string) => {
    await keycloakAuthenticationService.raiseExecutionPriority(executionId, realm);
    await load();
  }, [realm, load]);

  const lowerPriority = useCallback(async (executionId: string) => {
    await keycloakAuthenticationService.lowerExecutionPriority(executionId, realm);
    await load();
  }, [realm, load]);

  return {
    executions, loading, error, reload: load,
    updateRequirement, addExecution, addSubFlow, deleteExecution, raisePriority, lowerPriority,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. Hook : Providers disponibles
// ─────────────────────────────────────────────────────────────
export function useAuthProviders(realm: string = getRealm()) {
  const [providers,       setProviders]       = useState<any[]>([]);
  const [clientProviders, setClientProviders] = useState<any[]>([]);
  const [formProviders,   setFormProviders]   = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, cp, fp] = await Promise.all([
        keycloakAuthenticationService.listAuthenticatorProviders(realm),
        keycloakAuthenticationService.listClientAuthenticatorProviders(realm),
        keycloakAuthenticationService.listFormProviders(realm),
      ]);
      setProviders(p as any[]);
      setClientProviders(cp as any[]);
      setFormProviders(fp as any[]);
    } catch (e) {
      console.error('Erreur chargement providers', e);
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  return { providers, clientProviders, formProviders, loading, reload: load };
}

// ─────────────────────────────────────────────────────────────
// 4. Hook : Required Actions
// ─────────────────────────────────────────────────────────────
export function useRequiredActions(realm: string = getRealm()) {
  const [actions,      setActions]      = useState<RequiredActionProviderRepresentation[]>([]);
  const [unregistered, setUnregistered] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [a, u] = await Promise.all([
        keycloakAuthenticationService.listRequiredActions(realm),
        keycloakAuthenticationService.listUnregisteredRequiredActions(realm),
      ]);
      setActions(a);
      setUnregistered(u as any[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement required actions');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const updateAction = useCallback(async (alias: string, payload: UpdateRequiredActionPayload) => {
    await keycloakAuthenticationService.updateRequiredAction(alias, payload, realm);
    await load();
  }, [realm, load]);

  const deleteAction = useCallback(async (alias: string) => {
    await keycloakAuthenticationService.deleteRequiredAction(alias, realm);
    await load();
  }, [realm, load]);

  const raisePriority = useCallback(async (alias: string) => {
    await keycloakAuthenticationService.raiseRequiredActionPriority(alias, realm);
    await load();
  }, [realm, load]);

  const lowerPriority = useCallback(async (alias: string) => {
    await keycloakAuthenticationService.lowerRequiredActionPriority(alias, realm);
    await load();
  }, [realm, load]);

  const registerAction = useCallback(async (providerId: string, name: string) => {
    await keycloakAuthenticationService.registerRequiredAction({ providerId, name }, realm);
    await load();
  }, [realm, load]);

  return {
    actions, unregistered, loading, error, reload: load,
    updateAction, deleteAction, raisePriority, lowerPriority, registerAction,
  };
}

// ─────────────────────────────────────────────────────────────
// 5. Hook : Politique de mot de passe
// ─────────────────────────────────────────────────────────────
export function usePasswordPolicy(realm: string = getRealm()) {
  const [rawPolicy, setRawPolicy] = useState('');
  const [rules,     setRules]     = useState<PasswordPolicyRule[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const realm_data = await keycloakRealmsService.getByName(realm);
      const policy = (realm_data as any)?.passwordPolicy ?? '';
      setRawPolicy(policy);
      setRules(parsePasswordPolicy(policy));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement politique MDP');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newRules: PasswordPolicyRule[]) => {
    setSaving(true); setError(null);
    try {
      const policyStr = buildPasswordPolicy(newRules);
      await keycloakRealmsService.update(realm, { passwordPolicy: policyStr });
      setRawPolicy(policyStr);
      setRules(newRules);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde politique MDP');
      throw e;
    } finally { setSaving(false); }
  }, [realm]);

  return { rawPolicy, rules, loading, saving, error, reload: load, save };
}

// ─────────────────────────────────────────────────────────────
// 6. Hook : Politique OTP
// ─────────────────────────────────────────────────────────────
export function useOtpPolicy(realm: string = getRealm()) {
  const [policy,  setPolicy]  = useState<OtpPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await keycloakRealmsService.getByName(realm) as any;
      setPolicy({
        otpPolicyType:            data.otpPolicyType            ?? 'totp',
        otpPolicyAlgorithm:       data.otpPolicyAlgorithm       ?? 'HmacSHA1',
        otpPolicyDigits:          data.otpPolicyDigits          ?? 6,
        otpPolicyLookAheadWindow: data.otpPolicyLookAheadWindow ?? 1,
        otpPolicyPeriod:          data.otpPolicyPeriod          ?? 30,
        otpPolicyInitialCounter:  data.otpPolicyInitialCounter  ?? 0,
        otpPolicyCodeReusable:    data.otpPolicyCodeReusable    ?? false,
        otpSupportedApplications: data.otpSupportedApplications ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement politique OTP');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (payload: Partial<OtpPolicy>) => {
    setSaving(true); setError(null);
    try {
      await keycloakRealmsService.update(realm, payload as any);
      setPolicy(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde politique OTP');
      throw e;
    } finally { setSaving(false); }
  }, [realm]);

  return { policy, loading, saving, error, reload: load, save };
}

// ─────────────────────────────────────────────────────────────
// 7. Hook : Politique WebAuthn
// ─────────────────────────────────────────────────────────────
export function useWebAuthnPolicy(realm: string = getRealm()) {
  const [policy,       setPolicy]       = useState<WebAuthnPolicy | null>(null);
  const [policyPwless, setPolicyPwless] = useState<WebAuthnPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await keycloakRealmsService.getByName(realm) as any;
      setPolicy({
        rpEntityName:                    d.webAuthnPolicyRpEntityName                    ?? '',
        rpId:                            d.webAuthnPolicyRpId                            ?? '',
        signatureAlgorithms:             d.webAuthnPolicySignatureAlgorithms             ?? ['ES256'],
        attestationConveyancePreference: d.webAuthnPolicyAttestationConveyancePreference ?? 'not specified',
        authenticatorAttachment:         d.webAuthnPolicyAuthenticatorAttachment         ?? 'not specified',
        requireResidentKey:              d.webAuthnPolicyRequireResidentKey              ?? 'not specified',
        userVerificationRequirement:     d.webAuthnPolicyUserVerificationRequirement     ?? 'not specified',
        createTimeout:                   d.webAuthnPolicyCreateTimeout                   ?? 0,
        avoidSameAuthenticatorRegister:  d.webAuthnPolicyAvoidSameAuthenticatorRegister  ?? false,
        acceptableAaguids:               d.webAuthnPolicyAcceptableAaguids               ?? [],
        extraOrigins:                    d.webAuthnPolicyExtraOrigins                    ?? [],
      });
      setPolicyPwless({
        rpEntityName:                    d.webAuthnPolicyPasswordlessRpEntityName                    ?? '',
        rpId:                            d.webAuthnPolicyPasswordlessRpId                            ?? '',
        signatureAlgorithms:             d.webAuthnPolicyPasswordlessSignatureAlgorithms             ?? ['ES256'],
        attestationConveyancePreference: d.webAuthnPolicyPasswordlessAttestationConveyancePreference ?? 'not specified',
        authenticatorAttachment:         d.webAuthnPolicyPasswordlessAuthenticatorAttachment         ?? 'not specified',
        requireResidentKey:              d.webAuthnPolicyPasswordlessRequireResidentKey              ?? 'not specified',
        userVerificationRequirement:     d.webAuthnPolicyPasswordlessUserVerificationRequirement     ?? 'not specified',
        createTimeout:                   d.webAuthnPolicyPasswordlessCreateTimeout                   ?? 0,
        avoidSameAuthenticatorRegister:  d.webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister  ?? false,
        acceptableAaguids:               d.webAuthnPolicyPasswordlessAcceptableAaguids               ?? [],
        extraOrigins:                    d.webAuthnPolicyPasswordlessExtraOrigins                    ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement politique WebAuthn');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const saveStandard = useCallback(async (payload: Partial<WebAuthnPolicy>) => {
    setSaving(true); setError(null);
    try {
      const kcPayload: any = {};
      if (payload.rpEntityName                    !== undefined) kcPayload.webAuthnPolicyRpEntityName                    = payload.rpEntityName;
      if (payload.rpId                            !== undefined) kcPayload.webAuthnPolicyRpId                            = payload.rpId;
      if (payload.signatureAlgorithms             !== undefined) kcPayload.webAuthnPolicySignatureAlgorithms             = payload.signatureAlgorithms;
      if (payload.attestationConveyancePreference !== undefined) kcPayload.webAuthnPolicyAttestationConveyancePreference = payload.attestationConveyancePreference;
      if (payload.authenticatorAttachment         !== undefined) kcPayload.webAuthnPolicyAuthenticatorAttachment         = payload.authenticatorAttachment;
      if (payload.requireResidentKey              !== undefined) kcPayload.webAuthnPolicyRequireResidentKey              = payload.requireResidentKey;
      if (payload.userVerificationRequirement     !== undefined) kcPayload.webAuthnPolicyUserVerificationRequirement     = payload.userVerificationRequirement;
      if (payload.createTimeout                   !== undefined) kcPayload.webAuthnPolicyCreateTimeout                   = payload.createTimeout;
      if (payload.avoidSameAuthenticatorRegister  !== undefined) kcPayload.webAuthnPolicyAvoidSameAuthenticatorRegister  = payload.avoidSameAuthenticatorRegister;
      if (payload.acceptableAaguids               !== undefined) kcPayload.webAuthnPolicyAcceptableAaguids               = payload.acceptableAaguids;
      if (payload.extraOrigins                    !== undefined) kcPayload.webAuthnPolicyExtraOrigins                    = payload.extraOrigins;
      await keycloakRealmsService.update(realm, kcPayload);
      setPolicy(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde WebAuthn'); throw e;
    } finally { setSaving(false); }
  }, [realm]);

  const savePasswordless = useCallback(async (payload: Partial<WebAuthnPolicy>) => {
    setSaving(true); setError(null);
    try {
      const kcPayload: any = {};
      if (payload.rpEntityName                    !== undefined) kcPayload.webAuthnPolicyPasswordlessRpEntityName                    = payload.rpEntityName;
      if (payload.rpId                            !== undefined) kcPayload.webAuthnPolicyPasswordlessRpId                            = payload.rpId;
      if (payload.signatureAlgorithms             !== undefined) kcPayload.webAuthnPolicyPasswordlessSignatureAlgorithms             = payload.signatureAlgorithms;
      if (payload.attestationConveyancePreference !== undefined) kcPayload.webAuthnPolicyPasswordlessAttestationConveyancePreference = payload.attestationConveyancePreference;
      if (payload.authenticatorAttachment         !== undefined) kcPayload.webAuthnPolicyPasswordlessAuthenticatorAttachment         = payload.authenticatorAttachment;
      if (payload.requireResidentKey              !== undefined) kcPayload.webAuthnPolicyPasswordlessRequireResidentKey              = payload.requireResidentKey;
      if (payload.userVerificationRequirement     !== undefined) kcPayload.webAuthnPolicyPasswordlessUserVerificationRequirement     = payload.userVerificationRequirement;
      if (payload.createTimeout                   !== undefined) kcPayload.webAuthnPolicyPasswordlessCreateTimeout                   = payload.createTimeout;
      if (payload.avoidSameAuthenticatorRegister  !== undefined) kcPayload.webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister  = payload.avoidSameAuthenticatorRegister;
      if (payload.acceptableAaguids               !== undefined) kcPayload.webAuthnPolicyPasswordlessAcceptableAaguids               = payload.acceptableAaguids;
      if (payload.extraOrigins                    !== undefined) kcPayload.webAuthnPolicyPasswordlessExtraOrigins                    = payload.extraOrigins;
      await keycloakRealmsService.update(realm, kcPayload);
      setPolicyPwless(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde WebAuthn Passwordless'); throw e;
    } finally { setSaving(false); }
  }, [realm]);

  return { policy, policyPwless, loading, saving, error, reload: load, saveStandard, savePasswordless };
}

// ─────────────────────────────────────────────────────────────
// 8. Hook : Liaisons (Bindings)
// ─────────────────────────────────────────────────────────────
export function useAuthBindings(realm: string = getRealm()) {
  const [bindings, setBindings] = useState<BindingsConfig | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await keycloakRealmsService.getByName(realm) as any;
      setBindings({
        browserFlow:              d.browserFlow              ?? '',
        registrationFlow:         d.registrationFlow         ?? '',
        directGrantFlow:          d.directGrantFlow          ?? '',
        resetCredentialsFlow:     d.resetCredentialsFlow     ?? '',
        clientAuthenticationFlow: d.clientAuthenticationFlow ?? '',
        dockerAuthenticationFlow: d.dockerAuthenticationFlow ?? '',
        firstBrokerLoginFlow:     d.firstBrokerLoginFlow     ?? '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement liaisons');
    } finally { setLoading(false); }
  }, [realm]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (payload: Partial<BindingsConfig>) => {
    setSaving(true); setError(null);
    try {
      await keycloakRealmsService.update(realm, payload as any);
      setBindings(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde liaisons'); throw e;
    } finally { setSaving(false); }
  }, [realm]);

  return { bindings, loading, saving, error, reload: load, save };
}

// ─────────────────────────────────────────────────────────────
// 9. Hook : Config d'un authenticator
// ─────────────────────────────────────────────────────────────
export function useAuthenticatorConfig(configId: string, realm: string = getRealm()) {
  const [config,  setConfig]  = useState<AuthenticatorConfigRepresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!configId) return;
    setLoading(true); setError(null);
    try {
      const data = await keycloakAuthenticationService.getConfig(configId, realm);
      setConfig(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur chargement config');
    } finally { setLoading(false); }
  }, [configId, realm]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (payload: Partial<AuthenticatorConfigRepresentation>) => {
    if (!configId) return;
    setSaving(true); setError(null);
    try {
      await keycloakAuthenticationService.updateConfig(configId, payload, realm);
      setConfig(prev => prev ? { ...prev, ...payload } : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur sauvegarde config'); throw e;
    } finally { setSaving(false); }
  }, [configId, realm]);

  return { config, loading, saving, error, reload: load, save };
}
