
import React from 'react';

// ── RouteGuard ────────────────────────────────────────────
// Pass-through — aucune logique de verrouillage de route.
// La gestion des accès est entièrement déléguée à Keycloak
// via les rôles et permissions natifs, gérés au niveau des
// composants et de l'API (non au niveau du routage frontend).
// ──────────────────────────────────────────────────────────

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  return <>{children}</>;
}

export default RouteGuard;
