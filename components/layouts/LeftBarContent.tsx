
// ─── Framework ────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { Link, useLocation }            from 'react-router-dom';

// ─── Navigation — source de vérité ────────────────────────────────────────────
import { civitasNavItems }              from '@/src/remote/navigation';

// ─── Icônes ───────────────────────────────────────────────────────────────────
import {
  Blocks, ChevronsUpDown,
  Home, LogOut, Settings, UserCircle, UserCog,
  Building2, Plus,
} from "lucide-react";

// ─── Système de thème (source de vérité) ──────────────────────────────────────
import { useGlass } from "@/hooks/useGlass";

// ─── Composants UI ────────────────────────────────────────────────────────────
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge }      from "@/components/ui/badge";

// ─── Utilitaires ──────────────────────────────────────────────────────────────
import { cn } from "@/lib/utils";

// ============================================================================
// VARIANTES FRAMER-MOTION
// ============================================================================
const SIDEBAR_OPEN_W   = "15rem";
const SIDEBAR_CLOSED_W = "3.05rem";

const sidebarVariants = {
  open:   { width: SIDEBAR_OPEN_W },
  closed: { width: SIDEBAR_CLOSED_W },
};

const labelVariants = {
  open: {
    x: 0, opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20, opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

const transitionProps = {
  type: "tween", ease: "easeOut", duration: 0.2, staggerChildren: 0.1,
};

/** Variante d'apparition du panneau popup */
const popupVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
  exit: {
    opacity: 0, scale: 0.95, y: -6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Variante stagger des items dans le popup */
const popupItemVariants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.18 },
  }),
};

// ============================================================================
// NAV ITEM — lien de navigation individuel
// ============================================================================
interface NavItemProps {
  href:        string;
  icon:        React.ElementType;
  label:       string;
  isCollapsed: boolean;
  isActive:    boolean;
  badge?:      React.ReactNode;
}

function NavItem({ href, icon: Icon, label, isCollapsed, isActive, badge }: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display:       "flex",
    flexDirection: "row",
    alignItems:    "center",
    height:        "var(--space-8)",
    width:         "100%",
    borderRadius:  "var(--radius-md)",
    paddingLeft:   "var(--space-2)",
    paddingRight:  "var(--space-2)",
    paddingTop:    "var(--space-1-5)",
    paddingBottom: "var(--space-1-5)",
    gap:           "var(--space-2)",
    transition:    "var(--transition-colors)",
    textDecoration: "none",
    background: isActive
      ? "var(--surface-accent)"
      : hovered
        ? "var(--surface-glassHover)"
        : "transparent",
    color: isActive
      ? "var(--primary-600)"
      : hovered
        ? "var(--surface-foreground)"
        : "var(--surface-mutedForeground)",
  };

  return (
    <Link
      to={href}
      style={itemStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, color: "inherit" }} />
      <motion.span variants={labelVariants} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", overflow: "hidden" }}>
        {!isCollapsed && (
          <>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", whiteSpace: "nowrap", overflow: "hidden", color: "inherit" }}>
              {label}
            </span>
            {badge}
          </>
        )}
      </motion.span>
    </Link>
  );
}

// ============================================================================
// POPUP ITEM — ligne cliquable dans les popups Organisation / Compte
// ============================================================================
interface PopupItemProps {
  icon:     React.ElementType;
  label:    string;
  href?:    string;
  onClick?: () => void;
  danger?:  boolean;
  index:    number;
}

