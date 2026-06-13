// ============================================================
// services/iam/permissionsService.ts
// Tous les endpoints /api/v1/permissions/*
// ============================================================

import { httpClient } from '@/lib/http-client';
import { z } from 'zod';
import {
  PermissionSourceSchema, PermissionListItemSchema, PermissionDetailSchema,
  type PermissionSource, type PermissionListItem, type PermissionDetail,
  type PermissionSourceCreate, type PermissionCreate,
  type PermissionCustomCreate, type PermissionUpdate,
  type EnregistrementPermissions, type PermissionsFilters,
} from '@/lib/models/iam/permission.model';

const safe = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const r = schema.safeParse(data);
  return r.success ? r.data : (data as T);
};

export function extractPermError(err: unknown, fallback = 'Une erreur est survenue'): string {
  if (err instanceof Error) {
    const m = err.message;
    if (m.includes('404'))  return 'Permission introuvable';
    if (m.includes('409') || m.toLowerCase().includes('existe')) return 'Ce code de permission existe déjà';
    if (m.includes('403'))  return 'Permission insuffisante';
    if (m.includes('422'))  return 'Données invalides';
    return m || fallback;
  }
  return fallback;
}

export const permissionsService = {

  /* ── Sources ──────────────────────────────────────────── */
  async listSources(): Promise<PermissionSource[]> {
    const d = await httpClient.get<unknown[]>('/permissions/sources');
    return Array.isArray(d) ? d.map((x) => safe(PermissionSourceSchema, x)) : [];
  },

  async createSource(p: PermissionSourceCreate): Promise<PermissionSource> {
    const d = await httpClient.post<unknown>('/permissions/sources', p);
    return safe(PermissionSourceSchema, d);
  },

  /* ── Permissions ──────────────────────────────────────── */
  async list(f: PermissionsFilters = {}): Promise<PermissionListItem[]> {
    const params: Record<string, unknown> = {};
    if (f.domaine) params.domaine = f.domaine;
    if (f.q)       params.q       = f.q;
    params.skip  = f.skip  ?? 0;
    params.limit = f.limit ?? 500;
    const d = await httpClient.get<unknown[]>('/permissions', params);
    return Array.isArray(d) ? d.map((x) => safe(PermissionListItemSchema, x)) : [];
  },

  async getById(id: string): Promise<PermissionDetail> {
    const d = await httpClient.get<unknown>(`/permissions/${id}`);
    return safe(PermissionDetailSchema, d);
  },

  async create(p: PermissionCreate): Promise<PermissionDetail> {
    const d = await httpClient.post<unknown>('/permissions', p);
    return safe(PermissionDetailSchema, d);
  },

  async createCustom(p: PermissionCustomCreate): Promise<PermissionDetail> {
    const d = await httpClient.post<unknown>('/permissions/custom', p);
    return safe(PermissionDetailSchema, d);
  },

  async update(id: string, p: PermissionUpdate): Promise<PermissionDetail> {
    const d = await httpClient.put<unknown>(`/permissions/${id}`, p);
    return safe(PermissionDetailSchema, d);
  },

  async enregistrerMasse(payload: EnregistrementPermissions): Promise<{ created: number; updated: number }> {
    const d = await httpClient.post<unknown>('/permissions/enregistrer', payload);
    return d as { created: number; updated: number };
  },
};
