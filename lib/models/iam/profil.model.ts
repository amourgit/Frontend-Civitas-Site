// ============================================================
// lib/models/iam/profil.model.ts
// Schémas Zod du module Profils — alignés sur les schemas Pydantic
// Source: app/schemas/profil_local.py + assignation.py + role.py
// ============================================================

import { z } from 'zod';

// ── Types de profil (backend enum TypeProfil) ─────────────
export const TYPE_PROFIL_LABELS: Record<string, string> = {
  admin:        'Administrateur',
  enseignant:   'Enseignant',
  etudiant:     'Étudiant',
  parent:       'Parent',
  personnel:    'Personnel',
  invite:       'Invité',
  systeme:      'Système',
  superviseur:  'Superviseur',
};

// ── Statuts profil ────────────────────────────────────────
export const STATUT_LABELS: Record<string, string> = {
  actif:    'Actif',
  suspendu: 'Suspendu',
  inactif:  'Inactif',
  supprime: 'Supprimé',
};

// ── BaseResponseSchema (commun à tous les schemas backend) ─
export const BaseResponseSchema = z.object({
  id:         z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
});

// ── ProfilListSchema ──────────────────────────────────────
// GET /compte/ → liste paginée
export const ProfilListItemSchema = BaseResponseSchema.extend({
  user_id_national:     z.string().uuid().nullable().optional(),
  nom:                  z.string().nullable().optional(),
  prenom:               z.string().nullable().optional(),
  email:                z.string().nullable().optional(),
  identifiant_national: z.string().nullable().optional(),
  username:             z.string().nullable().optional(),
  type_profil:          z.string(),
  statut:               z.string(),
  derniere_connexion:   z.string().nullable().optional(),
}).passthrough();
export type ProfilListItem = z.infer<typeof ProfilListItemSchema>;

// ── ProfilResponseSchema ──────────────────────────────────
// GET /compte/:id → détail complet
export const ProfilDetailSchema = BaseResponseSchema.extend({
  user_id_national:     z.string().uuid().nullable().optional(),
  nom:                  z.string().nullable().optional(),
  prenom:               z.string().nullable().optional(),
  email:                z.string().nullable().optional(),
  telephone:            z.string().nullable().optional(),
  identifiant_national: z.string().nullable().optional(),
  username:             z.string().nullable().optional(),
  type_profil:          z.string(),
  statut:               z.string(),
  raison_suspension:    z.string().nullable().optional(),
  derniere_connexion:   z.string().nullable().optional(),
  nb_connexions:        z.union([z.string(), z.number()]).nullable().optional(),
  premiere_connexion:   z.string().nullable().optional(),
  preferences:          z.record(z.unknown()).nullable().optional(),
  meta_data:            z.record(z.unknown()).nullable().optional(),
  notes:                z.string().nullable().optional(),
  // Champs enrichis côté front
  is_admin:             z.boolean().optional(),
}).passthrough();
export type ProfilDetail = z.infer<typeof ProfilDetailSchema>;

// ── Créer profil avec credentials ─────────────────────────
// POST /compte/
export const ProfilCreateSchema = z.object({
  nom:                    z.string().min(1, 'Nom requis'),
  prenom:                 z.string().min(1, 'Prénom requis'),
  email:                  z.string().email('Email invalide'),
  telephone:              z.string().optional(),
  identifiant_national:   z.string().min(1, 'Identifiant national requis'),
  type_profil:            z.string().min(1, 'Type de profil requis'),
  username:               z.string().min(3, '3 caractères minimum'),
  password:               z.string().min(8, '8 caractères minimum'),
  require_password_change: z.boolean().default(true),
  notes:                  z.string().optional(),
  // Champs académiques optionnels
  classe:         z.string().optional(),
  niveau:         z.string().optional(),
  specialite:     z.string().optional(),
  annee_scolaire: z.string().optional(),
});
export type ProfilCreate = z.infer<typeof ProfilCreateSchema>;

// ── Créer profil sans credentials ─────────────────────────
// POST /compte/sans-credentials
export const ProfilCreateSansCredSchema = z.object({
  nom:                  z.string().optional(),
  prenom:               z.string().optional(),
  email:                z.string().email().optional(),
  telephone:            z.string().optional(),
  identifiant_national: z.string().optional(),
  type_profil:          z.string().default('invite'),
  notes:                z.string().optional(),
});
export type ProfilCreateSansCred = z.infer<typeof ProfilCreateSansCredSchema>;

