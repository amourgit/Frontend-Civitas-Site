// ============================================================
// services/iam/keycloakAuthenticationService.ts
// Service complet — Gestion de l'Authentification Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/authentication/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (36 au total) :
//
// ── PROVIDERS ────────────────────────────────────────────────
//   GET    /authentication/authenticator-providers            → listAuthenticatorProviders()
//   GET    /authentication/client-authenticator-providers     → listClientAuthenticatorProviders()
//   GET    /authentication/form-action-providers              → listFormActionProviders()
//   GET    /authentication/form-providers                     → listFormProviders()
//   GET    /authentication/per-client-config-description      → getPerClientConfigDescription()
//
// ── CONFIGURATION AUTHENTICATOR ─────────────────────────────
//   GET    /authentication/config-description/{providerId}    → getConfigDescription()
//   DELETE /authentication/config/{id}                        → deleteConfig()
//   GET    /authentication/config/{id}                        → getConfig()
//   PUT    /authentication/config/{id}                        → updateConfig()
//   POST   /authentication/config                             → createConfig()
//
// ── EXÉCUTIONS ───────────────────────────────────────────────
//   GET    /authentication/executions/{executionId}/config/{id}       → getExecutionConfig()
//   POST   /authentication/executions/{executionId}/config            → addExecutionConfig()
//   DELETE /authentication/executions/{executionId}                   → deleteExecution()
//   GET    /authentication/executions/{executionId}                   → getExecution()
//   POST   /authentication/executions/{executionId}/lower-priority    → lowerExecutionPriority()
//   POST   /authentication/executions/{executionId}/raise-priority    → raiseExecutionPriority()
//   POST   /authentication/executions                                  → addExecution()
//
// ── FLUX D'AUTHENTIFICATION (FLOWS) ──────────────────────────
//   POST   /authentication/flows/{flowAlias}/copy             → copyFlow()
//   POST   /authentication/flows/{flowAlias}/executions/execution → addFlowExecution()
//   POST   /authentication/flows/{flowAlias}/executions/flow  → addFlowExecutionFlow()
//   GET    /authentication/flows/{flowAlias}/executions        → listFlowExecutions()
//   PUT    /authentication/flows/{flowAlias}/executions        → updateFlowExecutions()
//   GET    /authentication/flows                               → listFlows()
//   DELETE /authentication/flows/{id}                          → deleteFlow()
//   GET    /authentication/flows/{id}                          → getFlow()
//   PUT    /authentication/flows/{id}                          → updateFlow()
//   POST   /authentication/flows                               → createFlow()
//
// ── ACTIONS REQUISES ─────────────────────────────────────────
//   GET    /authentication/required-actions                    → listRequiredActions()
//   POST   /authentication/register-required-action            → registerRequiredAction()
//   DELETE /authentication/required-actions/{alias}/config     → deleteRequiredActionConfig()
//   GET    /authentication/required-actions/{alias}/config-description → getRequiredActionConfigDescription()
//   GET    /authentication/required-actions/{alias}/config     → getRequiredActionConfig()
//   PUT    /authentication/required-actions/{alias}/config     → updateRequiredActionConfig()
//   DELETE /authentication/required-actions/{alias}            → deleteRequiredAction()
//   GET    /authentication/required-actions/{alias}            → getRequiredAction()
//   POST   /authentication/required-actions/{alias}/lower-priority → lowerRequiredActionPriority()
//   PUT    /authentication/required-actions/{alias}            → updateRequiredAction()
//   POST   /authentication/required-actions/{alias}/raise-priority → raiseRequiredActionPriority()
//   GET    /authentication/unregistered-required-actions       → listUnregisteredRequiredActions()
//
// Authentification : Bearer token via httpClient (tokenManager)
// Base URL         : NEXT_PUBLIC_KEYCLOAK_URL + /admin/realms/{realm}
// ============================================================

import { z }          from 'zod';
import { httpClient } from '@/lib/http-client';
import { adminBase as _adminBaseResolver } from './_realmHelper';

