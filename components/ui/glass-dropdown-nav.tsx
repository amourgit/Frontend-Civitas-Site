// ============================================================
// components/ui/glass-dropdown-nav.tsx
// TYPE 2 — Navigation avec sous-menus déroulants au hover
// Source : DropdownNavigation du document fourni — adapté glassmorphism
//
// Usage :
//   <GlassDropdownNav items={NAV_ITEMS} active={active} onChange={setActive} />
//
// Indépendant, modulaire. Le design original (layoutId "hover-bg", "menu",
// AnimatePresence, ChevronDown rotation) est conservé intégralement.
// Seul l'aspect visuel : fond transparent/blur (glass) au lieu de bg-background.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface GlassDropdownNavItem {
  id:        string;
  label:     string;
  icon?:     React.ElementType;
  subItems?: {
    id:          string;
    label:       string;
    description?: string;
    icon?:        React.ElementType;
  }[];
}

interface GlassDropdownNavProps {
  items:    GlassDropdownNavItem[];
  active:   string;
  onChange: (id: string) => void;
  /** Identifiant unique pour les layoutId — évite les conflits */
  instanceId?: string;
}

export function GlassDropdownNav({
  items,
  active,
  onChange,
  instanceId = 'dropdown',
}: GlassDropdownNavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);

  return (
    <ul
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        0,
        listStyle:  'none',
        padding:    0,
        margin:     0,
        position:   'relative',
      }}
    >
      {items.map((item) => {
        const isHov    = hovered  === item.id;
        const isOpen   = openMenu === item.id;
        const isActive = active   === item.id || item.subItems?.some(s => s.id === active);
        const Icon     = item.icon;

        return (
          <li
            key={item.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => { setOpenMenu(item.id); setHovered(item.id); }}
            onMouseLeave={() => { setOpenMenu(null);    setHovered(null);    }}
          >
            {/* Trigger button */}
            <button
              onClick={() => !item.subItems && onChange(item.id)}
              style={{
                background: 'none',
                border:     'none',
                outline:    'none',
                cursor:     'pointer',
                position:   'relative',
                display:    'flex',
                alignItems: 'center',
                gap:        5,
                padding:    '7px 13px',
                borderRadius: 9,
                fontSize:   12,
                fontWeight: isActive ? 600 : 500,
                color:      isActive
                  ? 'rgba(255,255,255,0.88)'
                  : 'rgba(255,255,255,0.45)',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Hover background — identique au DropdownNavigation original */}
              {(isHov || isOpen) && (
                <motion.div
                  layoutId={`${instanceId}-hover-bg`}
                  style={{
                    position:     'absolute',
                    inset:        0,
                    borderRadius: 9,
                    // Glass transparent au lieu de bg-primary/10
                    background:   'rgba(255,255,255,0.07)',
                    zIndex:       0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                {Icon && <Icon size={13} style={{ color: isActive ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.35)', flexShrink: 0 }} />}
                {item.label}
                {item.subItems && (
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      transition: 'transform 0.25s',
                      transform:  isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                )}
              </span>
            </button>

            {/* Active indicator dot */}
            {isActive && (
              <div style={{
                position:   'absolute',
                bottom:     2,
                left:       '50%',
                transform:  'translateX(-50%)',
                width:      4,
                height:     4,
                borderRadius: '50%',
                background: '#4f9cf9',
                boxShadow:  '0 0 6px rgba(79,156,249,.60)',
              }} />
            )}

            {/* Dropdown panel — identique à DropdownNavigation original */}
            <AnimatePresence>
              {isOpen && item.subItems && (
                <div
                  style={{
                    position: 'absolute',
                    left:     0,
                    top:      '100%',
                    paddingTop: 8,
                    zIndex:   100,
                    minWidth: 200,
                  }}
                >
                  <motion.div
                    layoutId={`${instanceId}-menu`}
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={  { opacity: 0, y: -6,  scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      // Glassmorphism au lieu de bg-background
                      background:    'rgba(8,8,22,0.88)',
                      backdropFilter:'blur(24px) saturate(180%)',
                      border:        '1px solid rgba(255,255,255,0.12)',
                      borderRadius:  14,
                      boxShadow:     '0 16px 48px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)',
                      padding:       '8px 6px',
                      minWidth:      180,
                    }}
                  >
                    {item.subItems.map((sub, i) => {
                      const SubIcon = sub.icon;
                      const isSub   = active === sub.id;

                      return (
                        <motion.button
                          key={sub.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0  }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => onChange(sub.id)}
                          style={{
                            display:    'flex',
                            alignItems: 'center',
                            gap:        10,
                            width:      '100%',
                            padding:    '9px 12px',
                            borderRadius: 9,
                            background: isSub ? 'rgba(79,156,249,0.12)' : 'transparent',
                            border:     `1px solid ${isSub ? 'rgba(79,156,249,0.20)' : 'transparent'}`,
                            cursor:     'pointer',
                            textAlign:  'left',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!isSub) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          }}
                          onMouseLeave={e => {
                            if (!isSub) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {SubIcon && (
                            <div style={{
                              width:      30,
                              height:     30,
                              borderRadius: 8,
                              background: isSub ? 'rgba(79,156,249,0.16)' : 'rgba(255,255,255,0.06)',
                              border:     `1px solid ${isSub ? 'rgba(79,156,249,0.25)' : 'rgba(255,255,255,0.08)'}`,
                              display:    'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.15s',
                            }}>
                              <SubIcon size={13} style={{ color: isSub ? '#4f9cf9' : 'rgba(255,255,255,0.50)' }} />
                            </div>
                          )}
                          <div>
                            <div style={{
                              fontSize:   12,
                              fontWeight: isSub ? 600 : 500,
                              color:      isSub ? '#4f9cf9' : 'rgba(255,255,255,0.72)',
                              lineHeight: 1.3,
                            }}>
                              {sub.label}
                            </div>
                            {sub.description && (
                              <div style={{
                                fontSize: 10,
                                color:    'rgba(255,255,255,0.35)',
                                marginTop: 1,
                                lineHeight: 1.3,
                              }}>
                                {sub.description}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