// ── Modifier profil ───────────────────────────────────────
// PUT /compte/:id
export const ProfilUpdateSchema = z.object({
  nom:                  z.string().optional(),
  prenom:               z.string().optional(),
  email:                z.string().email().optional(),
  telephone:            z.string().optional(),
  identifiant_national: z.string().optional(),
  type_profil:          z.string().optional(),
  notes:                z.string().optional(),
});
export type ProfilUpdate = z.infer<typeof ProfilUpdateSchema>;

// ── Suspendre profil ──────────────────────────────────────
// POST /compte/:id/suspendre
export const SuspendreProfilSchema = z.object({
  raison: z.string().min(5, 'Raison obligatoire (5 caractères minimum)'),
});
export type SuspendreProfil = z.infer<typeof SuspendreProfilSchema>;

// ── Assignation rôle ──────────────────────────────────────
// POST /compte/:id/roles
export const AssignationRoleCreateSchema = z.object({
  profil_id:   z.string().uuid().optional(),
  role_id:     z.string().uuid('UUID rôle requis'),
  date_fin:    z.string().optional(),
  raison:      z.string().optional(),
});
export type AssignationRoleCreate = z.infer<typeof AssignationRoleCreateSchema>;

// ── Response assignation rôle ─────────────────────────────
export const AssignationRoleResponseSchema = z.object({
  id:           z.string().uuid(),
  profil_id:    z.string().uuid().optional(),
  role_id:      z.string().uuid().optional(),
  role_code:    z.string().optional(),
  role_nom:     z.string().optional(),
  date_debut:   z.string().optional(),
  date_fin:     z.string().nullable().optional(),
  raison:       z.string().nullable().optional(),
  active:       z.boolean().optional(),
  created_at:   z.string().optional(),
}).passthrough();
export type AssignationRoleResponse = z.infer<typeof AssignationRoleResponseSchema>;

// ── Révoquer assignation rôle ─────────────────────────────
// DELETE /compte/:id/roles/:assignation_id
export const RevoquerAssignationSchema = z.object({
  raison: z.string().optional(),
});
export type RevoquerAssignation = z.infer<typeof RevoquerAssignationSchema>;

// ── Paramètres de filtrage ────────────────────────────────
export interface ProfilsFilters {
  type_profil?: string;
  statut?:      string;
  q?:           string;
  skip?:        number;
  limit?:       number;
}

// ── Helpers ───────────────────────────────────────────────
export function getStatutColor(statut: string) {
  const map: Record<string, { text: string; bg: string; border: string; dot: string }> = {
    actif:    { text: 'text-green-400',  bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.28)',   dot: 'bg-green-400' },
    suspendu: { text: 'text-orange-400', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.28)',  dot: 'bg-orange-400' },
    inactif:  { text: 'text-red-400',    bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.28)',   dot: 'bg-red-400' },
    supprime: { text: 'text-red-500',    bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',    dot: 'bg-red-500' },
  };
  return map[statut?.toLowerCase()] || { text: 'text-white/50', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', dot: 'bg-white/40' };
}

export function getTypeProfil(type: string) {
  const map: Record<string, { text: string; bg: string; border: string }> = {
    admin:       { text: 'text-amber-300',   bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
    enseignant:  { text: 'text-blue-300',    bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
    etudiant:    { text: 'text-purple-300',  bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
    superviseur: { text: 'text-pink-300',    bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
    personnel:   { text: 'text-teal-300',    bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)' },
    parent:      { text: 'text-green-300',   bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)' },
    invite:      { text: 'text-white/50',    bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    systeme:     { text: 'text-cyan-300',    bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)' },
  };
  return map[type?.toLowerCase()] || { text: 'text-white/50', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' };
}

export function getInitials(nom?: string | null, prenom?: string | null, username?: string | null): string {
  return [prenom?.charAt(0), nom?.charAt(0)]
    .filter(Boolean).join('').toUpperCase()
    || username?.charAt(0)?.toUpperCase()
    || '?';
}

export function getDisplayName(profil: Partial<ProfilDetail>): string {
  if (profil.prenom && profil.nom) return `${profil.prenom} ${profil.nom}`;
  if (profil.nom) return profil.nom;
  return profil.username || profil.email || 'Profil sans nom';
}
