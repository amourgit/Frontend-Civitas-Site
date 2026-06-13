// ============================================================
// lib/models/iam/keycloak-group.model.ts
// Schémas Zod — Module Groupes Keycloak Admin REST API v26
// Source: Keycloak Admin REST API (26.6.1)
// Endpoints: /admin/realms/{realm}/groups/*
// ============================================================

import { z } from 'zod';

// ────────────────────────────────────────────────────────────
// PRIMITIVES & REPRÉSENTATIONS PARTAGÉES
// ────────────────────────────────────────────────────────────

/**
 * RoleRepresentation — utilisée dans les role-mappings des groupes.
 * Couvre realm roles et client roles.
 */
export const RoleRepresentationSchema = z.object({
  id:                 z.string().optional(),
  name:               z.string().optional(),
  description:        z.string().optional(),
  scopeParamRequired: z.boolean().optional(),
  composite:          z.boolean().optional(),
  composites:         z.record(z.unknown()).optional(),
  clientRole:         z.boolean().optional(),
  containerId:        z.string().optional(),
  attributes:         z.record(z.array(z.string())).optional(),
}).passthrough();
export type RoleRepresentation = z.infer<typeof RoleRepresentationSchema>;

/**
 * RoleMappingRepresentation — résultat de GET .../role-mappings
 * Contient les realm roles ET les client roles mappés au groupe.
 */
export const RoleMappingRepresentationSchema = z.object({
  realmMappings:  z.array(RoleRepresentationSchema).optional(),
  clientMappings: z.record(
    z.object({
      id:       z.string().optional(),
      client:   z.string().optional(),
      mappings: z.array(RoleRepresentationSchema).optional(),
    }).passthrough()
  ).optional(),
}).passthrough();
export type RoleMappingRepresentation = z.infer<typeof RoleMappingRepresentationSchema>;

/**
 * ManagementPermissionReference — retourné par les endpoints
 * .../management/permissions (authorization fine-grained).
 */
export const ManagementPermissionReferenceSchema = z.object({
  enabled:           z.boolean().optional(),
  resource:          z.string().optional(),
  scopePermissions:  z.record(z.string()).optional(),
}).passthrough();
export type ManagementPermissionReference = z.infer<typeof ManagementPermissionReferenceSchema>;

/**
 * UserRepresentation (allégée) — retournée par GET .../groups/{group-id}/members
 * La représentation complète est dans keycloak-user.model.ts.
 * On utilise passthrough() pour tolérer tous les champs.
 */
export const GroupMemberRepresentationSchema = z.object({
  id:               z.string().optional(),
  username:         z.string().optional(),
  firstName:        z.string().optional(),
  lastName:         z.string().optional(),
  email:            z.string().optional(),
  emailVerified:    z.boolean().optional(),
  enabled:          z.boolean().optional(),
  createdTimestamp: z.number().optional(),
  attributes:       z.record(z.array(z.string())).optional(),
  realmRoles:       z.array(z.string()).optional(),
  clientRoles:      z.record(z.array(z.unknown())).optional(),
  groups:           z.array(z.string()).optional(),
  access:           z.record(z.boolean()).optional(),
}).passthrough();
export type GroupMemberRepresentation = z.infer<typeof GroupMemberRepresentationSchema>;

// ────────────────────────────────────────────────────────────
// REPRÉSENTATION PRINCIPALE DU GROUPE
// ────────────────────────────────────────────────────────────

/**
 * GroupRepresentation — modèle principal.
 * Utilisé pour GET, POST, PUT sur /admin/realms/{realm}/groups/*.
 * subGroups est récursif (lazy).
 */
export const GroupRepresentationSchema: z.ZodType<GroupRepresentation> = z.lazy(() =>
  z.object({
    id:            z.string().optional(),
    name:          z.string().optional(),
    description:   z.string().optional(),
    path:          z.string().optional(),
    parentId:      z.string().optional(),
    subGroupCount: z.number().int().optional(),       // int64 — nombre de sous-groupes
    subGroups:     z.array(GroupRepresentationSchema).optional(),
    attributes:    z.record(z.array(z.string())).optional(),
    realmRoles:    z.array(z.string()).optional(),
    clientRoles:   z.record(z.array(z.string())).optional(),
    access:        z.record(z.boolean()).optional(),  // { manage: true, view: true, … }
  }).passthrough()
);

export interface GroupRepresentation {
  id?:            string;
  name?:          string;
  description?:   string;
  path?:          string;
  parentId?:      string;
  subGroupCount?: number;
  subGroups?:     GroupRepresentation[];
  attributes?:    Record<string, string[]>;
  realmRoles?:    string[];
  clientRoles?:   Record<string, string[]>;
  access?:        Record<string, boolean>;
  [key: string]:  unknown;
}

// ────────────────────────────────────────────────────────────
// SCHÉMAS DE COLLECTIONS
// ────────────────────────────────────────────────────────────

/** Liste de groupes (GET /groups, GET /groups/{id}/children) */
export const GroupListSchema = z.array(GroupRepresentationSchema);
export type GroupList = z.infer<typeof GroupListSchema>;

/** Comptage des groupes (GET /groups/count) → Map<String, Long> */
export const GroupCountSchema = z.object({
  count: z.number().int(),
}).passthrough();
export type GroupCount = z.infer<typeof GroupCountSchema>;