// ── URL de base Keycloak ──────────────────────────────────────

/**
 * Retourne l'URL Admin REST API — realm extrait dynamiquement du sous-domaine.
 */
function adminBase(realm?: string): string {
  return _adminBaseResolver(realm);
}

// ── Schémas Zod ───────────────────────────────────────────────

const AuthenticatorConfigInfoRepresentationSchema = z.object({
  name:        z.string().optional(),
  providerId:  z.string().optional(),
  helpText:    z.string().optional(),
  properties:  z.array(z.record(z.unknown())).optional(),
}).passthrough();

const AuthenticatorConfigRepresentationSchema = z.object({
  id:     z.string().optional(),
  alias:  z.string().optional(),
  config: z.record(z.string()).optional(),
}).passthrough();

const AuthenticationExecutionInfoRepresentationSchema = z.object({
  id:                     z.string().optional(),
  requirement:            z.string().optional(),
  displayName:            z.string().optional(),
  alias:                  z.string().optional(),
  description:            z.string().optional(),
  requirementChoices:     z.array(z.string()).optional(),
  configurable:           z.boolean().optional(),
  authenticationFlow:     z.boolean().optional(),
  providerId:             z.string().optional(),
  authenticationConfig:   z.string().optional(),
  flowId:                 z.string().optional(),
  level:                  z.number().optional(),
  index:                  z.number().optional(),
  priority:               z.number().optional(),
}).passthrough();

const AuthenticationExecutionRepresentationSchema = z.object({
  id:                   z.string().optional(),
  authenticator:        z.string().optional(),
  authenticatorConfig:  z.string().optional(),
  authenticatorFlow:    z.boolean().optional(),
  flowId:               z.string().optional(),
  parentFlow:           z.string().optional(),
  priority:             z.number().optional(),
  requirement:          z.string().optional(),
}).passthrough();

const AuthenticationFlowRepresentationSchema = z.object({
  id:              z.string().optional(),
  alias:           z.string().optional(),
  description:     z.string().optional(),
  providerId:      z.string().optional(),
  topLevel:        z.boolean().optional(),
  builtIn:         z.boolean().optional(),
  authenticationExecutions: z.array(z.record(z.unknown())).optional(),
}).passthrough();

const RequiredActionProviderRepresentationSchema = z.object({
  alias:            z.string().optional(),
  name:             z.string().optional(),
  providerId:       z.string().optional(),
  enabled:          z.boolean().optional(),
  defaultAction:    z.boolean().optional(),
  priority:         z.number().optional(),
  config:           z.record(z.string()).optional(),
}).passthrough();

const RequiredActionConfigInfoRepresentationSchema = z.object({
  name:       z.string().optional(),
  providerId: z.string().optional(),
  helpText:   z.string().optional(),
  properties: z.array(z.record(z.unknown())).optional(),
}).passthrough();

const RequiredActionConfigRepresentationSchema = z.object({
  alias:  z.string().optional(),
  config: z.record(z.string()).optional(),
}).passthrough();

// Types exportés
export type AuthenticatorConfigInfoRepresentation = z.infer<typeof AuthenticatorConfigInfoRepresentationSchema>;
export type AuthenticatorConfigRepresentation = z.infer<typeof AuthenticatorConfigRepresentationSchema>;
export type AuthenticationExecutionInfoRepresentation = z.infer<typeof AuthenticationExecutionInfoRepresentationSchema>;
export type AuthenticationExecutionRepresentation = z.infer<typeof AuthenticationExecutionRepresentationSchema>;
export type AuthenticationFlowRepresentation = z.infer<typeof AuthenticationFlowRepresentationSchema>;
export type RequiredActionProviderRepresentation = z.infer<typeof RequiredActionProviderRepresentationSchema>;
export type RequiredActionConfigRepresentation = z.infer<typeof RequiredActionConfigRepresentationSchema>;
export type RequiredActionConfigInfoRepresentation = z.infer<typeof RequiredActionConfigInfoRepresentationSchema>;

