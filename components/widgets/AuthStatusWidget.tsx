// ============================================================
// components/widgets/AuthStatusWidget.tsx
// Widget topbar : affiche l'avatar + nom + menu rapide auth
// Utilisé dans la barre de navigation principale
// ============================================================


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, KeyRound, Monitor, ChevronDown,
  Shield, Settings, Activity,
} from 'lucide-react';
import { useIAMAuth } from '@/hooks/useIAMAuth';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';

export default function AuthStatusWidget() {
  const { user, logout, isAuthenticated, isLoading } = useIAMAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    toast({ variant: 'info', title: 'Déconnexion...', duration: 1500 });
    await logout();
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-xl animate-pulse"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Shield className="w-3.5 h-3.5" />
        Connexion
      </Link>
    );
  }

  const displayName = user?.prenom && user?.nom
    ? `${user.prenom} ${user.nom}`
    : user?.username || 'Mon compte';

  return (
    <div ref={menuRef} className="relative">
      {/* Bouton trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
        style={{ border: isOpen ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent' }}
      >
        <UserAvatar
          prenom={user?.prenom}
          nom={user?.nom}
          username={user?.username}
          statut={user?.statut}
          isAdmin={user?.is_admin}
          size="sm"
          showStatus
        />
        <span className="text-sm text-white/80 font-medium max-w-[100px] truncate hidden sm:block">
          {displayName}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(10,10,20,0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* En-tête utilisateur */}
            <div className="p-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <UserAvatar
                  prenom={user?.prenom}
                  nom={user?.nom}
                  username={user?.username}
                  statut={user?.statut}
                  isAdmin={user?.is_admin}
                  size="md"
                  showStatus
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-white/40 truncate">@{user?.username}</p>
                  {user?.is_admin && (
                    <span className="text-xs text-amber-400">Administrateur</span>
                  )}
                </div>
              </div>
            </div>

            {/* Liens du menu */}
            <div className="p-2">
              <MenuItem href="/auth/compte" icon={User} label="Mon profil" onClick={() => setIsOpen(false)} />
              <MenuItem href="/auth/sessions" icon={Monitor} label="Mes sessions" onClick={() => setIsOpen(false)} />
              <MenuItem href="/auth/password" icon={KeyRound} label="Changer le MDP" onClick={() => setIsOpen(false)} />
              <MenuItem href="/habilitations/moi" icon={Shield} label="Mes habilitations" onClick={() => setIsOpen(false)} />
              <MenuItem href="/audit/moi" icon={Activity} label="Mon activité" onClick={() => setIsOpen(false)} />
            </div>

            {/* Déconnexion */}
            <div className="p-2 border-t border-white/8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Item de menu ──────────────────────────────────────────
function MenuItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
