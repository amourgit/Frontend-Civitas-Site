// ============================================================
// services/iam/keycloakClientScopesService.ts
// Service complet — Gestion des Client Scopes Keycloak Admin REST API v26
//
// Couvre TOUS les endpoints /admin/realms/{realm}/client-scopes/*
// et /admin/realms/{realm}/client-templates/* (alias déprécié)
// ainsi que leurs protocol-mappers et scope-mappings associés.
// selon la documentation officielle Keycloak 26.6.1
//
// Endpoints couverts (42 au total) :
//
// ── CRUD CLIENT SCOPES ───────────────────────────────────────
//   GET    /client-scopes                                        → list()
//   POST   /client-scopes                                        → create()
//   GET    /client-scopes/{client-scope-id}                      → getById()
//   PUT    /client-scopes/{client-scope-id}                      → update()
//   DELETE /client-scopes/{client-scope-id}                      → delete()
//
// ── CLIENT TEMPLATES (alias déprécié pour client-scopes) ─────
//   GET    /client-templates                                      → listTemplates()
//   POST   /client-templates                                      → createTemplate()
//   GET    /client-templates/{client-scope-id}                   → getTemplate()
//   PUT    /client-templates/{client-scope-id}                   → updateTemplate()
//   DELETE /client-templates/{client-scope-id}                   → deleteTemplate()
//
// ── PROTOCOL MAPPERS (client-scopes) ─────────────────────────
//   GET    /client-scopes/{id}/protocol-mappers/models           → listProtocolMappers()
//   GET    /client-scopes/{id}/protocol-mappers/models/{id}      → getProtocolMapper()
//   POST   /client-scopes/{id}/protocol-mappers/models           → createProtocolMapper()
//   POST   /client-scopes/{id}/protocol-mappers/add-models       → createProtocolMappers()
//   PUT    /client-scopes/{id}/protocol-mappers/models/{id}      → updateProtocolMapper()
//   DELETE /client-scopes/{id}/protocol-mappers/models/{id}      → deleteProtocolMapper()
//   GET    /client-scopes/{id}/protocol-mappers/protocol/{proto} → listProtocolMappersByProtocol()
//
// ── PROTOCOL MAPPERS (client-templates) ──────────────────────
//   GET    /client-templates/{id}/protocol-mappers/models        → listTemplateProtocolMappers()
//   GET    /client-templates/{id}/protocol-mappers/models/{id}   → getTemplateProtocolMapper()
//   POST   /client-templates/{id}/protocol-mappers/models        → createTemplateProtocolMapper()
//   POST   /client-templates/{id}/protocol-mappers/add-models    → createTemplateProtocolMappers()
//   PUT    /client-templates/{id}/protocol-mappers/models/{id}   → updateTemplateProtocolMapper()
//   DELETE /client-templates/{id}/protocol-mappers/models/{id}   → deleteTemplateProtocolMapper()
//   GET    /client-templates/{id}/protocol-mappers/protocol/{p}  → listTemplateProtocolMappersByProtocol()
//
// ── SCOPE MAPPINGS (client-scopes) ───────────────────────────
//   GET    /client-scopes/{id}/scope-mappings                    → listScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/realm              → listRealmScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/realm/available    → listAvailableRealmScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/realm/composite    → listCompositeRealmScopeMappings()
//   POST   /client-scopes/{id}/scope-mappings/realm              → addRealmScopeMappings()
//   DELETE /client-scopes/{id}/scope-mappings/realm              → removeRealmScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/clients/{client}   → listClientScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/clients/{client}/available  → listAvailableClientScopeMappings()
//   GET    /client-scopes/{id}/scope-mappings/clients/{client}/composite  → listCompositeClientScopeMappings()
//   POST   /client-scopes/{id}/scope-mappings/clients/{client}   → addClientScopeMappings()
//   DELETE /client-scopes/{id}/scope-mappings/clients/{client}   → removeClientScopeMappings()
//
// ── SCOPE MAPPINGS (client-templates) ────────────────────────
//   (même pattern que client-scopes mais sur /client-templates/{id}/scope-mappings/*)
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

const ClientScopeRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  description: z.string().optional(),
  protocol:    z.string().optional(),
  attributes:  z.record(z.string()).optional(),
  protocolMappers: z.array(z.record(z.unknown())).optional(),
}).passthrough();

const ProtocolMapperRepresentationSchema = z.object({
  id:              z.string().optional(),
  name:            z.string().optional(),
  protocol:        z.string().optional(),
  protocolMapper:  z.string().optional(),
  consentRequired: z.boolean().optional(),
  config:          z.record(z.string()).optional(),
}).passthrough();

const RoleRepresentationSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().optional(),
  description: z.string().optional(),
  composite:   z.boolean().optional(),
  clientRole:  z.boolean().optional(),
  containerId: z.string().optional(),
}).passthrough();

const MappingsRepresentationSchema = z.object({
  realmMappings:  z.array(z.record(z.unknown())).optional(),
  clientMappings: z.record(z.unknown()).optional(),
}).passthrough();

export type ClientScopeRepresentation = z.infer<typeof ClientScopeRepresentationSchema>;
export type ProtocolMapperRepresentation = z.infer<typeof ProtocolMapperRepresentationSchema>;
export type RoleRepresentation = z.infer<typeof RoleRepresentationSchema>;
export type MappingsRepresentation = z.infer<typeof MappingsRepresentationSchema>;

export interface CreateClientScopePayload {
  name:        string;
  description?: string;
  protocol?:   string;
  attributes?: Record<string, string>;
}

export interface UpdateClientScopePayload extends Partial<CreateClientScopePayload> {}

export interface CreateProtocolMapperPayload {
  name:            string;
  protocol:        string;
  protocolMapper:  string;
  config?:         Record<string, string>;
  consentRequired?: boolean;
}

// ── Helper de parsing sécurisé ────────────────────────────────
function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  return data as T;
}

// ── Extraction des erreurs ────────────────────────────────────
export function extractClientScopeError(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue'
): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('409')) return 'Un scope client avec ce nom existe déjà';
    if (msg.includes('404')) return 'Scope client introuvable';
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

// ── Helper générique pour les scope-mappings ──────────────────
function scopeMappingsBase(base: string, id: string): string {
  return `${base}/${encodeURIComponent(id)}/scope-mappings`;
}

