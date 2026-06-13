// ============================================================
// services/iam/profilsService.ts
// Service complet pour le module Profils IAM Local
// Tous les endpoints /api/v1/compte/*
// ============================================================

import { httpClient } from '@/lib/http-client';
import { z } from 'zod';
import {
  ProfilListItemSchema,
  ProfilDetailSchema,
  AssignationRoleResponseSchema,
  type ProfilListItem,
  type ProfilDetail,
  type ProfilCreate,
  type ProfilCreateSansCred,
  type ProfilUpdate,
  type SuspendreProfil,
  type AssignationRoleCreate,
  type AssignationRoleResponse,
  type ProfilsFilters,
} from '@/lib/models/iam/profil.model';

// ── Safe parse helper ─────────────────────────────────────
function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  return r.success ? r.data : (data as T);
}

// ── Extraction message erreur backend ────────────────────
export function extractProfilError(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('404')) return 'Profil introuvable';
    if (msg.includes('409') || msg.toLowerCase().includes('existe')) return 'Un profil avec cet identifiant existe déjà';
    if (msg.includes('403')) return 'Permission insuffisante';
    if (msg.includes('422')) return 'Données invalides — vérifiez les champs';
    return msg || fallback;
  }
  return fallback;
}

// ============================================================
// PROFILS SERVICE
// ============================================================
export const profilsService = {

  /**
   * GET /compte/
   * Liste paginée avec filtres : type_profil, statut, q
   */
  async list(filters: ProfilsFilters = {}): Promise<ProfilListItem[]> {
    const params: Record<string, unknown> = {};
    if (filters.type_profil) params.type_profil = filters.type_profil;
    if (filters.statut)      params.statut      = filters.statut;
    if (filters.q)           params.q           = filters.q;
    params.skip  = filters.skip  ?? 0;
    params.limit = filters.limit ?? 50;

    const data = await httpClient.get<unknown[]>('/profils', params);
    if (!Array.isArray(data)) return [];
    return data.map((item) => safeParse(ProfilListItemSchema, item));
  },

  /**
   * GET /compte/:id
   * Détail complet d'un profil
   */
  async getById(id: string): Promise<ProfilDetail> {
    const data = await httpClient.get<unknown>(`/compte/${id}`);
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * POST /compte/
   * Créer un profil avec credentials locales
   */
  async create(payload: ProfilCreate): Promise<ProfilDetail> {
    const data = await httpClient.post<unknown>('/profils', payload);
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * POST /compte/sans-credentials
   * Créer un profil sans credentials (liaison IAM Central uniquement)
   */
  async createSansCredentials(payload: ProfilCreateSansCred): Promise<ProfilDetail> {
    const data = await httpClient.post<unknown>('/compte/sans-credentials', payload);
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * PUT /compte/:id
   * Modifier les informations d'un profil
   */
  async update(id: string, payload: ProfilUpdate): Promise<ProfilDetail> {
    const data = await httpClient.put<unknown>(`/compte/${id}`, payload);
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * POST /compte/:id/suspendre
   * Suspendre un profil avec raison obligatoire
   */
  async suspendre(id: string, payload: SuspendreProfil): Promise<ProfilDetail> {
    const data = await httpClient.post<unknown>(`/compte/${id}/suspendre`, payload);
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * POST /compte/:id/reactiver
   * Réactiver un profil suspendu
   */
  async reactiver(id: string): Promise<ProfilDetail> {
    const data = await httpClient.post<unknown>(`/compte/${id}/reactiver`, {});
    return safeParse(ProfilDetailSchema, data);
  },

  /**
   * DELETE /compte/:id
   * Supprimer un profil (soft delete)
   */
  async supprimer(id: string): Promise<void> {
    await httpClient.delete<unknown>(`/compte/${id}`);
  },

  /**
   * POST /compte/:id/roles
   * Assigner un rôle à un profil
   */
  async assignerRole(id: string, payload: AssignationRoleCreate): Promise<AssignationRoleResponse> {
    const data = await httpClient.post<unknown>(`/compte/${id}/roles`, {
      ...payload,
      profil_id: id,
    });
    return safeParse(AssignationRoleResponseSchema, data);
  },

  /**
   * GET /compte/:id/roles
   * Liste des rôles actifs d'un profil
   */
  async getRoles(id: string): Promise<AssignationRoleResponse[]> {
    const data = await httpClient.get<unknown[]>(`/compte/${id}/roles`);
    if (!Array.isArray(data)) return [];
    return data.map((item) => safeParse(AssignationRoleResponseSchema, item));
  },

  /**
   * DELETE /compte/:id/roles/:assignation_id
   * Révoquer une assignation de rôle
   */
  async revoquerRole(
    profilId: string,
    assignationId: string,
    raison?: string
  ): Promise<void> {
    await httpClient.delete<unknown>(`/compte/${profilId}/roles/${assignationId}`);
  },
};
