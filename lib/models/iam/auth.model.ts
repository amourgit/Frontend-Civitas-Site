// ============================================================
// lib/models/iam/auth.model.ts
// Schémas Zod ALIGNÉS EXACTEMENT sur le backend FastAPI
// Source: app/schemas/token_schemas.py + profil_local.py + habilitation.py + journal.py
// ============================================================

import { z } from 'zod';

// ── Requête de login ─────────────────────────────────────────
// Backend: LoginRequest { username, password }
export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ── Infos utilisateur dans la réponse login ──────────────────
// Backend: LoginResponse.user = Dict[str, Any]
export const LoginUserSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().optional(),
  type_profil: z.string().optional(),
  statut: z.string().optional(),
  is_admin: z.boolean().optional(),
  identifiant_national: z.string().optional(),
  etablissement_code: z.string().optional(),
}).passthrough();
export type LoginUser = z.infer<typeof LoginUserSchema>;

// ── Réponse de login ─────────────────────────────────────────
// Backend: LoginResponse { access_token, refresh_token, token_type, expires_in, user, session_id }
export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('bearer'),
  expires_in: z.number(),          // secondes
  user: LoginUserSchema,           // ← objet user complet dans la réponse
  session_id: z.string(),          // ← ID de session
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ── Refresh token ────────────────────────────────────────────
// Backend: RefreshTokenRequest { refresh_token }
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Backend: RefreshTokenResponse { access_token, token_type, expires_in }
export const RefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
  expires_in: z.number(),
});
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// ── Validation de token ──────────────────────────────────────
// Backend: TokenValidationRequest { token, token_type }
export const TokenValidationRequestSchema = z.object({
  token: z.string(),
  token_type: z.string().optional().default('auto'),
});
export type TokenValidationRequest = z.infer<typeof TokenValidationRequestSchema>;

// Backend: TokenValidationResponse
export const TokenValidationResponseSchema = z.object({
  valid: z.boolean(),
  token_type: z.string().optional(),
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  type_profil: z.string().optional(),
  is_admin: z.boolean().optional(),
  issued_at: z.string().optional(),
  expires_at: z.string().optional(),
  error: z.string().optional(),
});
export type TokenValidationResponse = z.infer<typeof TokenValidationResponseSchema>;

// ── Session ──────────────────────────────────────────────────
// Backend: SessionInfo { id, user_id, status, created_at, last_activity, expires_at, user_agent, ip_address, metadata, activity_count }
export const SessionSchema = z.object({
  id: z.string(),                               // ← "id" pas "session_id" dans le backend
  user_id: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  last_activity: z.string().optional(),
  expires_at: z.string().optional(),
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  activity_count: z.number().optional(),
  // Champ calculé côté front pour rétrocompatibilité
  session_id: z.string().optional(),
}).transform((data) => ({
  ...data,
  session_id: data.session_id || data.id,  // normalisation
}));
export type Session = z.infer<typeof SessionSchema>;

export const SessionsResponseSchema = z.object({
  sessions: z.array(SessionSchema),
  count: z.number(),
});
export type SessionsResponse = z.infer<typeof SessionsResponseSchema>;

// ── Métriques token ──────────────────────────────────────────
// Backend: TokenMetrics { active_sessions, blacklisted_sessions, tokens_issued_today, sync_status }
export const TokenMetricsSchema = z.object({
  active_sessions: z.number().default(0),
  blacklisted_sessions: z.number().default(0),
  tokens_issued_today: z.number().default(0),
  sync_status: z.record(z.unknown()).default({}),
}).passthrough();
export type TokenMetrics = z.infer<typeof TokenMetricsSchema>;

// ── Stats sessions ───────────────────────────────────────────
// Backend: SessionStats { total_keys, active, revoked, by_user_agent, by_ip, ... }
export const SessionStatsSchema = z.object({
  total_keys: z.number().default(0),
  active: z.number().default(0),
  revoked: z.number().default(0),
  by_user_agent: z.record(z.number()).default({}),
  by_ip: z.record(z.number()).default({}),
  oldest_session: z.record(z.unknown()).nullable().optional(),
  newest_session: z.record(z.unknown()).nullable().optional(),
  timestamp: z.string().optional(),
}).passthrough();
export type SessionStats = z.infer<typeof SessionStatsSchema>;

