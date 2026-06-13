// ============================================================
// services/navigation.ts
// Navigation complète IAM Central — architecture modulaire
//
// Philosophie : 1 compte = N profils
// Modules couverts :
//   Compte · Profils · Rôles · Permissions
//   Groupes · Clients · Scopes · Sessions · Événements · Fédération
//   Authentification · Fournisseurs · Organisations · Realm · Workflows
// ============================================================

import {
  Home,
  User,
  Users,
  UserPlus,
  Settings,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Fingerprint,
  Globe,
  Building2,
  Network,
  Layers,
  GitBranch,
  Workflow,
  FileText,
  FileKey,
  BookOpen,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  Bell,
  Search,
  Plus,
  List,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Link,
  Database,
  Server,
  Cpu,
  Box,
  Grid3x3,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Award,
  Zap,
  Tag,
  Package,
  Puzzle,
  Radio,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Ban,
  Landmark,
  Flag,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface NavigationItem {
  id:          string;
  label:       string;
  description?: string;       // Texte descriptif affiché dans la sidebar
  icon?:       any;
  path:        string;
  badge?:      string;        // ex: "new", "beta", "v26"
  group?:      string;        // ID du groupe auquel appartient cet item
  children?:   NavigationItem[];
}

/** Définition d\'un groupe de navigation affiché dans la sidebar */
export interface NavigationGroup {
  id:          string;
  label:       string;
  description?: string;
  icon?:       any;
  color?:      string;        // Couleur accent du groupe (Tailwind arbitraire ou hex)
}

// ─────────────────────────────────────────────────────────────
// GROUPES — référentiel des groupes de modules
// ─────────────────────────────────────────────────────────────

export const navigationGroups: NavigationGroup[] = [
  {
    id:          'identite',
    label:       'Identité',
    description: 'Gestion des comptes utilisateurs et de leurs profils associés',
    icon:        Users,
    color:       '#6366f1',   // indigo
  },
  {
    id:          'acces',
    label:       'Accès & Autorisations',
    description: 'Permissions, rôles realm et groupes de sécurité',
    icon:        Shield,
    color:       '#0ea5e9',   // sky
  },
  {
    id:          'applications',
    label:       'Applications',
    description: 'Clients OAuth/OIDC et périmètres de token (scopes)',
    icon:        Box,
    color:       '#8b5cf6',   // violet
  },
  {
    id:          'surveillance',
    label:       'Surveillance',
    description: 'Sessions actives, journal des événements et traces d\'audit',
    icon:        Activity,
    color:       '#f59e0b',   // amber
  },
  {
    id:          'federation',
    label:       'Fédération & IdP',
    description: 'Annuaires externes (LDAP, AD) et fournisseurs d\'identité',
    icon:        Globe,
    color:       '#10b981',   // emerald
  },
  {
    id:          'administration',
    label:       'Administration',
    description: 'Configuration du realm, flux d\'authentification, organisations et workflows',
    icon:        Settings,
    color:       '#ef4444',   // red
  },
];

// ─────────────────────────────────────────────────────────────
// NAVIGATION COMPLÈTE
// ─────────────────────────────────────────────────────────────

export const navigationData: NavigationItem[] = [

  // ── ACCUEIL ──────────────────────────────────────────────
  {
    id: 'accueil', label: 'Accueil', description: 'Tableau de bord principal', icon: Home, path: '/home', children: [],
  },

  // ── MODULES ──────────────────────────────────────────────
  {
    id: 'modules', label: 'Modules', icon: Grid3x3, path: '/modules',
    children: [

      // ─ COMPTE — groupe: identite ──────────────────────────
      {
        id:          'compte',
        label:       'Comptes',
        description: 'Gestion des comptes utilisateurs (1 compte = N profils)',
        icon:        User,
        path:        '/modules/compte',
        group:       'identite',
        children: [
          { id: 'compte_liste',     label: 'Liste',        description: 'Tous les comptes enregistrés',    icon: List, path: '/modules/compte/liste',     children: [] },
          { id: 'compte_creer',     label: 'Créer',        description: 'Ouvrir un nouveau compte',        icon: Plus, path: '/modules/compte/creer',     children: [] },
          { id: 'compte_suspendus', label: 'Suspendus',    description: 'Comptes désactivés ou bloqués',   icon: Ban,  path: '/modules/compte/suspendus', children: [] },
          { id: 'compte_details',   label: 'Fiche compte', description: 'Détail d\'un compte spécifique',   icon: Eye,  path: '/modules/compte/details',   children: [] },
        ],
      },

      // ─ PROFILS — groupe: identite ─────────────────────────
      {
        id:          'profils',
        label:       'Profils',
        description: 'Profils rattachés aux comptes (étudiant, enseignant, parent…)',
        icon:        Users,
        path:        '/modules/profils',
        group:       'identite',
        children: [
          { id: 'profils_liste', label: 'Liste',  description: 'Tous les profils actifs', icon: List, path: '/modules/profils',       children: [] },
          { id: 'profils_creer', label: 'Créer',  description: 'Créer un nouveau profil', icon: Plus, path: '/modules/profils/creer', children: [] },
        ],
      },

      // ─ PERMISSIONS — groupe: acces ────────────────────────
      {
        id:          'permissions',
        label:       'Permissions',
        description: 'Droits d\'accès fins sur les ressources du système',
        icon:        Shield,
        path:        '/modules/permissions',
        group:       'acces',
        children: [
          { id: 'perm_liste',   label: 'Liste',   description: 'Toutes les permissions définies',  icon: List,     path: '/modules/permissions',         children: [] },
          { id: 'perm_creer',   label: 'Créer',   description: 'Définir une nouvelle permission',  icon: Plus,     path: '/modules/permissions/creer',   children: [] },
          { id: 'perm_sources', label: 'Sources', description: 'Origines et mapping des droits',   icon: Database, path: '/modules/permissions/sources', children: [] },
        ],
      },

      // ─ RÔLES REALM — groupe: acces ────────────────────────
      {
        id:          'realmroles',
        label:       'Rôles Realm',
        description: 'Rôles globaux Keycloak attribuables aux utilisateurs',
        icon:        Award,
        path:        '/modules/realmroles',
        group:       'acces',
        children: [
          { id: 'realmroles_liste', label: 'Liste',  description: 'Tous les rôles du realm',      icon: List, path: '/modules/realmroles',       children: [] },
          { id: 'realmroles_creer', label: 'Créer',  description: 'Créer un nouveau rôle realm',  icon: Plus, path: '/modules/realmroles/creer', children: [] },
        ],
      },

      // ─ GROUPES — groupe: acces ────────────────────────────
      {
        id:          'groupes',
        label:       'Groupes',
        description: 'Arborescence de groupes Keycloak avec héritage de rôles',
        icon:        Network,
        path:        '/modules/groupes',
        group:       'acces',
        children: [
          { id: 'groupes_liste', label: 'Liste & arborescence', description: 'Vue hiérarchique des groupes', icon: List, path: '/modules/groupes',       children: [] },
          { id: 'groupes_creer', label: 'Créer',                description: 'Créer un groupe ou sous-groupe', icon: Plus, path: '/modules/groupes/creer', children: [] },
        ],
      },

      // ─ CLIENTS — groupe: applications ────────────────────
      {
        id:          'clients',
        label:       'Clients',
        description: 'Applications OAuth2/OIDC/SAML enregistrées dans le realm',
        icon:        Box,
        path:        '/modules/clients',
        group:       'applications',
        children: [
          { id: 'clients_liste', label: 'Liste',  description: 'Tous les clients enregistrés',    icon: List, path: '/modules/clients',       children: [] },
          { id: 'clients_creer', label: 'Créer',  description: 'Enregistrer une nouvelle application', icon: Plus, path: '/modules/clients/creer', children: [] },
        ],
      },

      // ─ SCOPES — groupe: applications ─────────────────────
      {
        id:          'scopes',
        label:       'Client Scopes',
        description: 'Périmètres réutilisables de claims et mappers de tokens',
        icon:        Tag,
        path:        '/modules/scopes',
        group:       'applications',
        children: [
          { id: 'scopes_liste', label: 'Liste',  description: 'Tous les scopes configurés', icon: List, path: '/modules/scopes',       children: [] },
          { id: 'scopes_creer', label: 'Créer',  description: 'Définir un nouveau scope',   icon: Plus, path: '/modules/scopes/creer', children: [] },
        ],
      },

      // ─ SESSIONS — groupe: surveillance ───────────────────
      {
        id:          'sessions',
        label:       'Sessions',
        description: 'Sessions utilisateur actives, offline et révocation de tokens',
        icon:        Activity,
        path:        '/modules/sessions',
        group:       'surveillance',
        children: [
          { id: 'sessions_actives',    label: 'Actives',    description: 'Sessions en cours',          icon: Radio,   path: '/modules/sessions/actives',    children: [] },
          { id: 'sessions_offline',    label: 'Offline',    description: 'Tokens offline persistants', icon: Clock,   path: '/modules/sessions/offline',    children: [] },
          { id: 'sessions_revocation', label: 'Révocation', description: 'Invalider des tokens',       icon: XCircle, path: '/modules/sessions/revocation', children: [] },
        ],
      },

      // ─ ÉVÉNEMENTS — groupe: surveillance ─────────────────
      {
        id:          'evenements',
        label:       'Événements',
        description: 'Journal des connexions et des actions administratives',
        icon:        Bell,
        path:        '/modules/evenements',
        group:       'surveillance',
        children: [
          { id: 'evt_connexion', label: 'Connexion', description: 'Événements login/logout',       icon: LogIn,      path: '/modules/evenements/connexion', children: [] },
          { id: 'evt_admin',     label: 'Admin',     description: 'Actions administratives',       icon: ShieldCheck,path: '/modules/evenements/admin',    children: [] },
        ],
      },

      // ─ FÉDÉRATION — groupe: federation ───────────────────
      {
        id:          'federation',
        label:       'Fédération',
        description: 'Providers externes LDAP, Active Directory, Kerberos',
        icon:        Database,
        path:        '/modules/federation',
        group:       'federation',
        children: [
          { id: 'fed_liste', label: 'Providers',        description: 'Annuaires connectés',         icon: List, path: '/modules/federation',       children: [] },
          { id: 'fed_creer', label: 'Ajouter provider', description: 'Connecter un nouvel annuaire', icon: Plus, path: '/modules/federation/creer', children: [] },
        ],
      },

      // ─ FOURNISSEURS D'IDENTITÉ — groupe: federation ──────
      {
        id:          'fournisseurs',
        label:       "Fournisseurs d'identité",
        description: 'SSO externe : OIDC, SAML, réseaux sociaux',
        icon:        Globe,
        path:        '/modules/fournisseurs',
        group:       'federation',
        children: [
          { id: 'fourni_liste', label: 'Liste',   description: 'Tous les IdP configurés', icon: List, path: '/modules/fournisseurs',       children: [] },
          { id: 'fourni_creer', label: 'Ajouter', description: 'Connecter un IdP externe', icon: Plus, path: '/modules/fournisseurs/creer', children: [] },
        ],
      },

      // ─ AUTHENTIFICATION — groupe: administration ─────────
      {
        id:          'authentification',
        label:       'Authentification',
        description: 'Flux d\'auth, liaisons, actions requises, politiques MDP/OTP/WebAuthn',
        icon:        Lock,
        path:        '/modules/authentification',
        group:       'administration',
        children: [
          {
            id: 'auth_flows', label: 'Flux (Flows)', description: 'Séquences d\'authentification Keycloak', icon: GitBranch, path: '/modules/authentification/flows',
            children: [
              { id: 'flows_liste', label: 'Liste',  icon: List, path: '/modules/authentification/flows',       children: [] },
              { id: 'flows_creer', label: 'Créer',  icon: Plus, path: '/modules/authentification/flows/creer', children: [] },
            ],
          },
          { id: 'auth_liaisons',     label: 'Liaisons',          description: 'Binding des flows aux clients',        icon: Link,        path: '/modules/authentification/liaisons',           children: [] },
          { id: 'auth_actions',      label: 'Actions requises',  description: 'Étapes obligatoires à la connexion',    icon: CheckCircle, path: '/modules/authentification/actions-requises',   children: [] },
          { id: 'auth_pol_mdp',      label: 'Politique MDP',     description: 'Règles de complexité des mots de passe',icon: Key,         path: '/modules/authentification/politique-mdp',      children: [] },
          { id: 'auth_pol_otp',      label: 'Politique OTP',     description: 'Configuration TOTP/HOTP',               icon: Fingerprint,  path: '/modules/authentification/politique-otp',      children: [] },
          { id: 'auth_pol_webauthn', label: 'WebAuthn / FIDO2',  description: 'Authentification sans mot de passe',    icon: ShieldCheck,  path: '/modules/authentification/politique-webauthn', children: [] },
        ],
      },

      // ─ ORGANISATIONS — groupe: administration ─────────────
      {
        id:          'organisations',
        label:       'Organisations',
        description: 'Multi-tenant Keycloak v26+ — isolation par organisation',
        icon:        Building2,
        path:        '/modules/organisations',
        badge:       'v26',
        group:       'administration',
        children: [
          { id: 'org_liste', label: 'Liste',  description: 'Toutes les organisations',       icon: List, path: '/modules/organisations',       children: [] },
          { id: 'org_creer', label: 'Créer',  description: 'Créer une nouvelle organisation', icon: Plus, path: '/modules/organisations/creer', children: [] },
        ],
      },

      // ─ REALM SETTINGS — groupe: administration ────────────
      {
        id:          'realm',
        label:       'Realm Settings',
        description: 'Configuration globale du realm Keycloak',
        icon:        Landmark,
        path:        '/modules/realm',
        group:       'administration',
        children: [
          { id: 'realm_general',      label: 'Général',               description: 'Nom, affichage, options générales',    icon: Settings,   path: '/modules/realm/general',            children: [] },
          { id: 'realm_login',        label: 'Login',                  description: 'Page de connexion et options SSO',    icon: LogIn,      path: '/modules/realm/login',              children: [] },
          { id: 'realm_email',        label: 'Email / SMTP',           description: 'Serveur mail pour les notifications', icon: Mail,       path: '/modules/realm/email',              children: [] },
          { id: 'realm_themes',       label: 'Thèmes',                 description: 'Personnalisation de l\'interface',     icon: Layers,     path: '/modules/realm/themes',             children: [] },
          { id: 'realm_localisation', label: 'Localisation',           description: 'Langue et formats régionaux',         icon: Globe,      path: '/modules/realm/localisation',       children: [] },
          { id: 'realm_cles',         label: 'Clés cryptographiques',  description: 'RSA, EC, HMAC pour la signature JWT', icon: FileKey,    path: '/modules/realm/cles',               children: [] },
          { id: 'realm_tokens',       label: 'Tokens & Sessions',      description: 'Durée de vie des tokens et sessions', icon: Clock,      path: '/modules/realm/tokens',             children: [] },
          { id: 'realm_securite',     label: 'Sécurité',               description: 'Brute-force, headers CSP, CORS',      icon: ShieldCheck,path: '/modules/realm/securite',           children: [] },
          { id: 'realm_profil_user',  label: 'Profil utilisateur',     description: 'Attributs et champs du profil',       icon: User,       path: '/modules/realm/profil-utilisateur', children: [] },
        ],
      },

      // ─ WORKFLOWS — groupe: administration ─────────────────
      {
        id:          'workflows',
        label:       'Workflows',
        description: 'Processus IGA automatisés Keycloak v26.4+',
        icon:        Workflow,
        path:        '/modules/workflows',
        badge:       'v26.4',
        group:       'administration',
        children: [
          { id: 'wf_liste', label: 'Liste',  description: 'Tous les workflows configurés', icon: List, path: '/modules/workflows',       children: [] },
          { id: 'wf_creer', label: 'Créer',  description: 'Créer un nouveau workflow',      icon: Plus, path: '/modules/workflows/creer', children: [] },
        ],
      },

    ],
  },

  // ── MON ESPACE (utilisateur connecté) ────────────────────
  {
    id: 'auth', label: 'Mon Espace', icon: LogIn, path: '/auth',
    children: [
      { id: 'auth_compte',        label: 'Mon compte',    description: 'Informations de votre compte',           icon: User,       path: '/auth/compte',        children: [] },
      { id: 'auth_habilitations', label: 'Habilitations', description: 'Rôles et permissions qui vous sont octroyés', icon: Shield,     path: '/auth/habilitations', children: [] },
      { id: 'auth_sessions',      label: 'Mes sessions',  description: 'Appareils et sessions actives',           icon: Activity,   path: '/auth/sessions',      children: [] },
      { id: 'auth_journal',       label: 'Mon journal',   description: 'Historique de vos connexions',            icon: FileText,   path: '/auth/journal',       children: [] },
      { id: 'auth_securite',      label: 'Sécurité',      description: 'MFA, WebAuthn, clés de sécurité',         icon: ShieldCheck,path: '/auth/securite',      children: [] },
      { id: 'auth_password',      label: 'Mot de passe',      description: 'Changer votre mot de passe',              icon: Key,        path: '/auth/password',      children: [] },
      { id: 'auth_logout',        label: 'Déconnexion',   description: 'Fermer la session en cours',              icon: LogOut,     path: '/auth/logout',        children: [] },
    ],
  },

  // ── PARAMÈTRES ───────────────────────────────────────────
  {
    id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings',
    children: [
      { id: 'settings_profils', label: 'Profil', description: 'Préférences de votre profil', icon: User,   path: '/settings/profils', children: [] },
      { id: 'settings_themes',  label: 'Thèmes', description: 'Apparence de l\'interface',    icon: Layers, path: '/settings/themes',  children: [] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Trouver un item par son id (recherche récursive) */
export function findNavItem(
  id: string,
  items: NavigationItem[] = navigationData
): NavigationItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const found = findNavItem(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

/** Trouver le chemin de breadcrumb vers un item */
export function findNavBreadcrumb(
  path: string,
  items: NavigationItem[] = navigationData,
  ancestors: NavigationItem[] = []
): NavigationItem[] {
  for (const item of items) {
    if (item.path === path) return [...ancestors, item];
    if (item.children?.length) {
      const found = findNavBreadcrumb(path, item.children, [...ancestors, item]);
      if (found.length) return found;
    }
  }
  return [];
}

/** Aplatir toutes les routes en liste (pour le middleware, sitemap, etc.) */
export function flattenNavRoutes(
  items: NavigationItem[] = navigationData
): NavigationItem[] {
  const result: NavigationItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children?.length) {
      result.push(...flattenNavRoutes(item.children));
    }
  }
  return result;
}

/**
 * Depuis une liste d\'items (enfants d\'un module racine),
 * retourne un tableau de groupes avec leurs items respectifs,
 * suivi des items sans groupe.
 */
export function groupNavItems(items: NavigationItem[]): {
  grouped:   { group: NavigationGroup; items: NavigationItem[] }[];
  ungrouped: NavigationItem[];
} {
  const grouped: { group: NavigationGroup; items: NavigationItem[] }[] = [];
  const ungrouped: NavigationItem[] = [];

  // Conserver l'ordre des groupes tel que défini dans navigationGroups
  const groupMap = new Map<string, NavigationItem[]>();

  for (const item of items) {
    if (item.group) {
      if (!groupMap.has(item.group)) groupMap.set(item.group, []);
      groupMap.get(item.group)!.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  for (const groupDef of navigationGroups) {
    const groupItems = groupMap.get(groupDef.id);
    if (groupItems?.length) {
      grouped.push({ group: groupDef, items: groupItems });
    }
  }

  return { grouped, ungrouped };
}
