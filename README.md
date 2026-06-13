# IAM Central — Microservice Frontend

> **Vite 6 + React 18 + TypeScript + Module Federation**

## Architecture

```
IAM (remote, port 3000)          Core (host, port 3001)
├── src/remote/App.tsx  ─────→   lazy(() => import('iam/App'))
├── src/remote/manifest.ts ──→   import manifest from 'iam/manifest'
├── src/remote/navigation.ts ─→  import { iamNavItems } from 'iam/navigation'
└── dist/assets/remoteEntry.js ← chargé par le Core
```

## Décision d'architecture

`@module-federation/nextjs-mf` est **officiellement déprécié** et ne supporte pas Next.js App Router.
Ce projet est donc migré sur **Vite + `@originjs/vite-plugin-federation`** — le seul stack stable 2025/2026.

## Développement

```bash
npm install

# Mode remote (pour être consommé par le Core) :
npm run dev          # build:watch + preview sur :3000

# Mode standalone (développement isolé) :
npm run dev:standalone  # vite dev server HMR sur :3000
```

> ⚠️ Le Core doit pointer sur `http://localhost:3000/assets/remoteEntry.js`
> ⚠️ En mode remote, le build doit être fait avant que le Core charge IAM

## Intégration Core

```tsx
// Dans le Core (vite.config.ts)
federation({
  remotes: {
    iam: 'http://localhost:3000/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})

// Dans le Core (composant)
const IAMApp = lazy(() => import('iam/App'))
<IAMApp
  basePath="/iam"
  embedded={true}
  coreContext={{ user, tenant, navigate, hasShellLayout: true }}
/>
```
