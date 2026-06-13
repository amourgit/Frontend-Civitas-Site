// ============================================================
// services/iam/keycloakProfilsAdapter.ts
// Adaptateur Keycloak → type Profil (interface locale des composants)
//
// Mappe UserRepresentation (Keycloak) → Profil (UI)
// et expose toutes les actions CRUD via keycloakUsersService.
// ============================================================

import { keycloakUsersService } from './keycloakUsersService';
import type { UserRepresentation, UserSessionRepresentation } from '@/lib/models/iam/keycloak-user.model';
import type {
  Profil, ProfilAttribute, ProfilCredential, ProfilRole,
  ProfilGroup, ProfilSession, ProfilConsent, ProfilStatut, ProfilType,
  ProfilsDataAdapter,
} from '@/components/pages/module/profils/ui/types';

// ── REALM (dynamique via sous-domaine) ────────────────────
import { getCurrentRealmName } from './_realmHelper';

/** Retourne le realm courant dynamiquement */
function getRealm(): string {
  return getCurrentRealmName();
}

// ── Mapping statut Keycloak → ProfilStatut ────────────────
function toStatut(user: UserRepresentation): ProfilStatut {
  if (!user.enabled) return 'suspendu';
  // Heuristique : si createdTimestamp > 1 an sans connexion → inactif
  if (user.createdTimestamp) {
    const created = new Date(user.createdTimestamp);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (created < oneYearAgo) return 'inactif';
  }
  return 'actif';
}

// ── Mapping type Keycloak → ProfilType ───────────────────
// Basé sur les realm roles ou attributs du user
function toType(user: UserRepresentation): ProfilType {
  const roles = user.realmRoles ?? [];
  if (roles.includes('direction'))             return 'direction';
  if (roles.includes('enseignant_chercheur'))  return 'enseignant_chercheur';
  if (roles.includes('enseignant'))            return 'enseignant';
  if (roles.includes('personnel_technique'))   return 'personnel_technique';
  if (roles.includes('personnel_admin'))       return 'personnel_admin';
  if (roles.includes('etudiant'))              return 'etudiant';
  if (roles.includes('invite'))                return 'invite';
  // Fallback via attribut "type_profil"
  const typeAttr = user.attributes?.['type_profil']?.[0];
  if (typeAttr) return typeAttr as ProfilType;
  // Service accounts → systeme
  if (user.serviceAccountClientId)            return 'systeme';
  return 'invite';
}

// ── Mapping credentials Keycloak → ProfilCredential ──────
function toCredentials(user: UserRepresentation): ProfilCredential[] {
  return (user.credentials ?? []).map(c => ({
    id:        c.id        ?? `cred-${Math.random()}`,
    type:      (c.type ?? 'password') as ProfilCredential['type'],
    label:     c.userLabel ?? c.type ?? 'Credential',
    createdAt: c.createdDate ? new Date(c.createdDate).toISOString() : new Date().toISOString(),
    lastUsed:  null,
    userLabel: c.userLabel,
    temporary: c.temporary ?? false,
  }));
}

// ── Mapping roles Keycloak → ProfilRole ──────────────────
function toRoles(user: UserRepresentation): ProfilRole[] {
  const realmRoles = (user.realmRoles ?? []).map(name => ({
    id:     `realm-${name}`,
    name,
    source: 'realm' as const,
  }));
  const clientRoles = Object.entries(user.clientRoles ?? {}).flatMap(([client, roles]) =>
    (roles as string[]).map(name => ({
      id:     `client-${client}-${name}`,
      name,
      source: 'client' as const,
      client,
    }))
  );
  return [...realmRoles, ...clientRoles];
}

// ── Mapping attributes Keycloak → ProfilAttribute ────────
function toAttributes(user: UserRepresentation): ProfilAttribute[] {
  return Object.entries(user.attributes ?? {}).map(([key, values]) => ({
    key,
    values: Array.isArray(values) ? values.map(String) : [String(values)],
  }));
}

// ── Mapping sessions Keycloak → ProfilSession ────────────
function toSessions(sessions: UserSessionRepresentation[]): ProfilSession[] {
  return sessions.map(s => ({
    id:         s.id         ?? `sess-${Math.random()}`,
    ip:         s.ipAddress  ?? '—',
    startedAt:  s.start      ? new Date(s.start * 1000).toISOString()      : new Date().toISOString(),
    lastAccess: s.lastAccess ? new Date(s.lastAccess * 1000).toISOString() : new Date().toISOString(),
    clients:    Object.values(s.clients ?? {}),
  }));
}