function PopupItem({ icon: Icon, label, href, onClick, danger = false, index }: PopupItemProps) {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    display:       "flex",
    alignItems:    "center",
    gap:           "var(--space-3)",
    width:         "100%",
    padding:       "var(--space-2) var(--space-3)",
    borderRadius:  "var(--radius-md)",
    fontSize:      "var(--fs-sm)",
    fontWeight:    "var(--fw-medium)",
    color:         danger
      ? "var(--error-500)"
      : hovered
        ? "var(--surface-foreground)"
        : "var(--surface-mutedForeground)",
    background:    hovered
      ? danger
        ? "rgba(239,68,68,0.08)"
        : "var(--surface-accent)"
      : "transparent",
    transition:    "var(--transition-colors)",
    cursor:        "pointer",
    border:        "none",
    textDecoration:"none",
  };

  const iconStyle: React.CSSProperties = {
    width:     "var(--icon-sm)",
    height:    "var(--icon-sm)",
    flexShrink: 0,
    color:     "inherit",
    transition: "var(--transition-transform)",
    transform:  hovered ? "scale(1.12)" : "scale(1)",
  };

  const inner = (
    <>
      <motion.div
        custom={index}
        variants={popupItemVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%" }}
      >
        <Icon style={iconStyle} />
        <span style={{ flex: 1 }}>{label}</span>
      </motion.div>
    </>
  );

  if (href) {
    return (
      <Link to={href} style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button style={style} onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {inner}
    </button>
  );
}

// ============================================================================
// SIDEBAR DIVIDER
// ============================================================================
function SidebarDivider() {
  return (
    <div style={{
      height:     "1px",
      width:      "100%",
      background: "var(--border-divider)",
      margin:     "var(--space-1) 0",
      flexShrink: 0,
    }} />
  );
}

// ============================================================================
// POPUP GLASS — panneau flottant partagé (Organisation + Compte)
// ============================================================================
interface GlassPopupProps {
  isOpen:   boolean;
  onClose:  () => void;
  children: React.ReactNode;
  /** Décalage vertical depuis le bas du trigger (pour le footer) */
  fromBottom?: boolean;
}

function GlassPopup({ isOpen, onClose, children, fromBottom = false }: GlassPopupProps) {
  const glassDropdown = useGlass("dropdown", { withRadius: "xl" });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay invisible pour fermer au clic extérieur */}
          <div
            style={{
              position: "fixed",
              inset:    0,
              zIndex:   "var(--z-dropdown)" as unknown as number,
            }}
            onClick={onClose}
          />

          {/* Panneau popup */}
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position:  "absolute",
              left:      "calc(100% + var(--space-2))",
              ...(fromBottom
                ? { bottom: 0 }
                : { top:    0 }),
              zIndex:    "calc(var(--z-dropdown) + 1)" as unknown as number,
              minWidth:  "14rem",
              padding:   "var(--space-2)",
              // Glass morphism complet
              background:           glassDropdown.background,
              backdropFilter:       glassDropdown.backdropFilter,
              WebkitBackdropFilter: glassDropdown.backdropFilter,
              border:               glassDropdown.border,
              boxShadow:            glassDropdown.boxShadow,
              borderRadius:         glassDropdown.borderRadius,
              // Dégradé accent subtil en fond
              overflow:             "hidden",
            }}
          >
            {/* Accent gradient décoratif */}
            <div style={{
              position:   "absolute",
              inset:      0,
              zIndex:     0,
              background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(217,70,239,0.06) 100%)",
              pointerEvents: "none",
            }} />

            {/* Contenu au-dessus du gradient */}
            <div style={{ position: "relative", zIndex: 1 }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// POPUP DIVIDER — séparateur fin dans les popups
// ============================================================================
function PopupDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
      style={{
        height:     "1px",
        background: "var(--border-divider)",
        margin:     "var(--space-1) 0",
      }}
    />
  );
}

