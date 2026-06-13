// ============================================================
// src/remote/navigation.ts — Navigation CIVITAS Site
// Routes actives : uniquement celles qui existent dans App.tsx
// Route courante : / (Home)
// ============================================================

export interface NavItem {
  id:           string;
  label:        string;
  description?: string;
  iconName?:    string;
  path:         string;
  badge?:       string;
  group?:       string;
  children?:    NavItem[];
  isPublic?:    boolean;
}

export interface NavGroup {
  id:     string;
  label:  string;
  color?: string;
}

// ── Groupes de navigation ──────────────────────────────────
export const civitasNavGroups: NavGroup[] = [
  { id: 'principal', label: 'Principal', color: '#6366f1' },
];

// ── Items de navigation — uniquement les routes existantes ─
// Seule route opérationnelle : / (Home)
// Les autres routes (solutions, plateforme, ressources, tarifs, demo)
// ne sont pas encore créées et seront ajoutées progressivement.
export const civitasNavItems: NavItem[] = [
  {
    id:       'home',
    label:    'Accueil',
    iconName: 'Home',
    path:     '/',
    group:    'principal',
    isPublic: true,
  },
];

// Rétrocompatibilité avec les imports existants
export const iamNavItems  = civitasNavItems;
export const iamNavGroups = civitasNavGroups;
