// ============================================================
// services/iam/rolesService.ts
// Service complet — module Rôles IAM Local
// Tous les endpoints /api/v1/roles/*
// ============================================================

import { httpClient } from '@/lib/http-client';
import { z } from 'zod';
import {
  RoleListItemSchema, RoleDetailSchema,
  type RoleListItem, type RoleDetail,
  type RoleCreate, type RoleUpdate,
  type RolePermissionsChange, type RolesFilters,
} from '@/lib/models/iam/role.model';

function safe<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  return r.success ? r.data : (data as T);
}

export function extractRoleError(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('404'))                                   return 'Rôle introuvable';
    if (msg.includes('409') || msg.toLowerCase().includes('existe')) return 'Un rôle avec ce code existe déjà';
    if (msg.includes('403'))                                   return 'Permission insuffisante';
    if (msg.includes('422'))                                   return 'Données invalides';
    return msg || fallback;
  }
  return fallback;
}

export const rolesService = {

  /** GET /roles/ */
  async list(filters: RolesFilters = {}): Promise<RoleListItem[]> {
    const params: Record<string, unknown> = {};
    if (filters.type_role) params.type_role = filters.type_role;
    if (filters.q)         params.q         = filters.q;
    params.skip  = filters.skip  ?? 0;
    params.limit = filters.limit ?? 200;

    const data = await httpClient.get<unknown[]>('/roles', params);
    if (!Array.isArray(data)) return [];
    return data.map((d) => safe(RoleListItemSchema, d));
  },

  /** GET /roles/:id */
  async getById(id: string): Promise<RoleDetail> {
    const data = await httpClient.get<unknown>(`/roles/${id}`);
    return safe(RoleDetailSchema, data);
  },

  /** POST /roles/ */
  async create(payload: RoleCreate): Promise<RoleDetail> {
    const data = await httpClient.post<unknown>('/roles', payload);
    return safe(RoleDetailSchema, data);
  },

  /** PUT /roles/:id */
  async update(id: string, payload: RoleUpdate): Promise<RoleDetail> {
    const data = await httpClient.put<unknown>(`/roles/${id}`, payload);
    return safe(RoleDetailSchema, data);
  },

  /** DELETE /roles/:id */
  async delete(id: string): Promise<void> {
    await httpClient.delete<unknown>(`/roles/${id}`);
  },

  /** POST /roles/:id/permissions/ajouter */
  async ajouterPermissions(id: string, permissionIds: string[]): Promise<RoleDetail> {
    const data = await httpClient.post<unknown>(`/roles/${id}/permissions/ajouter`, { permission_ids: permissionIds });
    return safe(RoleDetailSchema, data);
  },

  /** POST /roles/:id/permissions/retirer */
  async retirerPermissions(id: string, permissionIds: string[]): Promise<RoleDetail> {
    const data = await httpClient.post<unknown>(`/roles/${id}/permissions/retirer`, { permission_ids: permissionIds });
    return safe(RoleDetailSchema, data);
  },
};
