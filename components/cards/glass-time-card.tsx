"use client"

// ─── Framework ────────────────────────────────────────────────────────────────
import * as React from "react"
import { useState, useEffect } from "react"

// ─── Système de thème (source de vérité) ──────────────────────────────────────
import { useGlass } from "@/hooks/useGlass"
import { useTheme } from "@/lib/theme"

// ─── Types ───────────────────────────────────────────────────────────────────
interface GlassTimeCardProps {
  showSeconds?:  boolean
  showTimezone?: boolean
}

// ============================================================================
// GLASS TIME CARD
// ============================================================================
export function GlassTimeCard({ showSeconds = false, showTimezone = false }: GlassTimeCardProps) {
  const [currentTime,  setCurrentTime]  = useState<Date>(new Date())
  const [timezoneName, setTimezoneName] = useState<string>("")
  const [mounted,      setMounted]      = useState(false)

  // ── Thème ─────────────────────────────────────────────────────────────────
  const glassCard = useGlass("card", { withRadius: "xl", withTransition: true })

  // ── Horloge & fuseau ──────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)

    const offset    = -new Date().getTimezoneOffset() / 60
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`
    setTimezoneName(
      `${Intl.DateTimeFormat().resolvedOptions().timeZone} GMT${offsetStr}`
    )

    const id = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Formatage ─────────────────────────────────────────────────────────────
  const formatTime = (date: Date): string =>
    date.toLocaleTimeString(undefined, {
      hour:   "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: false,
    })

  const formatDate = (date: Date): string => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months   = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]
    return `${weekdays[date.getDay()]} | ${months[date.getMonth()]} ${date.getDate()}`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STYLES INLINE — 100 % variables CSS du thème
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Wrapper : position absolute dans le coin bas-droit du conteneur parent.
   * On utilise z-index: var(--z-raised) (= 10) pour être visible au-dessus
   * du contenu, mais suffisamment bas pour ne pas couvrir dropdowns/modals.
   * IMPORTANT : on évite tout z-index négatif qui ferait passer la carte
   * derrière le fond du parent qui crée un stacking context.
   */
  const wrapperStyle: React.CSSProperties = {
    position:     "absolute",
    bottom:       "var(--space-6)",
    right:        "var(--space-6)",
    zIndex:       "var(--z-raised)" as unknown as number,
    width:        "auto",
    padding:      "var(--space-3) var(--space-5)",
    borderRadius: "var(--radius-xl)",
    // Glass morphism complet via useGlass
    background:           glassCard.background,
    backdropFilter:       glassCard.backdropFilter,
    WebkitBackdropFilter: glassCard.WebkitBackdropFilter,
    border:               glassCard.border,
    boxShadow:            glassCard.boxShadow,
    transition:           glassCard.transition,
    // Pointer events transparents pour ne pas bloquer les clics sous la carte
    pointerEvents: "none",
  }

  /** Container interne */
  const innerStyle: React.CSSProperties = {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "var(--space-1)",
  }

  /** Date (ex. "Tuesday | May 5") */
  const dateStyle: React.CSSProperties = {
    fontSize:      "var(--fs-sm)",
    color:         "var(--surface-mutedForeground)",
    fontWeight:    "var(--fw-normal)",
    letterSpacing: "0.025em",
    whiteSpace:    "nowrap",
  }

  /** Heure (ex. "14:32:05") */
  const timeStyle: React.CSSProperties = {
    fontSize:           "var(--fs-4xl)",
    fontWeight:         "var(--fw-bold)",
    color:              "var(--surface-foreground)",
    fontVariantNumeric: "tabular-nums",
    letterSpacing:      "-0.025em",
    lineHeight:         "1.1",
    whiteSpace:         "nowrap",
  }

  /** Fuseau horaire (ex. "Africa/Libreville GMT+1") */
  const timezoneStyle: React.CSSProperties = {
    fontSize:      "var(--fs-xs)",
    color:         "var(--surface-mutedForeground)",
    letterSpacing: "0.025em",
    whiteSpace:    "nowrap",
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SKELETON — avant montage côté client (SSR-safe)
  // ─────────────────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div style={wrapperStyle}>
        <div style={innerStyle}>
          <div style={{ ...dateStyle, color: "var(--surface-mutedForeground)" }}>
            Chargement…
          </div>
          <div
            style={{
              ...timeStyle,
              color:        "transparent",
              background:   "var(--surface-skeleton)",
              borderRadius: "var(--radius-sm)",
              minWidth:     "8rem",
            }}
          >
            --:--
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        {/* Date */}
        <span style={dateStyle}>{formatDate(currentTime)}</span>

        {/* Heure */}
        <span style={timeStyle}>{formatTime(currentTime)}</span>

        {/* Fuseau horaire (optionnel) */}
        {showTimezone && (
          <span style={timezoneStyle}>{timezoneName}</span>
        )}
      </div>
    </div>
  )
}
