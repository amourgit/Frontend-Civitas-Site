// ============================================================
// components/layouts/Topbar/TopBarLevel2.tsx
// Niveau 2 — Barre principale : Logo CIVITAS · Navigation · Actions
// Glass morphism Apple-grade · Three.js-ready · Motion
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { useGlass } from "@/hooks/useGlass";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, Bell, User, ChevronDown,
  Sparkles, Zap, X, Moon, Sun,
} from "lucide-react";

// ─── Items de navigation principale ──────────────────────────
const NAV_ITEMS = [
  {
    id: "solutions",
    label: "Solutions",
    children: [
      { label: "IA Générative",   desc: "Modèles LLM sur mesure",          path: "/solutions/ia-generative",   icon: "🧠" },
      { label: "Vision IA",       desc: "Traitement d'images & vidéos",     path: "/solutions/vision",          icon: "👁️" },
      { label: "IA Conversationnelle", desc: "Chatbots & assistants",       path: "/solutions/conversationnel", icon: "💬" },
      { label: "Analytics IA",    desc: "Insights data en temps réel",      path: "/solutions/analytics",       icon: "📊" },
    ],
  },
  {
    id: "platforme",
    label: "Plateforme",
    children: [
      { label: "Infrastructure",  desc: "Cloud IA scalable & sécurisé",     path: "/plateforme/infra",          icon: "☁️" },
      { label: "API Gateway",     desc: "Intégrations API intelligentes",   path: "/plateforme/api",            icon: "🔗" },
      { label: "IAM Central",     desc: "Identités & accès granulaires",    path: "/plateforme/iam",            icon: "🔐" },
    ],
  },
  {
    id: "ressources",
    label: "Ressources",
    path: "/ressources",
  },
  {
    id: "tarifs",
    label: "Tarifs",
    path: "/tarifs",
  },
];

// ─── Sous-menu mega ───────────────────────────────────────────
interface MegaMenuProps {
  items: { label: string; desc: string; path: string; icon: string }[];
  onClose: () => void;
}