// Payloads
export interface CreateAuthenticatorConfigPayload {
  alias:  string;
  config?: Record<string, string>;
}

export interface CopyFlowPayload {
  newName: string;
}

export interface AddFlowExecutionPayload {
  provider: string;
}

export interface AddFlowExecutionFlowPayload {
  alias:       string;
  type:        string;
  description?: string;
  provider?:   string;
}

export interface RegisterRequiredActionPayload {
  providerId?: string;
  name?:       string;
}

export interface UpdateRequiredActionPayload {
  alias?:         string;
  name?:          string;
  enabled?:       boolean;
  defaultAction?: boolean;
  priority?:      number;
  config?:        Record<string, string>;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractAuthenticationError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un flux ou une configuration avec ce nom existe déjà';
    if (msg.includes('404')) return 'Ressource introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Données invalides';
    return msg || fallback;
  }
  return fallback;
}

// ── Wrapper interne ───────────────────────────────────────────
const kc = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return httpClient.get<T>(url, params);
  },
  async post<T>(url: string, body: unknown): Promise<T> {
    return httpClient.post<T>(url, body);
  },
  async put<T>(url: string, body: unknown): Promise<T> {
    return httpClient.put<T>(url, body);
  },
  async delete<T>(url: string): Promise<T> {
    return httpClient.delete<T>(url);
  },
};

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakAuthenticationService = {

  // ─────────────────────────────────────────────────────────
  // 1. PROVIDERS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/authentication/authenticator-providers
   * Retourne la liste de tous les providers d'authentification disponibles.
   */
  async listAuthenticatorProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/authenticator-providers`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/authentication/client-authenticator-providers
   * Retourne la liste de tous les providers d'authentification client disponibles.
   */
  async listClientAuthenticatorProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/client-authenticator-providers`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/authentication/form-action-providers
   * Retourne la liste des providers d'action de formulaire.
   */
  async listFormActionProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/form-action-providers`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/authentication/form-providers
   * Retourne la liste des providers de formulaire.
   */
  async listFormProviders(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/form-providers`
    );
    return Array.isArray(data) ? data : [];
  },

  /**
   * GET /admin/realms/{realm}/authentication/per-client-config-description
   * Retourne la description de configuration par client.
   * Retourne Map<String, List<ConfigPropertyRepresentation>>.
   */
  async getPerClientConfigDescription(
    realm?: string
  ): Promise<Record<string, unknown[]>> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/per-client-config-description`
    );
    return (data as Record<string, unknown[]>) ?? {};
  },

  // ─────────────────────────────────────────────────────────
  // 2. CONFIGURATION AUTHENTICATOR
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/authentication/config-description/{providerId}
   * Retourne la description de configuration d'un provider.
   */
  async getConfigDescription(
    providerId: string,
    realm?: string
  ): Promise<AuthenticatorConfigInfoRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/config-description/${encodeURIComponent(providerId)}`
    );
    return safe(AuthenticatorConfigInfoRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/authentication/config/{id}
   * Retourne la configuration d'un authenticator par son ID.
   */
  async getConfig(
    id: string,
    realm?: string
  ): Promise<AuthenticatorConfigRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/config/${encodeURIComponent(id)}`
    );
    return safe(AuthenticatorConfigRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/authentication/config
   * Crée une nouvelle configuration d'authenticator.
   * Retourne 201 Created.
   */
  async createConfig(
    payload: CreateAuthenticatorConfigPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/config`,
      payload
    );
  },

  /**
   * PUT /admin/realms/{realm}/authentication/config/{id}
   * Met à jour la configuration d'un authenticator.
   * Retourne 204 No Content.
   */
  async updateConfig(
    id: string,
    payload: Partial<AuthenticatorConfigRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/authentication/config/${encodeURIComponent(id)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/authentication/config/{id}
   * Supprime la configuration d'un authenticator.
   * Retourne 204 No Content.
   */
  async deleteConfig(
    id: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/authentication/config/${encodeURIComponent(id)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. EXÉCUTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/authentication/executions/{executionId}/config/{id}
   * Retourne la configuration associée à une exécution spécifique.
   */
  async getExecutionConfig(
    executionId: string,
    id: string,
    realm?: string
  ): Promise<AuthenticatorConfigRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}/config/${encodeURIComponent(id)}`
    );
    return safe(AuthenticatorConfigRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/authentication/executions/{executionId}/config
   * Crée une configuration pour une exécution spécifique.
   * Retourne 201 Created.
   */
  async addExecutionConfig(
    executionId: string,
    payload: CreateAuthenticatorConfigPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}/config`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/executions/{executionId}
   * Retourne les détails d'une exécution d'authentification.
   */
  async getExecution(
    executionId: string,
    realm?: string
  ): Promise<AuthenticationExecutionRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}`
    );
    return safe(AuthenticationExecutionRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/authentication/executions
   * Ajoute une nouvelle exécution d'authentification.
   * Retourne 201 Created.
   */
  async addExecution(
    payload: Partial<AuthenticationExecutionRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/executions`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/authentication/executions/{executionId}
   * Supprime une exécution d'authentification.
   * Retourne 204 No Content.
   */
  async deleteExecution(
    executionId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}`
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/executions/{executionId}/lower-priority
   * Diminue la priorité d'une exécution (la déplace vers le bas).
   * Retourne 204 No Content.
   */
  async lowerExecutionPriority(
    executionId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}/lower-priority`,
      {}
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/executions/{executionId}/raise-priority
   * Augmente la priorité d'une exécution (la déplace vers le haut).
   * Retourne 204 No Content.
   */
  async raiseExecutionPriority(
    executionId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/executions/${encodeURIComponent(executionId)}/raise-priority`,
      {}
    );
  },

  // ─────────────────────────────────────────────────────────
  // 4. FLUX D'AUTHENTIFICATION (FLOWS)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/authentication/flows
   * Retourne la liste de tous les flux d'authentification du realm.
   */
  async listFlows(
    realm?: string
  ): Promise<AuthenticationFlowRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/flows`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(AuthenticationFlowRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/authentication/flows
   * Crée un nouveau flux d'authentification.
   * Retourne 201 Created.
   */
  async createFlow(
    payload: Partial<AuthenticationFlowRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/flows`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/flows/{id}
   * Retourne les détails d'un flux d'authentification par son ID.
   */
  async getFlow(
    id: string,
    realm?: string
  ): Promise<AuthenticationFlowRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(id)}`
    );
    return safe(AuthenticationFlowRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/authentication/flows/{id}
   * Met à jour un flux d'authentification existant.
   * Retourne 204 No Content.
   */
  async updateFlow(
    id: string,
    payload: Partial<AuthenticationFlowRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(id)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/authentication/flows/{id}
   * Supprime un flux d'authentification.
   * Retourne 204 No Content.
   */
  async deleteFlow(
    id: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(id)}`
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/flows/{flowAlias}/copy
   * Copie un flux d'authentification existant sous un nouveau nom.
   * Retourne 201 Created.
   */
  async copyFlow(
    flowAlias: string,
    payload: CopyFlowPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(flowAlias)}/copy`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/flows/{flowAlias}/executions
   * Retourne toutes les exécutions d'un flux d'authentification.
   */
  async listFlowExecutions(
    flowAlias: string,
    realm?: string
  ): Promise<AuthenticationExecutionInfoRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(flowAlias)}/executions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(AuthenticationExecutionInfoRepresentationSchema, d));
  },

  /**
   * PUT /admin/realms/{realm}/authentication/flows/{flowAlias}/executions
   * Met à jour les exécutions d'un flux d'authentification.
   * Retourne 204 No Content.
   */
  async updateFlowExecutions(
    flowAlias: string,
    payload: Partial<AuthenticationExecutionInfoRepresentation>,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(flowAlias)}/executions`,
      payload
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/flows/{flowAlias}/executions/execution
   * Ajoute une nouvelle exécution (authenticator) dans un flux.
   * Retourne 201 Created.
   */
  async addFlowExecution(
    flowAlias: string,
    payload: AddFlowExecutionPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(flowAlias)}/executions/execution`,
      payload
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/flows/{flowAlias}/executions/flow
   * Ajoute un sous-flux dans un flux existant.
   * Retourne 201 Created.
   */
  async addFlowExecutionFlow(
    flowAlias: string,
    payload: AddFlowExecutionFlowPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/flows/${encodeURIComponent(flowAlias)}/executions/flow`,
      payload
    );
  },

  // ─────────────────────────────────────────────────────────
  // 5. ACTIONS REQUISES (REQUIRED ACTIONS)
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/authentication/required-actions
   * Retourne la liste de toutes les actions requises du realm.
   */
  async listRequiredActions(
    realm?: string
  ): Promise<RequiredActionProviderRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/required-actions`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RequiredActionProviderRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/authentication/register-required-action
   * Enregistre une nouvelle action requise.
   * Retourne 204 No Content.
   */
  async registerRequiredAction(
    payload: RegisterRequiredActionPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/register-required-action`,
      payload
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/required-actions/{alias}
   * Retourne les détails d'une action requise par son alias.
   */
  async getRequiredAction(
    alias: string,
    realm?: string
  ): Promise<RequiredActionProviderRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}`
    );
    return safe(RequiredActionProviderRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/authentication/required-actions/{alias}
   * Met à jour une action requise.
   * Retourne 204 No Content.
   */
  async updateRequiredAction(
    alias: string,
    payload: UpdateRequiredActionPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/authentication/required-actions/{alias}
   * Supprime une action requise.
   * Retourne 204 No Content.
   */
  async deleteRequiredAction(
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}`
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/required-actions/{alias}/lower-priority
   * Diminue la priorité d'une action requise.
   * Retourne 204 No Content.
   */
  async lowerRequiredActionPriority(
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/lower-priority`,
      {}
    );
  },

  /**
   * POST /admin/realms/{realm}/authentication/required-actions/{alias}/raise-priority
   * Augmente la priorité d'une action requise.
   * Retourne 204 No Content.
   */
  async raiseRequiredActionPriority(
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/raise-priority`,
      {}
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/required-actions/{alias}/config-description
   * Retourne la description de configuration d'une action requise.
   */
  async getRequiredActionConfigDescription(
    alias: string,
    realm?: string
  ): Promise<RequiredActionConfigInfoRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/config-description`
    );
    return safe(RequiredActionConfigInfoRepresentationSchema, data);
  },

  /**
   * GET /admin/realms/{realm}/authentication/required-actions/{alias}/config
   * Retourne la configuration d'une action requise.
   */
  async getRequiredActionConfig(
    alias: string,
    realm?: string
  ): Promise<RequiredActionConfigRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/config`
    );
    return safe(RequiredActionConfigRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/authentication/required-actions/{alias}/config
   * Met à jour la configuration d'une action requise.
   * Retourne 204 No Content.
   */
  async updateRequiredActionConfig(
    alias: string,
    payload: RequiredActionConfigRepresentation,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/config`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/authentication/required-actions/{alias}/config
   * Supprime la configuration d'une action requise.
   * Retourne 204 No Content.
   */
  async deleteRequiredActionConfig(
    alias: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/authentication/required-actions/${encodeURIComponent(alias)}/config`
    );
  },

  /**
   * GET /admin/realms/{realm}/authentication/unregistered-required-actions
   * Retourne la liste des actions requises non encore enregistrées dans le realm.
   */
  async listUnregisteredRequiredActions(
    realm?: string
  ): Promise<unknown[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/authentication/unregistered-required-actions`
    );
    return Array.isArray(data) ? data : [];
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakAuthenticationService;