// ============================================================================
// LEFT BAR CONTENT — composant principal
// ============================================================================
export function LeftBarContent() {
  const [isCollapsed,      setIsCollapsed]      = useState(true);
  const [showOrgPopup,     setShowOrgPopup]      = useState(false);
  const [showAccountPopup, setShowAccountPopup]  = useState(false);
  const location = useLocation()
const pathname = location.pathname;

  // ── Thème glass sidebar ────────────────────────────────────────────────────
  const glassSidebar = useGlass("sidebar");

  // ── Styles centralisés ────────────────────────────────────────────────────

  const sidebarStyle: React.CSSProperties = {
    position:             "fixed",
    left:                 0,
    top:                  0,
    zIndex:               "var(--z-sticky)" as unknown as number,
    height:               "100%",
    flexShrink:           0,
    background:           glassSidebar.background,
    backdropFilter:       glassSidebar.backdropFilter,
    WebkitBackdropFilter: glassSidebar.backdropFilter,
    borderRight:          "1px solid var(--border-divider)",
    boxShadow:            glassSidebar.boxShadow,
    overflow:             "visible",   // permet aux popups de déborder
  };

  /** Bouton trigger (organisation / compte) */
  const triggerBtnStyle: React.CSSProperties = {
    display:       "flex",
    flexDirection: "row",
    alignItems:    "center",
    height:        "var(--space-8)",
    width:         "100%",
    borderRadius:  "var(--radius-md)",
    paddingLeft:   "var(--space-2)",
    paddingRight:  "var(--space-2)",
    paddingTop:    "var(--space-1-5)",
    paddingBottom: "var(--space-1-5)",
    gap:           "var(--space-2)",
    background:    "transparent",
    border:        "none",
    cursor:        "pointer",
    color:         "var(--surface-sidebarForeground)",
    transition:    "var(--transition-colors)",
    position:      "relative",
    textAlign:     "left",
  };

  /** Mini-avatar gradient */
  const avatarStyle = (size: "sm" | "md"): React.CSSProperties => ({
    width:          size === "sm" ? "var(--space-4)" : "var(--space-6)",
    height:         size === "sm" ? "var(--space-4)" : "var(--space-6)",
    borderRadius:   "var(--radius-full)",
    flexShrink:     0,
    background:     "linear-gradient(135deg, var(--primary-400), var(--secondary-500))",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontSize:       "var(--fs-xs)",
    fontWeight:     "var(--fw-bold)",
    color:          "#ffffff",
    userSelect:     "none",
    letterSpacing:  "-0.02em",
  });

  // Badge BETA
  const betaBadge = (
    <Badge
      variant="outline"
      style={{
        display:      "flex",
        alignItems:   "center",
        height:       "fit-content",
        borderRadius: "var(--radius-xs)",
        border:       "none",
        background:   "var(--surface-accent)",
        color:        "var(--primary-600)",
        padding:      "0 var(--space-1-5)",
        fontSize:     "10px",
        fontWeight:   "var(--fw-semibold)",
        letterSpacing:"0.04em",
      }}
    >
      BETA
    </Badge>
  );

  return (
    <motion.div
      style={sidebarStyle}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => { setIsCollapsed(true); setShowOrgPopup(false); setShowAccountPopup(false); }}
    >
      <div style={{
        position:      "relative",
        zIndex:        "var(--z-raised)" as unknown as number,
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        color:         "var(--surface-sidebarForeground)",
      }}>
        <motion.ul
          variants={staggerVariants}
          style={{ display: "flex", flexDirection: "column", height: "100%", margin: 0, padding: 0, listStyle: "none" }}
        >

          {/* ── EN-TÊTE : Organisation ──────────────────────────────────────── */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            height:       "var(--header-height)",
            width:        "100%",
            flexShrink:   0,
            borderBottom: "1px solid var(--border-divider)",
            padding:      "var(--space-2)",
            position:     "relative",
          }}>
            <button
              style={triggerBtnStyle}
              onClick={() => { setShowOrgPopup(p => !p); setShowAccountPopup(false); }}
            >
              {/* Avatar organisation */}
              <div style={avatarStyle("sm")}>O</div>

              {/* Label + chevron (visible seulement si ouvert) */}
              <motion.span variants={labelVariants} style={{ display: "flex", alignItems: "center", flex: 1, gap: "var(--space-2)", overflow: "hidden" }}>
                {!isCollapsed && (
                  <>
                    <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                      Organisation
                    </span>
                    <ChevronsUpDown style={{
                      width:     "var(--icon-sm)",
                      height:    "var(--icon-sm)",
                      flexShrink: 0,
                      color:     "var(--surface-mutedForeground)",
                      opacity:   0.6,
                      transform: showOrgPopup ? "rotate(180deg)" : "rotate(0deg)",
                      transition:"var(--transition-transform)",
                    }} />
                  </>
                )}
              </motion.span>
            </button>

            {/* ── POPUP ORGANISATION ─────────────────────────────────────────── */}
            <GlassPopup isOpen={showOrgPopup} onClose={() => setShowOrgPopup(false)}>

              {/* Header du popup */}
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-3)",
                padding:      "var(--space-2) var(--space-3) var(--space-3)",
                borderBottom: "1px solid var(--border-divider)",
                marginBottom: "var(--space-1)",
              }}>
                <div style={{
                  ...avatarStyle("md"),
                  borderRadius: "var(--radius-sm)",
                  width:        "var(--space-8)",
                  height:       "var(--space-8)",
                  fontSize:     "var(--fs-sm)",
                }}>
                  IAM
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-0-5)" }}>
                  <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--surface-foreground)" }}>
                    CIVITAS
                  </span>
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--surface-mutedForeground)" }}>
                    Espace de travail actif
                  </span>
                </div>
                <div style={{
                  marginLeft:   "auto",
                  width:        "var(--icon-sm)",
                  height:       "var(--icon-sm)",
                  borderRadius: "var(--radius-full)",
                  background:   "var(--success-500)",
                  flexShrink:   0,
                }} />
              </div>

              {/* Actions */}
              <PopupItem index={0} icon={UserCog}     label="Gérer l'espace de travail" onClick={() => {}} />
              <PopupItem index={1} icon={Building2}   label="À propos de CIVITAS"        onClick={() => {}} />

            </GlassPopup>
          </div>

          {/* ── NAVIGATION PRINCIPALE — items depuis navigation.ts ─────────── */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <ScrollArea style={{ flex: 1, padding: "var(--space-2)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", width: "100%" }}>

                  {/* Routes actives issues de navigation.ts */}
                  {civitasNavItems.map((item) => (
                    <NavItem
                      key={item.id}
                      href={item.path}
                      icon={Home}
                      label={item.label}
                      isCollapsed={isCollapsed}
                      isActive={
                        item.path === "/"
                          ? pathname === "/" || pathname === ""
                          : !!pathname?.startsWith(item.path)
                      }
                    />
                  ))}

                </div>
              </ScrollArea>
            </div>

            {/* ── PIED : Paramètres + Compte ─────────────────────────────── */}
            <div style={{
              display:       "flex",
              flexDirection: "column",
              padding:       "var(--space-2)",
              gap:           "var(--space-1)",
              flexShrink:    0,
              borderTop:     "1px solid var(--border-divider)",
            }}>

              {/* Paramètres — route non encore créée, désactivé */}
              {/* <NavItem href="/settings" icon={Settings} label="Paramètres" isCollapsed={isCollapsed} isActive={!!pathname?.includes("settings")} /> */}

              {/* ── TRIGGER COMPTE ─────────────────────────────────────────── */}
              <div style={{ position: "relative" }}>
                <button
                  style={triggerBtnStyle}
                  onClick={() => { setShowAccountPopup(p => !p); setShowOrgPopup(false); }}
                >
                  <div style={avatarStyle("sm")}>A</div>

                  <motion.span variants={labelVariants} style={{ display: "flex", alignItems: "center", flex: 1, gap: "var(--space-2)", overflow: "hidden" }}>
                    {!isCollapsed && (
                      <>
                        <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>
                          Compte
                        </span>
                        <ChevronsUpDown style={{
                          width:     "var(--icon-sm)",
                          height:    "var(--icon-sm)",
                          flexShrink: 0,
                          color:     "var(--surface-mutedForeground)",
                          opacity:   0.6,
                          transform: showAccountPopup ? "rotate(180deg)" : "rotate(0deg)",
                          transition:"var(--transition-transform)",
                        }} />
                      </>
                    )}
                  </motion.span>
                </button>

                {/* ── POPUP COMPTE ─────────────────────────────────────────── */}
                <GlassPopup isOpen={showAccountPopup} onClose={() => setShowAccountPopup(false)} fromBottom>

                  {/* Profil utilisateur */}
                  <div style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "var(--space-3)",
                    padding:      "var(--space-2) var(--space-3) var(--space-3)",
                    borderBottom: "1px solid var(--border-divider)",
                    marginBottom: "var(--space-1)",
                  }}>
                    <div style={{
                      ...avatarStyle("md"),
                      width:    "var(--space-8)",
                      height:   "var(--space-8)",
                      fontSize: "var(--fs-xs)",
                    }}>
                      NS
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-0-5)", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--surface-foreground)", whiteSpace: "nowrap" }}>
                        NZILA NGALA Amour Samuel
                      </span>
                      <span style={{ fontSize: "var(--fs-xs)", color: "var(--surface-mutedForeground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "10rem" }}>
                        contact@civitas.ai
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <PopupItem index={0} icon={UserCircle} label="Profil"           href="/settings/profile" />

                  <PopupDivider />

                  <PopupItem index={1} icon={LogOut}     label="Se déconnecter"   danger />

                </GlassPopup>
              </div>

            </div>
          </div>
        </motion.ul>
      </div>
    </motion.div>
  );
}

export default LeftBarContent;