const MegaMenu = ({ items, onClose }: MegaMenuProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1      }}
      exit={{   opacity: 0, y: -8, scale: 0.97    }}
      transition={{ duration: 0.2, ease: [0.42, 0, 0.18, 1] }}
      style={{
        position:            "absolute",
        top:                 "calc(100% + 8px)",
        left:                "50%",
        transform:           "translateX(-50%)",
        width:               "360px",
        background:          "var(--glass-dropdown-bg, rgba(8,12,30,0.88))",
        backdropFilter:      "blur(32px) saturate(1.8)",
        WebkitBackdropFilter:"blur(32px) saturate(1.8)",
        border:              "1px solid rgba(255,255,255,0.08)",
        borderRadius:        "var(--radius-xl, 16px)",
        boxShadow:           "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1) inset",
        padding:             "var(--space-2)",
        zIndex:              200,
      }}
    >
      {/* Orb de brillance interne */}
      <div
        aria-hidden
        style={{
          position:     "absolute",
          top:          "-30px",
          left:         "50%",
          transform:    "translateX(-50%)",
          width:        "140px",
          height:       "60px",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          filter:       "blur(15px)",
          pointerEvents:"none",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-1)" }}>
        {items.map((item) => (
          <motion.button
            key={item.path}
            onClick={() => { navigate(item.path); onClose(); }}
            whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.05)" } as any}
            whileTap={{ scale: 0.98 }}
            style={{
              display:      "flex",
              flexDirection:"column",
              alignItems:   "flex-start",
              gap:          "2px",
              padding:      "var(--space-3) var(--space-3)",
              borderRadius: "var(--radius-lg, 10px)",
              background:   "transparent",
              border:       "none",
              cursor:       "pointer",
              textAlign:    "left",
              transition:   "background 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span style={{
                fontSize:   "var(--fs-sm, 13px)",
                fontWeight: "600",
                color:      "var(--surface-foreground, #f1f5f9)",
              }}>
                {item.label}
              </span>
            </div>
            <span style={{
              fontSize: "var(--fs-xs, 11px)",
              color:    "var(--surface-mutedForeground, #64748b)",
              paddingLeft: "24px",
            }}>
              {item.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────
interface TopBarLevel2Props {
  className?: string;
  isScrolled?: boolean;
}

export default function TopBarLevel2({ className = "", isScrolled = false }: TopBarLevel2Props) {
  const { isDark, toggleDarkMode } = useTheme();
  const glassHeader = useGlass("header");
  const navigate    = useNavigate();
  const location    = useLocation();
  const { user }    = useAuth();

  const [openMenu,       setOpenMenu]       = useState<string | null>(null);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [notifCount]                        = useState(3);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef    = useRef<HTMLDivElement>(null);

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const isActive = (path?: string) =>
    path ? location.pathname.startsWith(path) : false;

  return (
    <div
      ref={navRef}
      className={`w-full flex items-center justify-between ${className}`}
      style={{
        height:               "var(--topbar-l2-height, 56px)",
        padding:              "0 var(--space-6)",
        background:           isScrolled
          ? "var(--glass-header-bg, rgba(8,12,30,0.85))"
          : "transparent",
        backdropFilter:       isScrolled ? "blur(24px) saturate(1.6)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(1.6)" : "none",
        borderBottom:         isScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition:           "all 0.4s cubic-bezier(0.42,0,0.18,1)",
        position:             "relative",
        zIndex:               50,
      }}
    >
      {/* ── LOGO CIVITAS ────────────────────────────────────── */}
      <Link
        to="/"
        style={{ textDecoration: "none", flexShrink: 0 }}
        onClick={() => setOpenMenu(null)}
      >
        <motion.div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Icône logo */}
          <div
            style={{
              width:        "34px",
              height:       "34px",
              borderRadius: "10px",
              background:   "linear-gradient(135deg, var(--primary-500, #6366f1) 0%, var(--secondary-500, #d946ef) 100%)",
              display:      "flex",
              alignItems:   "center",
              justifyContent:"center",
              boxShadow:    "0 0 20px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
              position:     "relative",
              overflow:     "hidden",
            }}
          >
            {/* Shimmer interne */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
              style={{
                position:   "absolute",
                top:        0,
                left:       0,
                width:      "40%",
                height:     "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" }}>
              C
            </span>
          </div>

          {/* Texte */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{
              fontSize:      "var(--fs-base, 15px)",
              fontWeight:    "800",
              letterSpacing: "-0.02em",
              color:         "var(--surface-foreground, #f8fafc)",
              fontFamily:    "var(--font-sans)",
            }}>
              CIVITAS
            </span>
            <span style={{
              fontSize:   "8.5px",
              fontWeight: "500",
              color:      "var(--primary-400, #818cf8)",
              letterSpacing:"0.15em",
              textTransform:"uppercase",
            }}>
              AI Platform
            </span>
          </div>
        </motion.div>
      </Link>

      {/* ── NAVIGATION CENTRALE ─────────────────────────────── */}
      <nav
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        "var(--space-1)",
          flex:       1,
          justifyContent:"center",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path) || (item.children?.some(c => isActive(c.path)));
          const open   = openMenu === item.id;

          return (
            <div key={item.id} style={{ position: "relative" }}>
              <motion.button
                onClick={() => {
                  if (item.children) {
                    setOpenMenu(open ? null : item.id);
                  } else if (item.path) {
                    navigate(item.path);
                    setOpenMenu(null);
                  }
                }}
                whileHover={{ background: "rgba(255,255,255,0.06)" } as any}
                whileTap={{ scale: 0.97 }}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "4px",
                  padding:      "6px 12px",
                  borderRadius: "var(--radius-lg, 8px)",
                  background:   open ? "rgba(255,255,255,0.06)" : "transparent",
                  border:       "none",
                  cursor:       "pointer",
                  fontSize:     "var(--fs-sm, 13px)",
                  fontWeight:   active ? "600" : "500",
                  color:        active
                    ? "var(--primary-300, #a5b4fc)"
                    : "var(--surface-foreground, #f8fafc)",
                  transition:   "all 0.2s ease",
                  position:     "relative",
                }}
              >
                <span>{item.label}</span>
                {item.children && (
                  <ChevronDown style={{
                    width:     "12px",
                    height:    "12px",
                    transform: open ? "rotate(180deg)" : "rotate(0)",
                    transition:"transform 0.2s ease",
                    opacity:   0.7,
                  }} />
                )}
                {/* Underline actif */}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    style={{
                      position:   "absolute",
                      bottom:     "2px",
                      left:       "12px",
                      right:      "12px",
                      height:     "2px",
                      borderRadius:"1px",
                      background: "linear-gradient(90deg, var(--primary-400, #818cf8), var(--secondary-400, #e879f9))",
                    }}
                  />
                )}
              </motion.button>

              {/* Mega Menu */}
              <AnimatePresence>
                {open && item.children && (
                  <MegaMenu items={item.children} onClose={() => setOpenMenu(null)} />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── ACTIONS DROITE ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>

        {/* Recherche */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "220px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.42, 0, 0.18, 1] }}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-2)",
                background:   "rgba(255,255,255,0.06)",
                border:       "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-lg, 10px)",
                padding:      "6px var(--space-3)",
                overflow:     "hidden",
              }}
            >
              <Search style={{ width: "14px", height: "14px", color: "var(--surface-mutedForeground)", flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border:     "none",
                  outline:    "none",
                  fontSize:   "var(--fs-sm, 13px)",
                  color:      "var(--surface-foreground)",
                  width:      "100%",
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X style={{ width: "12px", height: "12px", color: "var(--surface-mutedForeground)" }} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-closed"
              onClick={() => setSearchOpen(true)}
              whileHover={{ background: "rgba(255,255,255,0.06)" } as any}
              whileTap={{ scale: 0.95 }}
              style={{
                display:      "flex",
                alignItems:   "center",
                justifyContent:"center",
                width:        "34px",
                height:       "34px",
                borderRadius: "var(--radius-lg, 10px)",
                background:   "transparent",
                border:       "none",
                cursor:       "pointer",
                transition:   "background 0.2s ease",
              }}
            >
              <Search style={{ width: "16px", height: "16px", color: "var(--surface-mutedForeground)" }} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Toggle dark/light */}
        <motion.button
          onClick={toggleDarkMode}
          whileHover={{ background: "rgba(255,255,255,0.06)" } as any}
          whileTap={{ scale: 0.95 }}
          style={{
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            width:        "34px",
            height:       "34px",
            borderRadius: "var(--radius-lg, 10px)",
            background:   "transparent",
            border:       "none",
            cursor:       "pointer",
            transition:   "background 0.2s ease",
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div key="sun"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
              >
                <Sun  style={{ width: "16px", height: "16px", color: "var(--surface-mutedForeground)" }} />
              </motion.div>
            ) : (
              <motion.div key="moon"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
              >
                <Moon style={{ width: "16px", height: "16px", color: "var(--surface-mutedForeground)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ background: "rgba(255,255,255,0.06)" } as any}
          whileTap={{ scale: 0.95 }}
          style={{
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
            width:         "34px",
            height:        "34px",
            borderRadius:  "var(--radius-lg, 10px)",
            background:    "transparent",
            border:        "none",
            cursor:        "pointer",
            position:      "relative",
            transition:    "background 0.2s ease",
          }}
        >
          <Bell style={{ width: "16px", height: "16px", color: "var(--surface-mutedForeground)" }} />
          {notifCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position:      "absolute",
                top:           "5px",
                right:         "5px",
                width:         "8px",
                height:        "8px",
                borderRadius:  "50%",
                background:    "var(--primary-500, #6366f1)",
                border:        "1.5px solid var(--surface-background, #0f172a)",
                boxShadow:     "0 0 6px var(--primary-400, #818cf8)",
              }}
            />
          )}
        </motion.button>

        {/* Divider */}
        <div style={{
          width:      "1px",
          height:     "20px",
          background: "rgba(255,255,255,0.1)",
          margin:     "0 var(--space-1)",
        }} />

        {/* Bouton Se connecter */}
        <motion.button
          onClick={() => navigate("/auth/login")}
          whileHover={{ background: "rgba(255,255,255,0.08)" } as any}
          whileTap={{ scale: 0.97 }}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            padding:      "6px 14px",
            borderRadius: "var(--radius-lg, 10px)",
            background:   "transparent",
            border:       "1px solid rgba(255,255,255,0.1)",
            cursor:       "pointer",
            fontSize:     "var(--fs-sm, 13px)",
            fontWeight:   "500",
            color:        "var(--surface-foreground, #f8fafc)",
            transition:   "all 0.2s ease",
          }}
        >
          <User style={{ width: "13px", height: "13px" }} />
          <span>Connexion</span>
        </motion.button>

        {/* Bouton CTA principal */}
        <motion.button
          onClick={() => navigate("/demo")}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99,102,241,0.5)" } as any}
          whileTap={{ scale: 0.97 }}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            padding:      "7px 16px",
            borderRadius: "var(--radius-lg, 10px)",
            background:   "linear-gradient(135deg, var(--primary-500, #6366f1), var(--secondary-500, #d946ef))",
            border:       "none",
            cursor:       "pointer",
            fontSize:     "var(--fs-sm, 13px)",
            fontWeight:   "600",
            color:        "#ffffff",
            boxShadow:    "0 0 20px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
            transition:   "all 0.3s ease",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
            style={{
              position:   "absolute",
              top:        0,
              left:       0,
              width:      "40%",
              height:     "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }}
          />
          <Sparkles style={{ width: "13px", height: "13px" }} />
          <span>Essai Gratuit</span>
        </motion.button>
      </div>
    </div>
  );
}
