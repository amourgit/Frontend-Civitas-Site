// ============================================================
// components/providers/AuthProvider.tsx
// Version publique — stub sans Keycloak pour le site vitrine.
// L'auth complète (token-manager, realm-resolver…) est réservée
// au module IAM embarqué dans le Core.
// ============================================================

import React, { createContext, useContext, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading:       boolean;
  user:            null;
  roles:           string[];
  permissions:     string[];
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading:       false,
  user:            null,
  roles:           [],
  permissions:     [],
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ isAuthenticated: false, isLoading: false, user: null, roles: [], permissions: [] }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthProvider() {
  return useContext(AuthContext);
}
