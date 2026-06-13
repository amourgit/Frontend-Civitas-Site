// ============================================================
// lib/models/iam/role.model.ts
// Schémas Zod du module Rôles — alignés sur le backend
// Source: app/schemas/role.py | app/api/v1/roles.py
// ============================================================

import { z } from 'zod';

// ── Types de rôle (backend enum TypeRole) ─────────────────
export const TYPE_ROLE_LABELS: Record<string, string> = {
  systeme:      'Système',
  fonctionnel:  'Fonctionnel',
  metier:       'Métier',
  technique:    'Technique',
  administratif:'Administratif',
  custom:       'Personnalisé',
};

// Couleurs par type de rôle
export function getTypeRoleStyle(type: string) {
  const map: Record<string, { text: string; bg: string; border: string }> = {
    systeme:       { text: 'text-red-300',    bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
    fonctionnel:   { text: 'text-blue-300',   bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
    metier:        { text: 'text-purple-300', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
    technique:     { text: 'text-cyan-300',   bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.25)' },
    administratif: { text: 'text-amber-300',  bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    custom:        { text: 'text-green-300',  bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)' },
  };
  return map[type?.toLowerCase()] || { text: 'text-white/50', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' };
}

// ── Permission minimale embarquée dans un rôle ────────────
export const RolePermissionSchema = z.object({
  id:        z.string().uuid(),
  code:      z.string(),
  nom:       z.string(),
  domaine:   z.string().optional(),
  ressource: z.string().optional(),
  action:    z.string().optional(),
}).passthrough();
export type RolePermission = z.infer<typeof RolePermissionSchema>;

// ── Liste des rôles ────────────────────────────────────────
// GET /roles/ → RoleListSchema
export const RoleListItemSchema = z.object({
  id:             z.string().uuid(),
  code:           z.string(),
  nom:            z.string(),
  description:    z.string().nullable().optional(),
  type_role:      z.string(),
  nb_permissions: z.number().default(0),
  created_at:     z.string().optional(),
  updated_at:     z.string().optional(),
}).passthrough();
export type RoleListItem = z.infer<typeof RoleListItemSchema>;

// ── Détail d'un rôle ──────────────────────────────────────
// GET /roles/:id → RoleResponseSchema
export const RoleDetailSchema = z.object({
  id:          z.string().uuid(),
  code:        z.string(),
  nom:         z.string(),
  description: z.string().nullable().optional(),
  type_role:   z.string(),
  permissions: z.array(RolePermissionSchema).default([]),
  created_at:  z.string().optional(),
  updated_at:  z.string().optional(),
  created_by:  z.string().uuid().nullable().optional(),
  updated_by:  z.string().uuid().nullable().optional(),
}).passthrough();
export type RoleDetail = z.infer<typeof RoleDetailSchema>;

// ── Créer un rôle ─────────────────────────────────────────
// POST /roles/
export const RoleCreateSchema = z.object({
  code:        z.string()
    .min(2, 'Code minimum 2 caractères')
    .max(100, 'Code trop long')
    .regex(/^[a-z0-9._-]+$/, 'Uniquement minuscules, chiffres, tirets et points'),
  nom:         z.string().min(2, 'Nom minimum 2 caractères'),
  description: z.string().optional(),
  type_role:   z.string().min(1, 'Type requis'),
});
export type RoleCreate = z.infer<typeof RoleCreateSchema>;

// ── Modifier un rôle ──────────────────────────────────────
// PUT /roles/:id
export const RoleUpdateSchema = z.object({
  nom:         z.string().min(2).optional(),
  description: z.string().optional(),
  type_role:   z.string().optional(),
});
export type RoleUpdate = z.infer<typeof RoleUpdateSchema>;

// ── Ajouter/retirer des permissions ───────────────────────
// POST /roles/:id/permissions/ajouter
// POST /roles/:id/permissions/retirer
export const RolePermissionsChangeSchema = z.object({
  permission_ids: z.array(z.string().uuid()).min(1, 'Au moins une permission requise'),
});
export type RolePermissionsChange = z.infer<typeof RolePermissionsChangeSchema>;

// ── Filtres liste ─────────────────────────────────────────
export interface RolesFilters {
  type_role?: string;
  q?:         string;
  skip?:      number;
  limit?:     number;
}
