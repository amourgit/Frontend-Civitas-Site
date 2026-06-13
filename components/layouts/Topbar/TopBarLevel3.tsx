// ============================================================
// components/layouts/Topbar/TopBarLevel3.tsx
// Niveau 3 — Barre contextuelle : Breadcrumb · Tabs · Actions rapides
// Glass morphism · Dynamique selon la page courante
// ============================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/lib/theme";
import { useGlass } from "@/hooks/useGlass";
import {
  ChevronRight, Home, Zap, BarChart3,
  Cpu, Database, Lock, Settings, ArrowUpRight,
} from "lucide-react";

// ─── Map des onglets par section ─────────────────────────────
const SECTION_TABS: Record<string, { id: string; label: string; path: string; icon?: React.ReactNode }[]> = {
  solutions: [
    { id: "ia-generative",   label: "IA Générative",      path: "/solutions/ia-generative",   icon: <Cpu size={12} /> },
    { id: "vision",          label: "Vision",             path: "/solutions/vision",           icon: <Zap size={12} /> },
    { id: "conversationnel", label: "Conversationnel",    path: "/solutions/conversationnel",  icon: <BarChart3 size={12} /> },
    { id: "analytics",       label: "Analytics",          path: "/solutions/analytics",        icon: <Database size={12} /> },
  ],
  plateforme: [
    { id: "infra", label: "Infrastructure", path: "/plateforme/infra", icon: <Cpu size={12} /> },
    { id: "api",   label: "API Gateway",    path: "/plateforme/api",   icon: <Zap size={12} /> },
    { id: "iam",   label: "IAM Central",   path: "/plateforme/iam",   icon: <Lock size={12} /> },
  ],
};

// ─── Breadcrumb dynamique ─────────────────────────────────────
const BREADCRUMB_LABELS: Record<string, string> = {
  solutions:       "Solutions",
  plateforme:      "Plateforme",
  ressources:      "Ressources",
  tarifs:          "Tarifs",
  demo:            "Démo",
  auth:            "Authentification",
  "ia-generative": "IA Générative",
  vision:          "Vision IA",
  conversationnel: "Conversationnel",
  analytics:       "Analytics IA",
  infra:           "Infrastructure",
  api:             "API Gateway",
  iam:             "IAM Central",
};

// ─── Indicateurs de statut ────────────────────────────────────
const STATUS_INDICATORS = [
  { label: "Tous les systèmes opérationnels", color: "#22c55e", pulse: true },
];

// ─── Composant ────────────────────────────────────────────────
interface TopBarLevel3Props {
  className?: string;
}

