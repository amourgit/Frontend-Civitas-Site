// ============================================================
// components/providers/InactivityGuard.tsx
// Composant de garde d'inactivité — Affiche un avertissement
// 2 minutes avant la déconnexion automatique.
//
// Intégration : placer dans le layout principal, à l'intérieur de <AuthProvider>
// <InactivityGuard /> — aucune prop requise
// ============================================================


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldOff, RefreshCw } from 'lucide-react';
import { useAuthContext } from '@/lib/auth-store';
import { useInactivityGuard } from '@/hooks/useSessionMonitor';
import { INACTIVITY } from '@/lib/security/constants';

export function InactivityGuard() {
  const { isAuthenticated } = useAuthContext();
  const [showWarning,   setShowWarning]   = useState(false);
  const [secondsLeft,   setSecondsLeft]   = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((initial: number) => {
    setSecondsLeft(initial);
    setShowWarning(true);
    clearCountdown();

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearCountdown();
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);
  }, [clearCountdown]);

  const { resetActivity } = useInactivityGuard((secs) => {
    startCountdown(secs);
  });

  // Dismisser l'avertissement et réinitialiser l'inactivité
  const handleStayConnected = useCallback(() => {
    clearCountdown();
    setShowWarning(false);
    resetActivity();
  }, [clearCountdown, resetActivity]);

  // Nettoyer si l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      clearCountdown();
      setShowWarning(false);
    }
  }, [isAuthenticated, clearCountdown]);

  // Formater les secondes en MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Pourcentage de temps restant (par rapport à WARNING_BEFORE_MS)
  const totalSecs  = Math.round(INACTIVITY.WARNING_BEFORE_MS / 1000);
  const progressPct = Math.round((secondsLeft / totalSecs) * 100);

  return (
    <AnimatePresence>
      {showWarning && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: '-50%' }}
          animate={{ opacity: 1, y: 0,  x: '-50%' }}
          exit={  { opacity: 0, y: 80,  x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-[9998] w-full max-w-sm"
        >
          <div
            className="mx-4 rounded-2xl overflow-hidden"
            style={{
              background:    'rgba(5,5,20,0.95)',
              border:        '1px solid rgba(245,158,11,0.35)',
              boxShadow:     '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.12)',
              backdropFilter:'blur(24px)',
            }}
          >
            {/* Barre de progression */}
            <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full"
                style={{
                  width:      `${progressPct}%`,
                  background: progressPct > 50
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                  transition: 'width 1s linear, background 0.5s ease',
                }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icône */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border:     '1px solid rgba(245,158,11,0.25)',
                  }}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-white">Session inactive</p>
                    <span
                      className="text-lg font-mono font-bold tabular-nums"
                      style={{
                        color: progressPct > 50 ? '#fbbf24' : '#f87171',
                      }}
                    >
                      {formatTime(secondsLeft)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Déconnexion automatique dans {formatTime(secondsLeft)} par inactivité.
                  </p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleStayConnected}
                  className="flex-1 h-9 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.25))',
                    border:     '1px solid rgba(245,158,11,0.3)',
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rester connecté
                </button>
                <button
                  onClick={() => {
                    clearCountdown();
                    setShowWarning(false);
                  }}
                  className="h-9 px-3 rounded-xl text-xs text-white/35 hover:text-white/60 transition-colors flex items-center gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  Ignorer
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
