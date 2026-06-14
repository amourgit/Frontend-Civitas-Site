// ============================================================
// vite.config.ts — IAM Microservice Frontend (Vite + React)
//
// ⚠️  DÉCISION D'ARCHITECTURE :
//  - @module-federation/nextjs-mf est officiellement déprécié
//    et ne supporte PAS App Router (Next.js 15)
//  - On migre IAM vers Vite + @originjs/vite-plugin-federation
//  - Cette combinaison est la SEULE stable en production 2025/2026
//
// MODE REMOTE : IAM expose ses composants via remoteEntry.js
// Le Core (React + Vite) les consomme comme host.
//
// IMPORTANT dev workflow :
//  - Remote (IAM) doit être build avant d'être consommé
//  - npm run dev = vite build --watch + vite preview --port 3000
//  - Le Core pointe sur http://localhost:3000/assets/remoteEntry.js
// ============================================================

import { defineConfig } from 'vite';
import react           from '@vitejs/plugin-react';
import federation      from '@originjs/vite-plugin-federation';
import tailwindcss     from '@tailwindcss/vite';
import path            from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ── Module Federation — mode REMOTE ────────────────────
    federation({
      name: 'iam',
      filename: 'remoteEntry.js',

      // ── Composants exposés au Core ──────────────────────
      exposes: {
        './App':        './src/remote/App',
        './navigation': './src/remote/navigation',
        './manifest':   './src/remote/manifest',
      },

      // ── Dépendances partagées avec le Core ──────────────
      // Le Core fournit react / react-dom / react-router-dom
      // → IAM ne les recharge pas = une seule instance React
      shared: {
        react: {
          singleton:       true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton:       true,
          requiredVersion: '^18.3.1',
        },
        'react-router-dom': {
          singleton:       true,
          requiredVersion: '^6.28.0',
        },
        'framer-motion': {
          singleton:       true,
          requiredVersion: '^11.18.2',
        },
      },
    }),
  ],

  resolve: {
    alias: {
      // '@' pointe sur la racine du projet pour couvrir :
      //   @/hooks      → ./hooks/
      //   @/lib        → ./lib/
      //   @/components → ./components/
      //   @/services   → ./services/
      //   @/src        → n'est plus nécessaire — utiliser @/pages, etc.
      '@': path.resolve(__dirname, '.'),
    },
  },

  // ── CORS — le Core charge le remoteEntry.js depuis son domaine ──
  server: {
    port:   3000,
    cors:   true,
    origin: 'http://localhost:3000',
  },

  preview: {
    port:        3000,
    strictPort:  true,
    cors:        true,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  },

  // ── Build requis pour que MF fonctionne ─────────────────
  build: {
    target:       'esnext',   // top-level await requis par vite-plugin-federation
    minify:       'esbuild',  // bundle deploye (Vercel) non minifie auparavant
    cssCodeSplit: false,
  },
});