// ── Mapping consents Keycloak → ProfilConsent ────────────
function toConsents(rawConsents: unknown[]): ProfilConsent[] {
  return rawConsents.map((c: any) => ({
    clientId:   c.clientId   ?? '—',
    clientName: c.clientName ?? c.clientId ?? '—',
    grantedAt:  c.createdDate
      ? new Date(c.createdDate).toISOString()
      : new Date().toISOString(),
    scopes: c.grantedClientScopes ?? [],
  }));
}

// ── Mapping principal UserRepresentation → Profil ────────
export function keycloakUserToProfil(
  user: UserRepresentation,
  sessions: UserSessionRepresentation[] = [],
  consents: unknown[] = [],
): Profil {
  const attrs = user.attributes ?? {};

  return {
    id:       user.id       ?? `kc-${user.username}`,
    compteId: user.id       ?? '',

    // Identité
    username:  user.username  ?? '',
    email:     user.email     ?? '',
    firstName: user.firstName ?? '',
    lastName:  user.lastName  ?? '',
    emailVerified: user.emailVerified ?? false,
    enabled:       user.enabled       ?? false,

    statut: toStatut(user),
    type:   toType(user),

    // identifiantNational : priorité à l'attribut Keycloak "identifiant_national"
    identifiantNational:
      attrs['identifiant_national']?.[0] ??
      attrs['matricule']?.[0] ??
      attrs['employee_number']?.[0] ??
      user.username ?? '—',

    // Dates
    createdAt: user.createdTimestamp
      ? new Date(user.createdTimestamp).toISOString()
      : new Date().toISOString(),
    lastLogin: null, // Keycloak ne retourne pas lastLogin dans UserRepresentation standard

    // Données liées (peuvent être vides si non chargées)
    attributes:  toAttributes(user),
    credentials: toCredentials(user),
    roles:       toRoles(user),
    groups:      [], // chargé séparément via listGroups()
    consents:    toConsents(consents),
    sessions:    toSessions(sessions),
    adminEvents: [], // non disponible directement sur un user

    // Actions requises
    requiredActions: user.requiredActions ?? [],

    // nbConnexions : Keycloak ne l'expose pas en standard → 0 par défaut
    nbConnexions: 0,
  };
}

// ============================================================
// Adaptateur complet ProfilsDataAdapter ← Keycloak
// ============================================================
export const profilsKeycloakAdapter: ProfilsDataAdapter = {

  async getAll(params = {}) {
    const realm   = (params as any).realm ?? getRealm();
    const search  = params.search;
    const first   = params.first  ?? 0;
    const max     = params.max    ?? 200;

    const users = await keycloakUsersService.list(
      { first, max, ...(search ? { search } : {}) },
      realm
    );

    // Mapping simple sans sessions (trop coûteux à charger en masse)
    return users.map(u => keycloakUserToProfil(u));
  },

  async suspend(id: string) {
    await keycloakUsersService.setEnabled(id, false, getRealm());
  },

  async enable(id: string) {
    await keycloakUsersService.setEnabled(id, true, getRealm());
  },

  async delete(id: string) {
    await keycloakUsersService.delete(id, getRealm());
  },
};

// ============================================================
// Chargeur détaillé pour la page de détail d'un profil
// Charge toutes les données liées (sessions, groupes, consents)
// ============================================================
export async function loadProfilDetail(userId: string, realm: string = getRealm()): Promise<Profil> {
  // Appels parallèles pour minimiser la latence
  const [user, sessions, groups, consents] = await Promise.all([
    keycloakUsersService.getById(userId, { userProfileMetadata: false }, realm),
    keycloakUsersService.listSessions(userId, realm).catch(() => []),
    keycloakUsersService.listGroups(userId, {}, realm).catch(() => []),
    keycloakUsersService.listConsents(userId, realm).catch(() => []),
  ]);

  const profil = keycloakUserToProfil(user, sessions, consents);

  // Mapper les groupes
  profil.groups = groups.map(g => ({
    id:   g.id   ?? `grp-${Math.random()}`,
    name: g.name ?? '—',
    path: g.path ?? `/${g.name ?? '—'}`,
  }));

  return profil;
}
