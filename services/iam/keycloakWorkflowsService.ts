// ============================================================
// services/iam/keycloakWorkflowsService.ts
// Service complet — Gestion des Workflows Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/workflows/*
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (9 au total) :
//   GET    /workflows                                                   → list()
//   POST   /workflows                                                   → create()
//   GET    /workflows/{id}                                              → getById()
//   PUT    /workflows/{id}                                              → update()
//   DELETE /workflows/{id}                                              → delete()
//   POST   /workflows/{id}/activate/{type}/{resourceId}                 → activate()
//   POST   /workflows/{id}/deactivate/{type}/{resourceId}               → deactivate()
//   POST   /workflows/migrate                                           → migrate()
//   GET    /workflows/scheduled/{resource-id}                           → getScheduled()
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

const WorkflowScheduleRepresentationSchema = z.object({
  id:          z.string().optional(),
  type:        z.string().optional(),
  resourceId:  z.string().optional(),
  scheduledAt: z.string().optional(),
}).passthrough();

const WorkflowStepRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  type:        z.string().optional(),
  config:      z.record(z.unknown()).optional(),
}).passthrough();

const WorkflowRepresentationSchema = z.object({
  id:           z.string().optional(),
  alias:        z.string().optional(),
  description:  z.string().optional(),
  enabled:      z.boolean().optional(),
  steps:        z.array(WorkflowStepRepresentationSchema).optional(),
  schedule:     WorkflowScheduleRepresentationSchema.optional(),
}).passthrough();

const WorkflowStateRepresentationSchema = z.object({
  workflowId:  z.string().optional(),
  resourceId:  z.string().optional(),
  type:        z.string().optional(),
  state:       z.string().optional(),
  startedAt:   z.string().optional(),
}).passthrough();

export type WorkflowRepresentation       = z.infer<typeof WorkflowRepresentationSchema>;
export type WorkflowScheduleRepresentation = z.infer<typeof WorkflowScheduleRepresentationSchema>;
export type WorkflowStateRepresentation  = z.infer<typeof WorkflowStateRepresentationSchema>;

export interface CreateWorkflowPayload {
  alias:        string;
  description?: string;
  enabled?:     boolean;
  steps?:       Array<{ name: string; type: string; config?: Record<string, unknown> }>;
}

export interface UpdateWorkflowPayload extends Partial<CreateWorkflowPayload> {
  id?: string;
}

export interface WorkflowsListFilters {
  first?:  number;
  max?:    number;
  search?: string;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractWorkflowError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un workflow avec cet alias existe déjà';
    if (msg.includes('404')) return 'Workflow introuvable';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('400')) return 'Configuration de workflow invalide';
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

export const keycloakWorkflowsService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD WORKFLOWS
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/workflows
   * Retourne la liste des workflows du realm.
   */
  async list(
    filters: WorkflowsListFilters = {},
    realm?: string
  ): Promise<WorkflowRepresentation[]> {
    const params: Record<string, unknown> = {};
    if (filters.first  !== undefined) params.first  = filters.first;
    if (filters.max    !== undefined) params.max    = filters.max;
    if (filters.search)               params.search = filters.search;

    const data = await kc.get<unknown[]>(`${adminBase(realm)}/workflows`, params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(WorkflowRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/workflows
   * Crée un nouveau workflow.
   * Retourne 201 Created.
   */
  async create(
    payload: CreateWorkflowPayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/workflows`, payload);
  },

  /**
   * GET /admin/realms/{realm}/workflows/{id}
   * Retourne les détails d'un workflow par son ID.
   */
  async getById(
    id: string,
    realm?: string
  ): Promise<WorkflowRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/workflows/${encodeURIComponent(id)}`
    );
    return safe(WorkflowRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/workflows/{id}
   * Met à jour un workflow existant.
   * Retourne 204 No Content.
   */
  async update(
    id: string,
    payload: UpdateWorkflowPayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/workflows/${encodeURIComponent(id)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/workflows/{id}
   * Supprime un workflow.
   * Retourne 204 No Content.
   */
  async delete(
    id: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/workflows/${encodeURIComponent(id)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. ACTIVATION / DÉSACTIVATION
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/workflows/{id}/activate/{type}/{resourceId}
   * Active un workflow pour une ressource spécifique.
   * @param id          ID du workflow
   * @param type        Type de ressource (ex: 'user', 'client', 'group')
   * @param resourceId  ID de la ressource cible
   * Retourne 204 No Content.
   */
  async activate(
    id: string,
    type: string,
    resourceId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/workflows/${encodeURIComponent(id)}/activate/${encodeURIComponent(type)}/${encodeURIComponent(resourceId)}`,
      {}
    );
  },

  /**
   * POST /admin/realms/{realm}/workflows/{id}/deactivate/{type}/{resourceId}
   * Désactive un workflow pour une ressource spécifique.
   * @param id          ID du workflow
   * @param type        Type de ressource (ex: 'user', 'client', 'group')
   * @param resourceId  ID de la ressource cible
   * Retourne 204 No Content.
   */
  async deactivate(
    id: string,
    type: string,
    resourceId: string,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(
      `${adminBase(realm)}/workflows/${encodeURIComponent(id)}/deactivate/${encodeURIComponent(type)}/${encodeURIComponent(resourceId)}`,
      {}
    );
  },

  // ─────────────────────────────────────────────────────────
  // 3. MIGRATION & PLANIFICATION
  // ─────────────────────────────────────────────────────────

  /**
   * POST /admin/realms/{realm}/workflows/migrate
   * Migre les workflows depuis une ancienne configuration vers la nouvelle.
   * Retourne une Map<String, String> avec le résultat de la migration.
   */
  async migrate(
    realm?: string
  ): Promise<Record<string, string>> {
    const data = await kc.post<unknown>(
      `${adminBase(realm)}/workflows/migrate`,
      {}
    );
    return (data as Record<string, string>) ?? {};
  },

  /**
   * GET /admin/realms/{realm}/workflows/scheduled/{resource-id}
   * Retourne les exécutions planifiées d'un workflow pour une ressource donnée.
   * @param resourceId  ID de la ressource (user, client, etc.)
   */
  async getScheduled(
    resourceId: string,
    realm?: string
  ): Promise<WorkflowStateRepresentation[]> {
    const data = await kc.get<unknown[]>(
      `${adminBase(realm)}/workflows/scheduled/${encodeURIComponent(resourceId)}`
    );
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(WorkflowStateRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 4. UTILITAIRES COMPOSÉS
  // ─────────────────────────────────────────────────────────

  /**
   * Active ou désactive un workflow (champ enabled).
   */
  async setEnabled(
    id: string,
    enabled: boolean,
    realm?: string
  ): Promise<void> {
    return keycloakWorkflowsService.update(id, { enabled }, realm);
  },

  /**
   * Retourne uniquement les workflows actifs.
   */
  async listEnabled(
    realm?: string
  ): Promise<WorkflowRepresentation[]> {
    const workflows = await keycloakWorkflowsService.list({}, realm);
    return workflows.filter((w) => w.enabled === true);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakWorkflowsService;
