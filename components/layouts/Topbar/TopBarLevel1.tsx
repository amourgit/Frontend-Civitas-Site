// ============================================================
// components/layouts/Topbar/TopBarLevel1.tsx
// Niveau 1 — 90px · 3 zones : Identité | Carrousel 70% | Actions
//
// GAUCHE  (15%) : Logo + Infos contact + Devise  (en colonne)
// CENTRE  (70%) : Carrousel d'annonces pleine hauteur
// DROITE  (15%) : Bouton Aide + Bouton Recherche
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useGlass } from "@/hooks/useGlass";
import {
  Sparkles, ArrowRight, HelpCircle, Search,
  Phone, Mail, X,
} from "lucide-react";

// ─── Données carrousel ────────────────────────────────────────
const ANNOUNCEMENTS = [
  {
    id:      1,
    eyebrow: "Nouveauté",
    text:    "CIVITAS AI v3.0 — Moteur d'inférence unifié, disponible dès maintenant",
    cta:     "Découvrir",
    link:    "#",
    accent:  "#818cf8",
  },
  {
    id:      2,
    eyebrow: "Communauté",
    text:    "Plus de 500 organisations font déjà confiance à CIVITAS pour leurs projets IA",
    cta:     "Témoignages",
    link:    "#",
    accent:  "#e879f9",
  },
  {
    id:      3,
    eyebrow: "Offre",
    text:    "30 jours d'essai gratuit — Infrastructure IA souveraine & sécurisée",
    cta:     "Commencer",
    link:    "#",
    accent:  "#22d3ee",
  },
];

// ─── Infos contact ────────────────────────────────────────────
const CONTACTS = [
  { icon: <Phone size={9} />, label: "+241 011 234 567" },
  { icon: <Mail  size={9} />, label: "contact@civitas.ai" },
];

const DEVISE = "L'intelligence au service de votre avenir.";

// ─── Composant ────────────────────────────────────────────────
interface TopBarLevel1Props {
  className?: string;
}