function protocolMappersBase(base: string, id: string): string {
  return `${base}/${encodeURIComponent(id)}/protocol-mappers`;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export const keycloakClientScopesService = {

  // ─────────────────────────────────────────────────────────
  // 1. CRUD CLIENT SCOPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-scopes
   * Retourne la liste de tous les client scopes du realm.
   */
  async list(
    realm?: string
  ): Promise<ClientScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(`${adminBase(realm)}/client-scopes`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientScopeRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/client-scopes
   * Crée un nouveau client scope.
   * Retourne 201 Created.
   */
  async create(
    payload: CreateClientScopePayload,
    realm?: string
  ): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/client-scopes`, payload);
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{client-scope-id}
   * Retourne les détails d'un client scope.
   */
  async getById(
    scopeId: string,
    realm?: string
  ): Promise<ClientScopeRepresentation> {
    const data = await kc.get<unknown>(
      `${adminBase(realm)}/client-scopes/${encodeURIComponent(scopeId)}`
    );
    return safe(ClientScopeRepresentationSchema, data);
  },

  /**
   * PUT /admin/realms/{realm}/client-scopes/{client-scope-id}
   * Met à jour un client scope existant.
   * Retourne 204 No Content.
   */
  async update(
    scopeId: string,
    payload: UpdateClientScopePayload,
    realm?: string
  ): Promise<void> {
    await kc.put<unknown>(
      `${adminBase(realm)}/client-scopes/${encodeURIComponent(scopeId)}`,
      payload
    );
  },

  /**
   * DELETE /admin/realms/{realm}/client-scopes/{client-scope-id}
   * Supprime un client scope.
   * Retourne 204 No Content.
   */
  async delete(
    scopeId: string,
    realm?: string
  ): Promise<void> {
    await kc.delete<unknown>(
      `${adminBase(realm)}/client-scopes/${encodeURIComponent(scopeId)}`
    );
  },

  // ─────────────────────────────────────────────────────────
  // 2. CLIENT TEMPLATES (Alias déprécié pour client-scopes)
  // ─────────────────────────────────────────────────────────

  /** @deprecated GET /admin/realms/{realm}/client-templates — Utiliser list() */
  async listTemplates(realm?: string): Promise<ClientScopeRepresentation[]> {
    const data = await kc.get<unknown[]>(`${adminBase(realm)}/client-templates`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ClientScopeRepresentationSchema, d));
  },

  /** @deprecated POST /admin/realms/{realm}/client-templates — Utiliser create() */
  async createTemplate(payload: CreateClientScopePayload, realm?: string): Promise<void> {
    await kc.post<unknown>(`${adminBase(realm)}/client-templates`, payload);
  },

  /** @deprecated GET /admin/realms/{realm}/client-templates/{id} — Utiliser getById() */
  async getTemplate(id: string, realm?: string): Promise<ClientScopeRepresentation> {
    const data = await kc.get<unknown>(`${adminBase(realm)}/client-templates/${encodeURIComponent(id)}`);
    return safe(ClientScopeRepresentationSchema, data);
  },

  /** @deprecated PUT /admin/realms/{realm}/client-templates/{id} — Utiliser update() */
  async updateTemplate(id: string, payload: UpdateClientScopePayload, realm?: string): Promise<void> {
    await kc.put<unknown>(`${adminBase(realm)}/client-templates/${encodeURIComponent(id)}`, payload);
  },

  /** @deprecated DELETE /admin/realms/{realm}/client-templates/{id} — Utiliser delete() */
  async deleteTemplate(id: string, realm?: string): Promise<void> {
    await kc.delete<unknown>(`${adminBase(realm)}/client-templates/${encodeURIComponent(id)}`);
  },

  // ─────────────────────────────────────────────────────────
  // 3. PROTOCOL MAPPERS — CLIENT SCOPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/models
   * Liste tous les protocol mappers d'un client scope.
   */
  async listProtocolMappers(
    scopeId: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${protocolMappersBase(base, scopeId)}/models`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/models/{mapperId}
   * Retourne les détails d'un protocol mapper spécifique.
   */
  async getProtocolMapper(
    scopeId: string,
    mapperId: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown>(`${protocolMappersBase(base, scopeId)}/models/${encodeURIComponent(mapperId)}`);
    return safe(ProtocolMapperRepresentationSchema, data);
  },

  /**
   * POST /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/models
   * Crée un nouveau protocol mapper sur un client scope.
   * Retourne 201 Created.
   */
  async createProtocolMapper(
    scopeId: string,
    payload: CreateProtocolMapperPayload,
    realm?: string
  ): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.post<unknown>(`${protocolMappersBase(base, scopeId)}/models`, payload);
  },

  /**
   * POST /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/add-models
   * Crée plusieurs protocol mappers en une seule requête.
   * Retourne 204 No Content.
   */
  async createProtocolMappers(
    scopeId: string,
    payloads: CreateProtocolMapperPayload[],
    realm?: string
  ): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.post<unknown>(`${protocolMappersBase(base, scopeId)}/add-models`, payloads);
  },

  /**
   * PUT /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/models/{mapperId}
   * Met à jour un protocol mapper existant.
   * Retourne 204 No Content.
   */
  async updateProtocolMapper(
    scopeId: string,
    mapperId: string,
    payload: Partial<ProtocolMapperRepresentation>,
    realm?: string
  ): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.put<unknown>(`${protocolMappersBase(base, scopeId)}/models/${encodeURIComponent(mapperId)}`, payload);
  },

  /**
   * DELETE /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/models/{mapperId}
   * Supprime un protocol mapper.
   * Retourne 204 No Content.
   */
  async deleteProtocolMapper(
    scopeId: string,
    mapperId: string,
    realm?: string
  ): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.delete<unknown>(`${protocolMappersBase(base, scopeId)}/models/${encodeURIComponent(mapperId)}`);
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/protocol-mappers/protocol/{protocol}
   * Liste les protocol mappers filtrés par protocole (ex: 'openid-connect', 'saml').
   */
  async listProtocolMappersByProtocol(
    scopeId: string,
    protocol: string,
    realm?: string
  ): Promise<ProtocolMapperRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${protocolMappersBase(base, scopeId)}/protocol/${encodeURIComponent(protocol)}`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 4. PROTOCOL MAPPERS — CLIENT TEMPLATES (alias déprécié)
  // ─────────────────────────────────────────────────────────

  /** @deprecated Utiliser les méthodes listProtocolMappers* sur client-scopes */
  async listTemplateProtocolMappers(id: string, realm?: string): Promise<ProtocolMapperRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${protocolMappersBase(base, id)}/models`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  /** @deprecated */
  async getTemplateProtocolMapper(id: string, mapperId: string, realm?: string): Promise<ProtocolMapperRepresentation> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown>(`${protocolMappersBase(base, id)}/models/${encodeURIComponent(mapperId)}`);
    return safe(ProtocolMapperRepresentationSchema, data);
  },

  /** @deprecated */
  async createTemplateProtocolMapper(id: string, payload: CreateProtocolMapperPayload, realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.post<unknown>(`${protocolMappersBase(base, id)}/models`, payload);
  },

  /** @deprecated */
  async createTemplateProtocolMappers(id: string, payloads: CreateProtocolMapperPayload[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.post<unknown>(`${protocolMappersBase(base, id)}/add-models`, payloads);
  },

  /** @deprecated */
  async updateTemplateProtocolMapper(id: string, mapperId: string, payload: Partial<ProtocolMapperRepresentation>, realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.put<unknown>(`${protocolMappersBase(base, id)}/models/${encodeURIComponent(mapperId)}`, payload);
  },

  /** @deprecated */
  async deleteTemplateProtocolMapper(id: string, mapperId: string, realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.delete<unknown>(`${protocolMappersBase(base, id)}/models/${encodeURIComponent(mapperId)}`);
  },

  /** @deprecated */
  async listTemplateProtocolMappersByProtocol(id: string, protocol: string, realm?: string): Promise<ProtocolMapperRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${protocolMappersBase(base, id)}/protocol/${encodeURIComponent(protocol)}`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(ProtocolMapperRepresentationSchema, d));
  },

  // ─────────────────────────────────────────────────────────
  // 5. SCOPE MAPPINGS — CLIENT SCOPES
  // ─────────────────────────────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings
   * Retourne toutes les scope-mappings (realm + clients) d'un client scope.
   */
  async listScopeMappings(
    scopeId: string,
    realm?: string
  ): Promise<MappingsRepresentation> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown>(`${scopeMappingsBase(base, scopeId)}`);
    return safe(MappingsRepresentationSchema, data);
  },

  // ── Scope Mappings Realm ──────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/realm
   * Liste les roles realm assignés au scope.
   */
  async listRealmScopeMappings(scopeId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/realm`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/realm/available
   * Liste les roles realm disponibles à assigner (non encore assignés).
   */
  async listAvailableRealmScopeMappings(scopeId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/realm/available`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/realm/composite
   * Liste les roles realm effectifs (incluant composites) du scope.
   */
  async listCompositeRealmScopeMappings(scopeId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/realm/composite`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/client-scopes/{id}/scope-mappings/realm
   * Ajoute des roles realm au scope.
   * Retourne 204 No Content.
   */
  async addRealmScopeMappings(scopeId: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.post<unknown>(`${scopeMappingsBase(base, scopeId)}/realm`, roles);
  },

  /**
   * DELETE /admin/realms/{realm}/client-scopes/{id}/scope-mappings/realm
   * Retire des roles realm du scope.
   * Retourne 204 No Content.
   */
  async removeRealmScopeMappings(scopeId: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    // DELETE avec body — Keycloak exige les rôles dans le body
    await httpClient.deleteWithBody<unknown>(`${scopeMappingsBase(base, scopeId)}/realm`, roles);
  },

  // ── Scope Mappings Client ─────────────────────────────────

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/clients/{client}
   * Liste les roles d'un client assignés au scope.
   */
  async listClientScopeMappings(scopeId: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/clients/${encodeURIComponent(clientId)}`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/clients/{client}/available
   * Liste les roles d'un client disponibles à assigner (non encore assignés).
   */
  async listAvailableClientScopeMappings(scopeId: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/clients/${encodeURIComponent(clientId)}/available`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * GET /admin/realms/{realm}/client-scopes/{id}/scope-mappings/clients/{client}/composite
   * Liste les roles effectifs d'un client (incluant composites) du scope.
   */
  async listCompositeClientScopeMappings(scopeId: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-scopes`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, scopeId)}/clients/${encodeURIComponent(clientId)}/composite`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /**
   * POST /admin/realms/{realm}/client-scopes/{id}/scope-mappings/clients/{client}
   * Ajoute des roles d'un client au scope.
   * Retourne 204 No Content.
   */
  async addClientScopeMappings(scopeId: string, clientId: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await kc.post<unknown>(`${scopeMappingsBase(base, scopeId)}/clients/${encodeURIComponent(clientId)}`, roles);
  },

  /**
   * DELETE /admin/realms/{realm}/client-scopes/{id}/scope-mappings/clients/{client}
   * Retire des roles d'un client du scope.
   * Retourne 204 No Content.
   */
  async removeClientScopeMappings(scopeId: string, clientId: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-scopes`;
    await httpClient.deleteWithBody<unknown>(`${scopeMappingsBase(base, scopeId)}/clients/${encodeURIComponent(clientId)}`, roles);
  },

  // ─────────────────────────────────────────────────────────
  // 6. SCOPE MAPPINGS — CLIENT TEMPLATES (alias déprécié)
  // ─────────────────────────────────────────────────────────

  /** @deprecated Utiliser les méthodes scope-mappings sur client-scopes */
  async listTemplateScopeMappings(id: string, realm?: string): Promise<MappingsRepresentation> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown>(`${scopeMappingsBase(base, id)}`);
    return safe(MappingsRepresentationSchema, data);
  },

  /** @deprecated */
  async listTemplateRealmScopeMappings(id: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/realm`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async listAvailableTemplateRealmScopeMappings(id: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/realm/available`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async listCompositeTemplateRealmScopeMappings(id: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/realm/composite`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async addTemplateRealmScopeMappings(id: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.post<unknown>(`${scopeMappingsBase(base, id)}/realm`, roles);
  },

  /** @deprecated */
  async removeTemplateRealmScopeMappings(id: string, realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.delete<unknown>(`${scopeMappingsBase(base, id)}/realm`);
  },

  /** @deprecated */
  async listTemplateClientScopeMappings(id: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/clients/${encodeURIComponent(clientId)}`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async listAvailableTemplateClientScopeMappings(id: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/clients/${encodeURIComponent(clientId)}/available`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async listCompositeTemplateClientScopeMappings(id: string, clientId: string, realm?: string): Promise<RoleRepresentation[]> {
    const base = `${adminBase(realm)}/client-templates`;
    const data = await kc.get<unknown[]>(`${scopeMappingsBase(base, id)}/clients/${encodeURIComponent(clientId)}/composite`);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleRepresentationSchema, d));
  },

  /** @deprecated */
  async addTemplateClientScopeMappings(id: string, clientId: string, roles: RoleRepresentation[], realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.post<unknown>(`${scopeMappingsBase(base, id)}/clients/${encodeURIComponent(clientId)}`, roles);
  },

  /** @deprecated */
  async removeTemplateClientScopeMappings(id: string, clientId: string, realm?: string): Promise<void> {
    const base = `${adminBase(realm)}/client-templates`;
    await kc.delete<unknown>(`${scopeMappingsBase(base, id)}/clients/${encodeURIComponent(clientId)}`);
  },
};

// ── Export par défaut ────────────────────────────────────────
export default keycloakClientScopesService;
