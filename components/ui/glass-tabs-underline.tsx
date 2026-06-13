// ============================================================
// components/ui/glass-tabs-underline.tsx
// TYPE 1 — Tabs avec underline animé + hover background
// Source : TabsDemo du document fourni — adapté glassmorphism
//
// MODE : vertical (colonne gauche fixe, ne scroll pas avec le contenu)
// Toutes les animations, effets et design originaux sont conservés.
// L'underline est maintenant une barre verticale à gauche du label.
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface GlassTab {
  id:     string;
  label:  string;
  icon?:  React.ElementType;
  badge?: string | number;
}

interface GlassTabsUnderlineProps {
  items:       GlassTab[];
  active:      string;
  onChange:    (id: string) => void;
  instanceId?: string;
}

export function GlassTabsUnderline({
  items,
  active,
  onChange,
  instanceId = 'tabs',
}: GlassTabsUnderlineProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul
      style={{
        // ── Disposition verticale ──────────────────────────
        display:        'flex',
        flexDirection:  'column',
        gap:            2,
        // ── Fond glass ────────────────────────────────────
        background:     'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px) saturate(160%)',
        border:         '1px solid rgba(255,255,255,0.08)',
        borderRadius:   14,
        padding:        '6px',
        // ── Pas de scroll sur la sidebar ──────────────────
        listStyle:      'none',
        margin:         0,
        overflowY:      'visible',
        flexShrink:     0,
        width:          196,
      }}
    >
      {items.map((item) => {
        const isActive  = active  === item.id;
        const isHovered = hovered === item.id;
        const Icon      = item.icon;

        return (
          <li key={item.id} style={{ listStyle: 'none', position: 'relative' }}>
            <button
              onClick={() => onChange(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background:  'none',
                border:      'none',
                outline:     'none',
                cursor:      'pointer',
                // ── Layout horizontal interne ──────────────
                position:    'relative',
                display:     'flex',
                alignItems:  'center',
                width:       '100%',
                gap:         8,
                padding:     '9px 12px 9px 16px',
                borderRadius: 9,
                textAlign:   'left',
                // ── Texte ─────────────────────────────────
                fontSize:    13,
                fontWeight:  isActive ? 600 : 500,
                color:       isActive
                  ? 'rgba(255,255,255,0.92)'
                  : 'rgba(255,255,255,0.42)',
                transition:  'color 0.25s',
                whiteSpace:  'nowrap',
              }}
            >
              {/* Hover background — identique au TabsDemo original */}
              {isHovered && (
                <motion.div
                  layoutId={`${instanceId}-hover-bg`}
                  style={{
                    position:    'absolute',
                    inset:       0,
                    borderRadius: 9,
                    background:  'rgba(255,255,255,0.07)',
                    zIndex:      0,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Barre verticale active — remplace l'underline horizontal */}
              {isActive && (
                <motion.div
                  layoutId={`${instanceId}-active-underline`}
                  style={{
                    position:    'absolute',
                    left:        0,
                    top:         '15%',
                    bottom:      '15%',
                    width:       3,
                    borderRadius: 2,
                    background:  'linear-gradient(180deg, rgba(79,156,249,0.0) 0%, rgba(79,156,249,0.90) 50%, rgba(79,156,249,0.0) 100%)',
                    zIndex:      1,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Barre verticale hover (indépendante de l'active) */}
              {isHovered && !isActive && (
                <motion.div
                  layoutId={`${instanceId}-hover-underline`}
                  style={{
                    position:    'absolute',
                    left:        0,
                    top:         '20%',
                    bottom:      '20%',
                    width:       2,
                    borderRadius: 2,
                    background:  'rgba(255,255,255,0.18)',
                    zIndex:      1,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Contenu : icône + label + badge */}
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                {Icon && (
                  <Icon
                    size={14}
                    style={{
                      color:      isActive ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.28)',
                      transition: 'color 0.25s',
                      flexShrink: 0,
                    }}
                  />
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span style={{
                    fontSize:    10,
                    fontWeight:  600,
                    padding:     '1px 6px',
                    borderRadius: 8,
                    background:  isActive ? 'rgba(79,156,249,0.20)' : 'rgba(255,255,255,0.07)',
                    color:       isActive ? '#4f9cf9' : 'rgba(255,255,255,0.35)',
                    border:      `1px solid ${isActive ? 'rgba(79,156,249,0.28)' : 'rgba(255,255,255,0.08)'}`,
                    lineHeight:  1,
                    transition:  'all 0.25s',
                    flexShrink:  0,
                  }}>
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