// ── Changement de mot de passe ───────────────────────────────
// Backend: ChangePasswordRequest { old_password, new_password, confirm_password }
export const ChangePasswordRequestSchema = z.object({
  old_password: z.string().min(1, 'Ancien mot de passe requis'),
  new_password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

// Backend: ChangePasswordResponse { success, message, password_changed_at }
export const ChangePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  password_changed_at: z.union([z.string(), z.null()]).optional(),
});
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;

// ── Reset mot de passe (admin) ───────────────────────────────
// Backend: ResetPasswordRequest { profil_id, temp_password }
export const ResetPasswordRequestSchema = z.object({
  profil_id: z.string().uuid('UUID invalide'),
  temp_password: z.string().optional(),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Backend: ResetPasswordResponse { success, temp_password, message }
export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  temp_password: z.string().optional(),
  message: z.string(),
});
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

// ── Profil utilisateur connecté ──────────────────────────────
// Backend: ProfilResponseSchema — extends BaseResponseSchema { id, created_at, updated_at, created_by, updated_by }
export const CurrentUserSchema = z.object({
  // BaseResponseSchema
  id: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().nullable().optional(),
  updated_by: z.string().uuid().nullable().optional(),
  // ProfilResponseSchema
  user_id_national: z.string().uuid().nullable().optional(),
  nom: z.string().nullable().optional(),
  prenom: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  identifiant_national: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  type_profil: z.string(),
  statut: z.string(),
  raison_suspension: z.string().nullable().optional(),
  derniere_connexion: z.string().nullable().optional(),
  nb_connexions: z.union([z.string(), z.number()]).nullable().optional(),
  premiere_connexion: z.string().nullable().optional(),
  preferences: z.record(z.unknown()).nullable().optional(),
  meta_data: z.record(z.unknown()).nullable().optional(),
  notes: z.string().nullable().optional(),
  is_admin: z.boolean().optional(),           // enrichi côté front via token
}).passthrough();
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

// ── Habilitations ────────────────────────────────────────────
// Backend: HabilitationsSchema { profil_id, user_id_national, type_profil, statut, permissions, roles_actifs, groupes_actifs }
export const PermissionEffectiveSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  code: z.string(),
  nom: z.string(),
  domaine: z.string(),
  ressource: z.string(),
  action: z.string(),
  perimetre: z.unknown().optional(),
  source: z.string().default('direct'),
});
export type PermissionEffective = z.infer<typeof PermissionEffectiveSchema>;

export const HabilitationsSchema = z.object({
  profil_id: z.string().uuid(),
  user_id_national: z.string().uuid().nullable().optional(),
  type_profil: z.string(),
  statut: z.string(),
  permissions: z.array(PermissionEffectiveSchema).default([]),
  roles_actifs: z.array(z.string()).default([]),
  groupes_actifs: z.array(z.string()).default([]),
});
export type Habilitations = z.infer<typeof HabilitationsSchema>;

// ── Journal d'accès ──────────────────────────────────────────
// Backend: JournalAccesResponseSchema
export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(),
  profil_id: z.string().uuid().nullable().optional(),
  user_id_national: z.string().uuid().nullable().optional(),
  nom_affiche: z.string().nullable().optional(),
  type_action: z.string(),
  module: z.string().nullable().optional(),
  ressource: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  ressource_id: z.string().nullable().optional(),
  permission_verifiee: z.string().nullable().optional(),
  perimetre_verifie: z.unknown().optional(),
  autorise: z.boolean().nullable().optional(),
  raison: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  request_id: z.string().nullable().optional(),
  details: z.unknown().optional(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// ── Réponse générique ────────────────────────────────────────
export const GenericSuccessSchema = z.object({
  message: z.string(),
}).passthrough();

// ── État auth stocké ─────────────────────────────────────────
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];      // codes de permissions ex: "iam.profil.lire"
  roles: string[];            // codes de rôles
}
