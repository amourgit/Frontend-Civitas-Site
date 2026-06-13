// ============================================================
// components/layouts/Topbar/TopBarContent.tsx
// Orchestrateur des 3 niveaux de TopBar — Modulaire · Glass · Scroll-aware
// Niveau 1 : bande d'annonces + langue  (28px)
// Niveau 2 : logo + nav principale     (56px)
// Niveau 3 : breadcrumb + onglets contextuels (36px, conditionnel)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useGlass } from "@/hooks/useGlass";

import TopBarLevel1 from "./TopBarLevel1";
import TopBarLevel2 from "./TopBarLevel2";
import TopBarLevel3 from "./TopBarLevel3";

// ─── Props ───────────────────────────────────────────────────
interface TopBarContentProps {
  className?: string;
  /** Cacher la bande Niveau 1 (ex. mode app authentifié) */
  hideLevel1?: boolean;
  /** Cacher la barre contextuelle Niveau 3 */
  hideLevel3?: boolean;
  /** Forcer le fond glass même sans scroll */
  alwaysGlass?: boolean;
  /** Offset de padding-top pour le contenu principal */
  onHeightChange?: (height: number) => void;
}

// ─── Composant ────────────────────────────────────────────────
export default function TopBarContent({
  className       = "",
  hideLevel1      = false,
  hideLevel3      = false,
  alwaysGlass     = false,
  onHeightChange,
}: TopBarContentProps) {
  const location      = useLocation();
  const glassHeader   = useGlass("header");
  const containerRef  = useRef<HTMLDivElement>(null);

  // ── Détection du scroll ──────────────────────────────────
  const [isScrolled,    setIsScrolled]    = useState(alwaysGlass);
  const [scrollY,       setScrollY]       = useState(0);
  const [isHidden,      setIsHidden]      = useState(false);
  const [lastScrollY,   setLastScrollY]   = useState(0);

  // Utiliser window scroll (pas framer-motion ici car scroll est sur body)
  useEffect(() => {
    const handleScroll = () => {
      const y       = window.scrollY;
      const delta   = y - lastScrollY;

      setScrollY(y);
      setIsScrolled(alwaysGlass || y > 10);

      // Auto-hide si on scroll vers le bas > 60px du top
      if (y > 120 && delta > 0) {
        setIsHidden(true);
      } else if (delta < 0 || y < 60) {
        setIsHidden(false);
      }

      setLastScrollY(y);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, alwaysGlass]);

  // ── Communiquer la hauteur totale au parent ──────────────
  useEffect(() => {
    if (!onHeightChange || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onHeightChange(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);

  // ── Calculer si Level3 doit s'afficher ───────────────────
  const isHome     = location.pathname === "/" || location.pathname === "";
  const showLevel3 = !hideLevel3 && !isHome;

  // ── Effet de parallaxe sur le fond ───────────────────────
  const backgroundOpacity = Math.min(scrollY / 80, 1);

  return (
    <motion.div
      ref={containerRef}
      className={`fixed top-0 left-0 right-0 flex flex-col ${className}`}
      animate={{
        y:       isHidden ? "-100%" : "0%",
        opacity: isHidden ? 0       : 1,
      }}
      transition={{ duration: 0.35, ease: [0.42, 0, 0.18, 1] }}
      style={{
        zIndex:   "var(--z-sticky, 1000)" as unknown as number,
        // Fond glass progressif selon le scroll
        background: isScrolled
          ? `rgba(8, 12, 30, ${Math.min(0.82, backgroundOpacity * 0.9 + 0.1)})`
          : "transparent",
        backdropFilter:       isScrolled ? `blur(${Math.min(32, backgroundOpacity * 32 + 8)}px) saturate(1.6)` : "none",
        WebkitBackdropFilter: isScrolled ? `blur(${Math.min(32, backgroundOpacity * 32 + 8)}px) saturate(1.6)` : "none",
        transition: "background 0.4s ease, backdrop-filter 0.4s ease",
        // Bordure glass subtile
        borderBottom: isScrolled
          ? `1px solid rgba(255,255,255,${Math.min(0.07, backgroundOpacity * 0.08)})`
          : "none",
        // Ombre portée
        boxShadow: isScrolled
          ? `0 4px 40px rgba(0,0,0,${Math.min(0.4, backgroundOpacity * 0.5)})`
          : "none",
      }}
    >
      {/* ── Reflet lumineux en haut de la barre (effet Apple) ─ */}
      {isScrolled && (
        <div
          aria-hidden
          style={{
            position:   "absolute",
            top:        0,
            left:       0,
            right:      0,
            height:     "1px",
            background: `linear-gradient(90deg,
              transparent 0%,
              rgba(255,255,255,${backgroundOpacity * 0.12}) 30%,
              rgba(255,255,255,${backgroundOpacity * 0.18}) 50%,
              rgba(255,255,255,${backgroundOpacity * 0.12}) 70%,
              transparent 100%
            )`,
            pointerEvents:"none",
          }}
        />
      )}

      {/* ── Orbs décoratifs d'arrière-plan ─────────────────── */}
      {isScrolled && (
        <>
          <div
            aria-hidden
            style={{
              position:     "absolute",
              right:        "15%",
              top:          "-20px",
              width:        "200px",
              height:       "80px",
              borderRadius: "50%",
              background:   "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
              filter:       "blur(20px)",
              pointerEvents:"none",
              opacity:      backgroundOpacity,
            }}
          />
          <div
            aria-hidden
            style={{
              position:     "absolute",
              left:         "20%",
              top:          "-10px",
              width:        "160px",
              height:       "60px",
              borderRadius: "50%",
              background:   "radial-gradient(ellipse, rgba(217,70,239,0.06) 0%, transparent 70%)",
              filter:       "blur(18px)",
              pointerEvents:"none",
              opacity:      backgroundOpacity,
            }}
          />
        </>
      )}

      {/* ── Niveau 1 ─────────────────────────────────────────── */}
      {!hideLevel1 && (
        <TopBarLevel1 />
      )}

      {/* ── Niveau 2 ─────────────────────────────────────────── */}
      <TopBarLevel2 isScrolled={isScrolled} />

      {/* ── Niveau 3 (conditionnel) ──────────────────────────── */}
      {showLevel3 && (
        <TopBarLevel3 />
      )}

      {/* ── Ligne de séparation finale très subtile ──────────── */}
      {isScrolled && (
        <div
          aria-hidden
          style={{
            height:     "1px",
            background: `linear-gradient(90deg,
              transparent,
              rgba(99,102,241,${backgroundOpacity * 0.15}),
              rgba(217,70,239,${backgroundOpacity * 0.1}),
              transparent
            )`,
            opacity:    backgroundOpacity,
          }}
        />
      )}
    </motion.div>
  );
}

// ─── Export utilitaire ────────────────────────────────────────
/** Hauteur totale de la topbar pour le padding-top du layout */
export function getTopbarHeight(opts: {
  hideLevel1?: boolean;
  hideLevel3?: boolean;
  isHome?: boolean;
}): number {
  let h = 56; // Level 2 toujours présent
  if (!opts.hideLevel1) h += 90; // Level 1 — 90px
  if (!opts.hideLevel3 && !opts.isHome) h += 36; // Level 3
  return h;
}
