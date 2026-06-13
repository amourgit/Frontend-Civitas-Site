// ============================================================
// core-contracts/types.ts — Contrat Core ↔ Microservice IAM
//
// ⚠️  Ce fichier doit être COPIÉ dans le repo Core Frontend.
//
// Il définit l'interface stricte de communication entre
// le Core et tous les microservices via Module Federation.
//
// Version : 2.0.0 — Compatible avec le runtime MF IAM v1.x
// ============================================================

import type React from 'react';

// ── Utilisateur fourni par le Core (SSO centralisé) ─────────
export interface CoreUser {
  id:         string;
  username:   string;
  email:      string;
  prenom?:    string;
  nom?:       string;
  roles:      string[];     // Rôles Keycloak
  token:      string;       // JWT access token (court-lived)
  tenantId:   string;
  avatarUrl?: string;
}

// ── Tenant (Université / Organisation) ──────────────────────
export interface CoreTenant {
  id:        string;
  subdomain: string;        // ex: "univ-omar-bongo"
  name:      string;        // ex: "Université Omar Bongo"
  logoUrl?:  string;
  theme?: {
    primary:   string;      // couleur principale hex
    secondary: string;
  };
}

// ── Contexte injecté par le Core dans chaque microservice ───
export interface CoreContext {
  user:           CoreUser;
  tenant:         CoreTenant;
  /** Préfixe de route alloué à ce module (ex: "/iam") */
  basePath:       string;
  /** Callback de navigation Core — évite les rechargements */
  navigate:       (path: string) => void;
  /** Le Core gère-t-il déjà le shell (TopBar + LeftBar) ? */
  hasShellLayout: boolean;
  /** Permissions pré-calculées pour ce user dans ce tenant */
  permissions?:   string[];
}

// ── Props standard de chaque App MF exposée ─────────────────
export interface MicroAppProps {
  coreContext: CoreContext;
  basePath?:   string;
}

// ── Manifest exposé par un microservice ─────────────────────
export interface MicroserviceManifest {
  id:             string;
  label:          string;
  description:    string;
  icon:           React.ComponentType<any>;
  color:          string;
  basePath:       string;
  version:        string;
  requiredRoles:  string[];
  eager:          boolean;
  order:          number;
  badge?:         string;
  defaultEnabled: boolean;
  routes: Array<{
    path:           string;
    label:          string;
    icon:           string;
    description?:   string;
    requiredRoles?: string[];
  }>;
}

// ── Navigation item exposé par le microservice ───────────────
export interface MicroNavItem {
  id:           string;
  label:        string;
  description?: string;
  icon?:        React.ComponentType<any>;
  iconName?:    string;       // version sérialisée (API JSON)
  path:         string;       // path ABSOLU (inclut basePath)
  badge?:       string;
  group?:       string;
  children?:    MicroNavItem[];
}

// ── Navigation group ─────────────────────────────────────────
export interface MicroNavGroup {
  id:          string;
  label:       string;
  description?: string;
  icon?:       React.ComponentType<any>;
  color?:      string;
}

// ── Registry entry (config côté Core par tenant) ─────────────
export interface MicroserviceRegistryEntry {
  id:          string;
  enabled:     boolean;
  /** Format : "remoteName@url/static/chunks/remoteEntry.js" */
  remoteUrl:   string;
  config?:     Record<string, unknown>;
}

// ── Config MF Webpack (à injecter dans vite.config.ts du Core) ─
export interface IAMFederationConfig {
  remoteName:     'iam';
  remoteEntry:    string;   // ex: "iam@https://iam.ioi.ga/static/chunks/remoteEntry.js"
  exposedModules: {
    App:        './remote/App';
    navigation: './remote/navigation';
    manifest:   './remote/manifest';
    IAMRouter:  './remote/IAMRouter';
  };
}
