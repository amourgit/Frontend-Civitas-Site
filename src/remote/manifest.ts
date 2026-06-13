// ============================================================
// src/remote/manifest.ts — Metadata CIVITAS Site
// ============================================================

export interface CivitasManifest {
  id:             string;
  label:          string;
  description:    string;
  iconName:       string;
  color:          string;
  basePath:       string;
  version:        string;
  company:        string;
  tagline:        string;
  routes: Array<{
    path: string; label: string; iconName: string;
    description?: string; isPublic?: boolean;
  }>;
}

const manifest: CivitasManifest = {
  id:          'civitas-site',
  label:       'CIVITAS',
  description: 'Plateforme IA de nouvelle génération — Solutions intelligentes pour les entreprises',
  iconName:    'Sparkles',
  color:       '#6366f1',
  basePath:    '/',
  version:     '1.0.0',
  company:     'CIVITAS AI',
  tagline:     'L\'Intelligence Artificielle au service de votre entreprise',
  routes: [
    { path: '/',                        label: 'Accueil',          iconName: 'Home',      isPublic: true },
    { path: '/solutions',               label: 'Solutions',        iconName: 'Cpu',       isPublic: true },
    { path: '/solutions/ia-generative', label: 'IA Générative',   iconName: 'Brain',     isPublic: true },
    { path: '/solutions/vision',        label: 'Vision IA',       iconName: 'Eye',       isPublic: true },
    { path: '/solutions/conversationnel',label:'Conversationnel', iconName: 'MessageSquare', isPublic: true },
    { path: '/solutions/analytics',     label: 'Analytics IA',   iconName: 'BarChart3', isPublic: true },
    { path: '/plateforme',              label: 'Plateforme',      iconName: 'Layers',    isPublic: true },
    { path: '/plateforme/infra',        label: 'Infrastructure',  iconName: 'Server',    isPublic: true },
    { path: '/plateforme/api',          label: 'API Gateway',     iconName: 'Link',      isPublic: true },
    { path: '/plateforme/iam',          label: 'IAM Central',     iconName: 'Shield',    isPublic: true },
    { path: '/ressources',              label: 'Ressources',      iconName: 'BookOpen',  isPublic: true },
    { path: '/tarifs',                  label: 'Tarifs',          iconName: 'DollarSign',isPublic: true },
    { path: '/demo',                    label: 'Démo',            iconName: 'Play',      isPublic: true },
    { path: '/auth/login',              label: 'Connexion',       iconName: 'LogIn',     isPublic: true },
  ],
};

export default manifest;
