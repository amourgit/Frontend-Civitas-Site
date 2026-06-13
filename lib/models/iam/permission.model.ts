// ============================================================
// lib/models/iam/permission.model.ts
// Schémas Zod + helpers visuels — module Permissions IAM
// Source: app/schemas/permission.py | app/api/v1/permissions.py
// ============================================================

import { z } from 'zod';

// ── Domaine → couleur ─────────────────────────────────────
const DOMAIN_STYLES: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  iam:      { text: 'text-violet-300',  bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.28)', glow: 'rgba(139,92,246,0.15)' },
  profil:   { text: 'text-blue-300',    bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.12)' },
  audit:    { text: 'text-teal-300',    bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.25)', glow: 'rgba(20,184,166,0.1)' },
  gateway:  { text: 'text-cyan-300',    bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.1)' },
  admin:    { text: 'text-amber-300',   bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.1)' },
  token:    { text: 'text-orange-300',  bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)', glow: 'rgba(249,115,22,0.1)' },
  role:     { text: 'text-purple-300',  bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)', glow: 'rgba(168,85,247,0.1)' },
  groupe:   { text: 'text-green-300',   bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',  glow: 'rgba(34,197,94,0.1)' },
  module:   { text: 'text-pink-300',    bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.25)', glow: 'rgba(236,72,153,0.1)' },
  rapport:  { text: 'text-lime-300',    bg: 'rgba(132,204,22,0.1)',  border: 'rgba(132,204,22,0.25)', glow: 'rgba(132,204,22,0.1)' },
};
const DEFAULT_STYLE = { text: 'text-white/50', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', glow: 'rgba(255,255,255,0.06)' };
export const getDomainStyle = (d: string) => DOMAIN_STYLES[d?.toLowerCase()] || DEFAULT_STYLE;

// Action → icône emoji
export const ACTION_ICONS: Record<string, string> = {
  lire: '👁', consulter: '👁', voir: '👁', list: '👁',
  modifier: '✏️', editer: '✏️', update: '✏️',
  creer: '➕', create: '➕', ajouter: '➕',
  supprimer: '🗑', delete: '🗑', retirer: '🗑',
  admin: '⚙️', administrer: '⚙️', gerer: '⚙️',
  verifier: '✅', valider: '✅',
  exporter: '📤', importer: '📥',
};
export const getActionIcon = (a: string) => ACTION_ICONS[a?.toLowerCase()] || '🔑';

// ── Source (microservice) ─────────────────────────────────
// GET /permissions/sources
export const PermissionSourceSchema = z.object({
  id:          z.string().uuid(),
  code:        z.string(),
  nom:         z.string(),
  description: z.string().nullable().optional(),
  url:         z.string().nullable().optional(),
  actif:       z.boolean().default(true),
  created_at:  z.string().optional(),
  nb_permissions: z.number().default(0).optional(),
}).passthrough();
export type PermissionSource = z.infer<typeof PermissionSourceSchema>;

// POST /permissions/sources
export const PermissionSourceCreateSchema = z.object({
  code:        z.string().min(2, 'Code requis'),
  nom:         z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
  url:         z.string().optional(),
});
export type PermissionSourceCreate = z.infer<typeof PermissionSourceCreateSchema>;

// ── Permission liste ──────────────────────────────────────
// GET /permissions/
export const PermissionListItemSchema = z.object({
  id:          z.string().uuid(),
  code:        z.string(),
  nom:         z.string(),
  domaine:     z.string(),
  ressource:   z.string().optional(),
  action:      z.string().optional(),
  description: z.string().nullable().optional(),
  source_code: z.string().nullable().optional(),
  source_nom:  z.string().nullable().optional(),
  is_custom:   z.boolean().default(false).optional(),
  created_at:  z.string().optional(),
}).passthrough();
export type PermissionListItem = z.infer<typeof PermissionListItemSchema>;

// ── Permission détail ─────────────────────────────────────
// GET /permissions/:id
export const PermissionDetailSchema = PermissionListItemSchema.extend({
  updated_at: z.string().optional(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
}).passthrough();
export type PermissionDetail = z.infer<typeof PermissionDetailSchema>;

// ── Créer permission manuelle ─────────────────────────────
// POST /permissions/
export const PermissionCreateSchema = z.object({
  code:        z.string()
    .min(3, 'Code minimum 3 caractères')
    .regex(/^[a-z0-9._-]+$/, 'Minuscules, chiffres, tirets et points uniquement'),
  nom:         z.string().min(2, 'Nom requis'),
  domaine:     z.string().min(1, 'Domaine requis'),
  ressource:   z.string().optional(),
  action:      z.string().optional(),
  description: z.string().optional(),
  source_id:   z.string().uuid().optional(),
});
export type PermissionCreate = z.infer<typeof PermissionCreateSchema>;

// POST /permissions/custom
export const PermissionCustomCreateSchema = z.object({
  code:        z.string().min(3, 'Code minimum 3 caractères'),
  nom:         z.string().min(2, 'Nom requis'),
  domaine:     z.string().min(1, 'Domaine requis'),
  description: z.string().optional(),
});
export type PermissionCustomCreate = z.infer<typeof PermissionCustomCreateSchema>;

// ── Modifier permission ───────────────────────────────────
// PUT /permissions/:id
export const PermissionUpdateSchema = z.object({
  nom:         z.string().optional(),
  description: z.string().optional(),
  domaine:     z.string().optional(),
  ressource:   z.string().optional(),
  action:      z.string().optional(),
});
export type PermissionUpdate = z.infer<typeof PermissionUpdateSchema>;

// ── Enregistrement en masse ───────────────────────────────
// POST /permissions/enregistrer
export const EnregistrementPermissionsSchema = z.object({
  source_code:  z.string(),
  source_nom:   z.string(),
  permissions:  z.array(z.object({
    code:     z.string(),
    nom:      z.string(),
    domaine:  z.string(),
    ressource: z.string().optional(),
    action:    z.string().optional(),
  })),
});
export type EnregistrementPermissions = z.infer<typeof EnregistrementPermissionsSchema>;

// ── Filtres ───────────────────────────────────────────────
export interface PermissionsFilters {
  domaine?: string;
  q?:       string;
  skip?:    number;
  limit?:   number;
}