/** Liste de RoleRepresentation */
export const RoleListSchema = z.array(RoleRepresentationSchema);
export type RoleList = z.infer<typeof RoleListSchema>;

/** Liste de membres (GET /groups/{id}/members) */
export const GroupMemberListSchema = z.array(GroupMemberRepresentationSchema);
export type GroupMemberList = z.infer<typeof GroupMemberListSchema>;

// ────────────────────────────────────────────────────────────
// PAYLOADS D'ENTRÉE (input validation)
// ────────────────────────────────────────────────────────────

/**
 * CreateGroupPayload — POST /admin/realms/{realm}/groups
 * Crée un groupe top-level. name est obligatoire.
 */
export const CreateGroupPayloadSchema = z.object({
  name:        z.string().min(1, 'Le nom du groupe est obligatoire'),
  description: z.string().optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  realmRoles:  z.array(z.string()).optional(),
  clientRoles: z.record(z.array(z.string())).optional(),
});
export type CreateGroupPayload = z.infer<typeof CreateGroupPayloadSchema>;

/**
 * UpdateGroupPayload — PUT /admin/realms/{realm}/groups/{group-id}
 * Met à jour le groupe. Tous les champs sont optionnels.
 * N'affecte pas les sous-groupes (ignorés par Keycloak).
 */
export const UpdateGroupPayloadSchema = z.object({
  id:          z.string().optional(),
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  path:        z.string().optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  realmRoles:  z.array(z.string()).optional(),
  clientRoles: z.record(z.array(z.string())).optional(),
  access:      z.record(z.boolean()).optional(),
});
export type UpdateGroupPayload = z.infer<typeof UpdateGroupPayloadSchema>;

/**
 * CreateChildGroupPayload — POST /admin/realms/{realm}/groups/{group-id}/children
 * Crée un sous-groupe ou déplace un groupe existant.
 * Si id est fourni → déplace le groupe existant sous ce parent.
 * Si id est absent → crée un nouveau sous-groupe.
 */
export const CreateChildGroupPayloadSchema = z.object({
  id:          z.string().optional(),   // présent = déplacement
  name:        z.string().min(1, 'Le nom du sous-groupe est obligatoire'),
  description: z.string().optional(),
  attributes:  z.record(z.array(z.string())).optional(),
  realmRoles:  z.array(z.string()).optional(),
  clientRoles: z.record(z.array(z.string())).optional(),
});
export type CreateChildGroupPayload = z.infer<typeof CreateChildGroupPayloadSchema>;

/**
 * ManagementPermissionPayload — PUT /admin/realms/{realm}/groups/{group-id}/management/permissions
 * Active ou désactive les permissions d'autorisation fine-grained.
 */
export const ManagementPermissionPayloadSchema = z.object({
  enabled: z.boolean(),
});
export type ManagementPermissionPayload = z.infer<typeof ManagementPermissionPayloadSchema>;

// ────────────────────────────────────────────────────────────
// FILTRES / QUERY PARAMS
// ────────────────────────────────────────────────────────────

/**
 * GroupsListFilters — Query params pour GET /admin/realms/{realm}/groups
 */
export const GroupsListFiltersSchema = z.object({
  /** Pagination — index du premier élément (0-based) */
  first:               z.number().int().min(0).optional(),
  /** Pagination — nombre maximum de résultats */
  max:                 z.number().int().min(1).optional(),
  /** Recherche par nom (partielle si exact=false) */
  search:              z.string().optional(),
  /** Si true, recherche exacte sur le nom */
  exact:               z.boolean().optional(),
  /** Recherche par attribut : format "key:value key2:value2" */
  q:                   z.string().optional(),
  /** Si true, retourne une représentation allégée (id, name, path) */
  briefRepresentation: z.boolean().optional(),
  /** Si true, retourne le nombre de sous-groupes pour chaque groupe (défaut: true) */
  populateHierarchy:   z.boolean().optional(),
}).strict();
export type GroupsListFilters = z.infer<typeof GroupsListFiltersSchema>;

/**
 * GroupsCountFilters — Query params pour GET /admin/realms/{realm}/groups/count
 */
export const GroupsCountFiltersSchema = z.object({
  search: z.string().optional(),
  top:    z.boolean().optional(),   // true = uniquement les groupes top-level
}).strict();
export type GroupsCountFilters = z.infer<typeof GroupsCountFiltersSchema>;

/**
 * GroupChildrenFilters — Query params pour GET /admin/realms/{realm}/groups/{group-id}/children
 */
export const GroupChildrenFiltersSchema = z.object({
  first:               z.number().int().min(0).optional(),
  max:                 z.number().int().min(1).optional(),
  briefRepresentation: z.boolean().optional(),
  /** Si true, retourne le nombre de sous-groupes pour chaque sous-groupe (défaut: true) */
  populateHierarchy:   z.boolean().optional(),
}).strict();
export type GroupChildrenFilters = z.infer<typeof GroupChildrenFiltersSchema>;

/**
 * GroupMembersFilters — Query params pour GET /admin/realms/{realm}/groups/{group-id}/members
 */
export const GroupMembersFiltersSchema = z.object({
  first:               z.number().int().min(0).optional(),
  max:                 z.number().int().min(1).optional(),
  /** Si true, retourne une représentation allégée (défaut: false) */
  briefRepresentation: z.boolean().optional(),
}).strict();
export type GroupMembersFilters = z.infer<typeof GroupMembersFiltersSchema>;
