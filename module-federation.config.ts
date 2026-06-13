// ============================================================
// module-federation.config.ts
// Configuration Module Federation — Microservice IAM
//
// ⚠️  NOTE COMPATIBILITÉ Next.js 16 + Turbopack
// @module-federation/nextjs-mf ne supporte que Next ≤ 15.
// Pour Next.js 16, l'intégration se fait via :
//   1. API Routes (/api/iam/manifest, /api/iam/navigation)
//   2. Import dynamique cross-origin via le runtime navigateur
//   3. Ce fichier documente le contrat, sans plugin webpack
//
// Quand @module-federation/nextjs-mf supportera Next 16,
// ce fichier sera utilisé directement dans next.config.mjs.
// ============================================================

// Placeholder type (sera remplacé quand le plugin supportera Next 16)
type ModuleFederationPluginOptions = Record<string, any>;

// ── Configuration de référence (pour quand Next 16 sera supporté) ──
export const IAMFederationConfig = {
  name: 'iam',
  filename: 'static/chunks/remoteEntry.js',
  exposes: {
    './App':        './remote/App',
    './navigation': './remote/navigation',
    './manifest':   './remote/manifest',
  },
  shared: {
    react:            { singleton: true, requiredVersion: '^18.3.1' },
    'react-dom':      { singleton: true, requiredVersion: '^18.3.1' },
    'next/navigation':{ singleton: true },
    'framer-motion':  { singleton: true, requiredVersion: '^11.18.2' },
  },
};

// ── Intégration actuelle (Next.js 16) ─────────────────────
// Le Core découvre IAM via :
//   GET /api/iam/manifest   → métadonnées + moduleUrl
//   GET /api/iam/navigation → arborescence de navigation
//
// Le Core charge IAM via :
//   window.open ou <iframe> pointant sur les routes /modules/*
//   ou navigation directe si same-origin
//
// Voir : core-contracts/INTEGRATION_GUIDE.md

export default IAMFederationConfig;