export default function TopBarLevel1({ className = "" }: TopBarLevel1Props) {
  const { isDark }   = useTheme();
  const glassXs      = useGlass("xs");

  const [idx,         setIdx]         = useState(0);
  const [direction,   setDirection]   = useState(1);   // 1 = vers le haut, -1 = vers le bas
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-rotation ─────────────────────────────────────────
  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIdx((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 4500);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(i > idx ? 1 : -1);
    setIdx(i);
    startInterval();
  };

  // ── Ouvrir la recherche ───────────────────────────────────
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const current = ANNOUNCEMENTS[idx];

  // ── Variants slide vertical ───────────────────────────────
  const variants = {
    enter:  (d: number) => ({ y: d > 0 ? "60%"  : "-60%", opacity: 0 }),
    center: { y: "0%", opacity: 1 },
    exit:   (d: number) => ({ y: d > 0 ? "-60%" : "60%",  opacity: 0 }),
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{
        height:               "90px",
        display:              "grid",
        gridTemplateColumns:  "15% 70% 15%",
        background:           glassXs.background,
        backdropFilter:       glassXs.backdropFilter,
        WebkitBackdropFilter: glassXs.backdropFilter,
        borderBottom:         "1px solid rgba(255,255,255,0.06)",
        position:             "relative",
        overflow:             "hidden",
      }}
    >
      {/* ── Orb décoratif gauche ──────────────────────────── */}
      <div aria-hidden style={{
        position:"absolute", left:"-4%", top:"50%", transform:"translateY(-50%)",
        width:"160px", height:"160px", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
        filter:"blur(28px)", pointerEvents:"none",
      }} />

      {/* ════════════════════════════════════════════════════
          COLONNE GAUCHE — Logo · Contacts · Devise
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
          alignItems:     "flex-start",
          padding:        "12px 16px 12px 20px",
          borderRight:    "1px solid rgba(255,255,255,0.05)",
          position:       "relative",
          zIndex:         1,
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{
              width:        "20px",
              height:       "20px",
              borderRadius: "5px",
              background:   "linear-gradient(135deg, #818cf8, #e879f9)",
              boxShadow:    "0 0 10px rgba(99,102,241,0.45)",
              flexShrink:   0,
            }}
          />
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
            <span style={{
              fontSize:      "12px",
              fontWeight:    "800",
              letterSpacing: "0.18em",
              color:         "#f1f5f9",
              textTransform: "uppercase",
            }}>
              CIVITAS
            </span>
            <span style={{
              fontSize:      "8px",
              fontWeight:    "500",
              letterSpacing: "0.08em",
              color:         "#818cf8",
              textTransform: "uppercase",
            }}>
              AI Solutions
            </span>
          </div>
        </div>

        {/* Contacts */}
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {CONTACTS.map((c, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <span style={{ color:"rgba(255,255,255,0.3)", display:"flex" }}>{c.icon}</span>
              <span style={{
                fontSize:  "9.5px",
                color:     "rgba(255,255,255,0.35)",
                fontWeight:"400",
                whiteSpace:"nowrap",
                overflow:  "hidden",
                textOverflow:"ellipsis",
              }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Devise */}
        <span style={{
          fontSize:      "8px",
          fontStyle:     "italic",
          color:         "rgba(255,255,255,0.2)",
          letterSpacing: "0.03em",
          lineHeight:    1.3,
          maxWidth:      "100%",
        }}>
          {DEVISE}
        </span>
      </div>

      {/* ════════════════════════════════════════════════════
          COLONNE CENTRE — Carrousel pleine hauteur 70%
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          position:    "relative",
          overflow:    "hidden",
          height:      "90px",
          display:     "flex",
          alignItems:  "center",
          justifyContent:"center",
        }}
      >
        {/* Orb central */}
        <div aria-hidden style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%, -50%)",
          width:"300px", height:"120px", borderRadius:"50%",
          background:`radial-gradient(ellipse, ${current.accent}18 0%, transparent 70%)`,
          filter:"blur(24px)", pointerEvents:"none",
          transition:"background 0.6s ease",
        }} />

        {/* Slide animée */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.42, 0, 0.18, 1] }}
            style={{
              position:       "absolute",
              inset:          0,
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "6px",
              padding:        "0 32px",
            }}
          >
            {/* Eyebrow badge */}
            <div style={{
              display:             "inline-flex",
              alignItems:          "center",
              gap:                 "5px",
              padding:             "2px 10px",
              borderRadius:        "100px",
              background:          `${current.accent}18`,
              border:              `1px solid ${current.accent}35`,
              fontSize:            "9px",
              fontWeight:          "700",
              letterSpacing:       "0.12em",
              textTransform:       "uppercase",
              color:               current.accent,
            }}>
              <Sparkles size={9} />
              {current.eyebrow}
            </div>

            {/* Texte principal */}
            <p style={{
              fontSize:   "13px",
              fontWeight: "500",
              color:      "rgba(255,255,255,0.75)",
              textAlign:  "center",
              margin:     0,
              lineHeight: 1.45,
              maxWidth:   "560px",
            }}>
              {current.text}
            </p>

            {/* CTA inline */}
            <motion.a
              href={current.link}
              whileHover={{ gap: "10px", color: current.accent } as any}
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "5px",
                fontSize:       "10px",
                fontWeight:     "600",
                color:          "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition:     "all 0.2s ease",
                letterSpacing:  "0.03em",
              }}
            >
              {current.cta}
              <ArrowRight size={10} />
            </motion.a>
          </motion.div>
        </AnimatePresence>

        {/* ── Indicateurs de pagination ── */}
        <div style={{
          position:  "absolute",
          bottom:    "10px",
          left:      "50%",
          transform: "translateX(-50%)",
          display:   "flex",
          gap:       "5px",
          zIndex:    10,
        }}>
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width:        i === idx ? "18px" : "5px",
                height:       "5px",
                borderRadius: "3px",
                background:   i === idx ? current.accent : "rgba(255,255,255,0.2)",
                border:       "none",
                cursor:       "pointer",
                padding:      0,
                transition:   "all 0.35s ease",
              }}
            />
          ))}
        </div>

        {/* ── Bordures verticales verre ── */}
        <div aria-hidden style={{
          position:"absolute", left:0, top:"15%", width:"1px", height:"70%",
          background:"linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)",
        }} />
        <div aria-hidden style={{
          position:"absolute", right:0, top:"15%", width:"1px", height:"70%",
          background:"linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)",
        }} />
      </div>

      {/* ════════════════════════════════════════════════════
          COLONNE DROITE — Aide + Recherche
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "flex-end",
          justifyContent: "center",
          gap:            "8px",
          padding:        "12px 20px 12px 16px",
          borderLeft:     "1px solid rgba(255,255,255,0.05)",
          position:       "relative",
          zIndex:         1,
        }}
      >
        {/* ── Bouton Aide ── */}
        <motion.a
          href="/aide"
          whileHover={{
            background: "rgba(99,102,241,0.12)",
            borderColor:"rgba(99,102,241,0.35)",
            color:      "#a5b4fc",
          } as any}
          style={{
            display:             "flex",
            alignItems:          "center",
            gap:                 "6px",
            padding:             "5px 12px",
            borderRadius:        "8px",
            background:          "rgba(255,255,255,0.04)",
            border:              "1px solid rgba(255,255,255,0.08)",
            backdropFilter:      "blur(8px)",
            WebkitBackdropFilter:"blur(8px)",
            cursor:              "pointer",
            fontSize:            "10.5px",
            fontWeight:          "500",
            color:               "rgba(255,255,255,0.4)",
            textDecoration:      "none",
            transition:          "all 0.2s ease",
            whiteSpace:          "nowrap",
          }}
        >
          <HelpCircle size={12} />
          <span>Aide &amp; Support</span>
        </motion.a>

        {/* ── Bouton Recherche ── */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: "36px", opacity: 0.5 }}
              animate={{ width: "100%",  opacity: 1   }}
              exit={{   width: "36px", opacity: 0   }}
              transition={{ duration: 0.3, ease: [0.42, 0, 0.18, 1] }}
              style={{
                display:             "flex",
                alignItems:          "center",
                gap:                 "6px",
                padding:             "5px 10px",
                borderRadius:        "8px",
                background:          "rgba(99,102,241,0.08)",
                border:              "1px solid rgba(99,102,241,0.25)",
                backdropFilter:      "blur(8px)",
                WebkitBackdropFilter:"blur(8px)",
                overflow:            "hidden",
              }}
            >
              <Search size={11} style={{ color: "#818cf8", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                style={{
                  flex:       1,
                  background: "transparent",
                  border:     "none",
                  outline:    "none",
                  fontSize:   "10.5px",
                  color:      "#f1f5f9",
                  minWidth:   0,
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexShrink: 0, padding: 0,
                }}
              >
                <X size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-closed"
              onClick={() => setSearchOpen(true)}
              whileHover={{
                background: "rgba(255,255,255,0.08)",
                borderColor:"rgba(255,255,255,0.14)",
                color:      "rgba(255,255,255,0.7)",
              } as any}
              style={{
                display:             "flex",
                alignItems:          "center",
                gap:                 "6px",
                padding:             "5px 12px",
                borderRadius:        "8px",
                background:          "rgba(255,255,255,0.04)",
                border:              "1px solid rgba(255,255,255,0.08)",
                backdropFilter:      "blur(8px)",
                WebkitBackdropFilter:"blur(8px)",
                cursor:              "pointer",
                fontSize:            "10.5px",
                fontWeight:          "500",
                color:               "rgba(255,255,255,0.4)",
                transition:          "all 0.2s ease",
                whiteSpace:          "nowrap",
                width:               "100%",
                justifyContent:      "flex-start",
              }}
            >
              <Search size={12} />
              <span>Recherche rapide</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
