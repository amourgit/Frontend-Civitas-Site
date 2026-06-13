# Guide d'intégration IAM → Core Frontend

## Architecture Module Federation

```
Core (React + Vite, port 3001)
    │
    ├── vite.config.ts
    │     federation({
    │       remotes: {
    │         iam: 'iam@http://localhost:3000/static/chunks/remoteEntry.js'
    │       }
    │     })
    │
    └── src/modules/IAMModule.tsx
          const IAMApp = lazy(() => import('iam/App'))
          <IAMApp basePath="/iam" coreContext={ctx} />

IAM Microservice (Next.js 15 + Webpack, port 3000)
    │
    ├── next.config.mjs
    │     NextFederationPlugin({
    │       name: 'iam',
    │       filename: 'static/chunks/remoteEntry.js',
    │       exposes: { './App': './remote/App', ... }
    │     })
    │
    └── /static/chunks/remoteEntry.js  ← chargé par le Core
```

---

## 1. Configuration Vite (Core)

```ts
// vite.config.ts dans le Core
import federation from '@originjs/vite-plugin-federation'

export default {
  plugins: [
    federation({
      name: 'core',
      remotes: {
        iam: process.env.VITE_IAM_URL
          ? `iam@${process.env.VITE_IAM_URL}/static/chunks/remoteEntry.js`
          : 'iam@http://localhost:3000/static/chunks/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: { target: 'esnext' },
}
```

---

## 2. Chargement du module IAM dans le Core

```tsx
// src/modules/IAMModule.tsx (Core)
import { lazy, Suspense } from 'react'
import type { CoreContext } from '@/contracts/types'

// Import MF — résolu par vite-plugin-federation à la compilation
const IAMApp = lazy(() => import('iam/App'))

export function IAMModule({ coreContext }: { coreContext: CoreContext }) {
  return (
    <Suspense fallback={<ModuleLoader name="IAM Central" />}>
      <IAMApp
        basePath="/iam"
        coreContext={{
          ...coreContext,
          hasShellLayout: true,   // ← IMPORTANT : le Core fournit le shell
        }}
      />
    </Suspense>
  )
}
```

---

## 3. Injection du CoreContext

```tsx
// Ce que le Core DOIT fournir à IAM :
const coreContext: CoreContext = {
  user: {
    id:       keycloakUser.id,
    username: keycloakUser.username,
    email:    keycloakUser.email,
    roles:    keycloakUser.realmRoles,
    token:    keycloak.token,
    tenantId: activeTenant.id,
  },
  tenant: {
    id:        activeTenant.id,
    subdomain: activeTenant.subdomain,
    name:      activeTenant.name,
  },
  basePath:       '/iam',
  navigate:       (path) => router.push(path),   // react-router navigate
  hasShellLayout: true,                           // Core fournit TopBar + LeftBar
  permissions:    keycloakUser.resourceAccess,
}
```

---

## 4. Navigation IAM dans le Core

```ts
// Récupérer la navigation via API (JSON, pas d'import MF requis)
const { items, groups } = await fetch('http://iam.local/api/iam/navigation').then(r => r.json())

// Ou via Module Federation (nécessite que le Core soit configuré avec MF) :
import { iamNavigation, iamNavigationGroups } from 'iam/navigation'
```

---

## 5. Variables d'environnement requises

### IAM (`.env.local`)
```
NEXT_PUBLIC_IAM_URL=http://localhost:3000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ioi
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=iam-frontend
```

### Core (`.env`)
```
VITE_IAM_URL=http://localhost:3000
VITE_REGISTRY_URL=http://localhost:4000
VITE_KEYCLOAK_URL=http://localhost:8080
```

---

## 6. Routing interne IAM

IAM gère son routing interne (sous `/iam/*`). Le Core ne doit PAS
définir de routes pour `/iam/*` — il doit tout déléguer à IAMApp.

```tsx
// Dans le Core Router
<Route path="/iam/*" element={<IAMModule coreContext={ctx} />} />
```

---

## 7. Checklist de mise en production

- [ ] IAM accessible sur `https://iam.ioi.ga`
- [ ] CORS configuré pour autoriser le Core (`Access-Control-Allow-Origin: https://core.ioi.ga`)
- [ ] `remoteEntry.js` accessible : `curl https://iam.ioi.ga/static/chunks/remoteEntry.js`
- [ ] API manifest OK : `curl https://iam.ioi.ga/api/iam/manifest`
- [ ] API navigation OK : `curl https://iam.ioi.ga/api/iam/navigation`
- [ ] React partagé en singleton (vérifier les DevTools MF)
- [ ] Token SSO injecté dans `coreContext.user.token`
