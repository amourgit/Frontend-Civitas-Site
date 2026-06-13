// ============================================================
// src/remote/App.tsx — Point d'entrée CIVITAS Site
// Route principale : / → HomePageContent
// Architecture : React Router + ThemeProvider + AuthProvider
// ============================================================

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Providers ─────────────────────────────────────────────────
import { ThemeProvider } from '../../lib/theme';
import { AuthProvider  } from '../../components/providers/AuthProvider';
import ParticlesBackground from "../../components/kokonutui/particles-background"
import VerticalMenu from "../../components/vertical-menu"

// ── Pages lazy ────────────────────────────────────────────────
const HomePage = React.lazy(() => import('../pages/home/home'));

// ── Props contrat Core ─────────────────────────────────────────
export interface CoreUser {
  id: string; username: string; email: string;
  prenom?: string; nom?: string;
  roles: string[]; token: string; tenantId: string;
}
export interface CoreTenant {
  id: string; subdomain: string; name: string;
  logoUrl?: string; theme?: { primary: string; secondary: string };
}
export interface CoreContext {
  user?:          CoreUser;
  tenant?:        CoreTenant;
  basePath?:      string;
  navigate?:      (path: string) => void;
  hasShellLayout?:boolean;
  permissions?:   string[];
}
export interface CivitasAppProps {
  coreContext?: CoreContext;
  basePath?:    string;
  embedded?:    boolean;
}

// ── Loader ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', flexDirection:'column', gap:16,
      background:'#070c1a',
    }}>
      <div style={{
        width:32, height:32,
        border:'2.5px solid rgba(99,102,241,0.15)',
        borderTop:'2.5px solid #6366f1',
        borderRadius:'50%', animation:'spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:'system-ui' }}>
        Chargement…
      </span>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Routeur CIVITAS ───────────────────────────────────────────
function CivitasRoutes({ basePath }: { basePath: string }) {
  const bp = basePath === '/' ? '' : basePath;
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={`${bp}/`}    element={<HomePage />} />
        <Route path={`${bp}`}     element={<HomePage />} />
        {/* Catch-all → Home */}
        <Route path="*"           element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}

// ── Composant principal ────────────────────────────────────────
export default function CivitasApp({
  coreContext,
  basePath = '/',
  embedded = false,
}: CivitasAppProps) {
  const resolvedBase = coreContext?.basePath ?? basePath;

  return (
    <ThemeProvider defaultTheme="default" enableDarkMode>
      <AuthProvider>
        <VerticalMenu />
        <CivitasRoutes basePath={resolvedBase} />
      </AuthProvider>
    </ThemeProvider>
  );
}