export default function TopBarLevel3({ className = "" }: TopBarLevel3Props) {
  const { isDark } = useTheme();
  const glassSmall = useGlass("sm");
  const location   = useLocation();
  const navigate   = useNavigate();

  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; path: string }[]>([]);
  const [activeTabs,  setActiveTabs]  = useState<typeof SECTION_TABS["solutions"] | null>(null);
  const [activeTab,   setActiveTab]   = useState<string | null>(null);
  const [statusIdx]                   = useState(0);

  // Calculer breadcrumb et onglets depuis l'URL
  useEffect(() => {
    const segments = location.pathname.replace(/^\//, "").split("/").filter(Boolean);

    // Breadcrumbs
    const crumbs = segments.map((seg, i) => ({
      label: BREADCRUMB_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      path:  "/" + segments.slice(0, i + 1).join("/"),
    }));
    setBreadcrumbs(crumbs);

    // Onglets de section
    const section = segments[0];
    const tabs     = SECTION_TABS[section] ?? null;
    setActiveTabs(tabs);

    // Onglet actif
    if (tabs) {
      const match = tabs.find((t) => location.pathname.startsWith(t.path));
      setActiveTab(match?.id ?? null);
    } else {
      setActiveTab(null);
    }
  }, [location.pathname]);

  // Sur la home, ne pas afficher ce niveau
  if (location.pathname === "/" || location.pathname === "") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="level3"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{   opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.42, 0, 0.18, 1] }}
        className={`w-full flex items-center justify-between ${className}`}
        style={{
          height:               "var(--topbar-l3-height, 36px)",
          padding:              "0 var(--space-6)",
          background:           glassSmall.background,
          backdropFilter:       glassSmall.backdropFilter,
          WebkitBackdropFilter: glassSmall.backdropFilter,
          borderBottom:         "1px solid rgba(255,255,255,0.04)",
          position:             "relative",
        }}
      >
        {/* ── GAUCHE : Breadcrumb ────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
          {/* Icône Home */}
          <Link
            to="/"
            style={{
              display:      "flex",
              alignItems:   "center",
              padding:      "3px 6px",
              borderRadius: "var(--radius-sm, 4px)",
              color:        "var(--surface-mutedForeground, #64748b)",
              textDecoration:"none",
              transition:   "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color      = "var(--surface-foreground, #f1f5f9)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color      = "var(--surface-mutedForeground, #64748b)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Home style={{ width: "11px", height: "11px" }} />
          </Link>

          {/* Segments */}
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight style={{ width: "10px", height: "10px", color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
              <Link
                to={crumb.path}
                style={{
                  fontSize:     "11px",
                  fontWeight:   i === breadcrumbs.length - 1 ? "600" : "400",
                  color:        i === breadcrumbs.length - 1
                    ? "var(--surface-foreground, #f1f5f9)"
                    : "var(--surface-mutedForeground, #64748b)",
                  textDecoration: "none",
                  padding:      "3px 6px",
                  borderRadius: "var(--radius-sm, 4px)",
                  transition:   "all 0.15s ease",
                  whiteSpace:   "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (i < breadcrumbs.length - 1) {
                    e.currentTarget.style.color      = "var(--surface-foreground, #f1f5f9)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color      = i === breadcrumbs.length - 1
                    ? "var(--surface-foreground, #f1f5f9)"
                    : "var(--surface-mutedForeground, #64748b)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* ── CENTRE : Onglets contextuels ──────────────────── */}
        {activeTabs && (
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "2px",
              position:   "absolute",
              left:       "50%",
              transform:  "translateX(-50%)",
            }}
          >
            {activeTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { navigate(tab.path); setActiveTab(tab.id); }}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "4px",
                    padding:      "4px 10px",
                    borderRadius: "var(--radius-md, 6px)",
                    background:   isActive ? "rgba(99,102,241,0.15)" : "transparent",
                    border:       isActive
                      ? "1px solid rgba(99,102,241,0.3)"
                      : "1px solid transparent",
                    cursor:       "pointer",
                    fontSize:     "11px",
                    fontWeight:   isActive ? "600" : "400",
                    color:        isActive
                      ? "var(--primary-300, #a5b4fc)"
                      : "var(--surface-mutedForeground, #64748b)",
                    transition:   "all 0.2s ease",
                    position:     "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color      = "var(--surface-foreground, #f1f5f9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color      = "var(--surface-mutedForeground, #64748b)";
                    }
                  }}
                >
                  {tab.icon && (
                    <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                  )}
                  <span>{tab.label}</span>

                  {/* Underline animé */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator-l3"
                      style={{
                        position:   "absolute",
                        bottom:     "-1px",
                        left:       "10px",
                        right:      "10px",
                        height:     "2px",
                        borderRadius:"1px",
                        background: "linear-gradient(90deg, var(--primary-400, #818cf8), var(--secondary-400, #e879f9))",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── DROITE : Statut + action rapide ────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
          {/* Indicateur de statut */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ position: "relative", width: "7px", height: "7px" }}>
              {STATUS_INDICATORS[statusIdx].pulse && (
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position:     "absolute",
                    inset:        0,
                    borderRadius: "50%",
                    background:   STATUS_INDICATORS[statusIdx].color,
                  }}
                />
              )}
              <div style={{
                width:        "7px",
                height:       "7px",
                borderRadius: "50%",
                background:   STATUS_INDICATORS[statusIdx].color,
                position:     "relative",
              }} />
            </div>
            <span style={{
              fontSize: "10px",
              color:    "var(--surface-mutedForeground, #64748b)",
              fontWeight:"400",
            }}>
              {STATUS_INDICATORS[statusIdx].label}
            </span>
          </div>

          {/* Lien docs */}
          <motion.a
            href="https://docs.civitas.ai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ color: "var(--primary-300)" } as any}
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            "3px",
              fontSize:       "10px",
              color:          "var(--surface-mutedForeground, #64748b)",
              textDecoration: "none",
              transition:     "color 0.15s ease",
              fontWeight:     "400",
            }}
          >
            <span>Documentation</span>
            <ArrowUpRight style={{ width: "9px", height: "9px" }} />
          </motion.a>

          {/* Quick settings */}
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.06)" } as any}
            whileTap={{ scale: 0.95 }}
            style={{
              display:       "flex",
              alignItems:    "center",
              justifyContent:"center",
              width:         "22px",
              height:        "22px",
              borderRadius:  "var(--radius-sm, 4px)",
              background:    "transparent",
              border:        "none",
              cursor:        "pointer",
              transition:    "background 0.15s ease",
            }}
          >
            <Settings style={{ width: "11px", height: "11px", color: "var(--surface-mutedForeground, #64748b)" }} />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
