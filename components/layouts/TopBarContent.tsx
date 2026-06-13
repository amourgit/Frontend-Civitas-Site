
// ─── Framework ────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// ─── Icônes ───────────────────────────────────────────────────────────────────
import {
  Bell, Search, LogOut, ChevronRight, ChevronDown,
  Moon, Sun, Home,
} from "lucide-react";

// ─── Système de thème (source de vérité) ──────────────────────────────────────
import { useTheme, useThemeVariables } from "@/lib/theme";
import { useGlass } from "@/hooks/useGlass";

// ─── Auth ─────────────────────────────────────────────────────────────────────
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/lib/auth-store";

// ─── Navigation ───────────────────────────────────────────────────────────────
import { navigationData, NavigationItem } from "@/services/navigation";

// ─── Composants UI ────────────────────────────────────────────────────────────
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ExpandableDock from "@/components/ui/expandable-dock";
import {
  TopSheet, TopSheetClose, TopSheetContent, TopSheetDescription,
  TopSheetFooter, TopSheetHeader, TopSheetTitle, TopSheetTrigger,
} from "@/components/ui/top-sheet";
import { toast, useToast } from "@/components/ui/toast";

// ─── Widgets / layouts ───────────────────────────────────────────────────────
import UserProfileCard from "@/components/cards/user-profile-card";
import StructureInfoCard from "@/components/widgets/structure-info-cards";
import SearchPopup from "@/components/searchPopup";
import MagicRings from "@/components/MagicRings";
import MenuToggleButton from "@/components/layouts/StaggeredMenuButton";
import StaggeredMenuPanel from "@/components/layouts/StaggeredMenu";

// ─── Données statiques ────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English",  flag: "🇺🇸" },
  { code: "es", name: "Español",  flag: "🇪🇸" },
  { code: "de", name: "Deutsch",  flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

const NAV_MENU_ITEMS = [
  { label: "Home",     ariaLabel: "Go to home page",  link: "/" },
  { label: "About",    ariaLabel: "Learn about us",    link: "/about" },
  { label: "Services", ariaLabel: "View our services", link: "/services" },
  { label: "Contact",  ariaLabel: "Get in touch",      link: "/contact" },
];

const NAV_SOCIAL_ITEMS = [
  { label: "Twitter",  link: "https://twitter.com" },
  { label: "GitHub",   link: "https://github.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

// ─── Utilitaires URL ──────────────────────────────────────────────────────────
const parseUrlToPath = (url: string): string[] => {
  if (typeof window === "undefined") return [];
  const pathname = url || window.location.pathname;
  return pathname.replace(/^\//, "").split("/").filter(Boolean);
};

const findNavigationPath = (
  segments: string[],
  navData: NavigationItem[] = navigationData
): string[] => {
  if (segments.length === 0) return [];
  const result: string[] = [];
  let currentItems = navData;
  for (const segment of segments) {
    const found = currentItems.find((item) => {
      const last = item.path.split("/").filter(Boolean).pop();
      return last === segment || item.id === segment;
    });
    if (found) {
      result.push(found.id);
      currentItems = found.children?.length ? found.children : [];
    } else break;
  }
  return result;
};

// ============================================================================
// NAVIGATION ITEM (ligne d'un menu cascadant)
// ============================================================================
const NavigationItemRow = ({
  item, level, onHover, isActive, onNavigate, index,
}: {
  item: NavigationItem; level: number; onHover: (i: NavigationItem, l: number) => void;
  isActive: boolean; onNavigate: (p: string) => void; index: number;
}) => {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const { glass } = useThemeVariables();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      onMouseEnter={() => onHover(item, level)}
      onClick={() => !hasChildren && item.path && onNavigate(item.path)}
      whileHover={{ x: 4 }}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        cursor:         "pointer",
        padding:        "var(--space-2) var(--space-4)",
        transition:     "var(--transition-colors)",
        background:     isActive ? "var(--surface-accent)" : "transparent",
      }}
      onMouseEnterCapture={undefined}
      className="hover:[background:var(--surface-glassHover)]"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {Icon && (
          <Icon style={{
            width: "var(--icon-sm)", height: "var(--icon-sm)",
            color: "var(--surface-foreground)", flexShrink: 0,
          }} />
        )}
        <span style={{
          fontSize:   "var(--fs-sm)",
          fontWeight: "var(--fw-medium)",
          color:      "var(--surface-foreground)",
        }}>
          {item.label}
        </span>
      </div>
      {hasChildren && (
        <ChevronRight style={{
          width: "var(--icon-sm)", height: "var(--icon-sm)",
          color: "var(--surface-mutedForeground)", flexShrink: 0,
          marginLeft: "var(--space-2)",
        }} />
      )}
    </motion.div>
  );
};

// ============================================================================
// COLONNE AVEC RECHERCHE (dropdown cascadant)
// ============================================================================
const ColumnWithSearch = ({
  columnItems, columnIndex, onHover, onNavigate, activeItems,
}: {
  columnItems: NavigationItem[]; columnIndex: number;
  onHover: (i: NavigationItem, l: number) => void;
  onNavigate: (p: string) => void; activeItems: (string | null)[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = columnItems.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{
        opacity: 1, width: "45vw",
        transition: {
          width:   { duration: 0.28, ease: "easeOut" },
          opacity: { duration: 0.18, delay: 0.08 },
        },
      }}
      exit={{
        opacity: 0, width: 0,
        transition: {
          width:   { duration: 0.28, ease: "easeIn" },
          opacity: { duration: 0.12 },
        },
      }}
      style={{
        flexShrink:      0,
        borderRight:     "1px solid var(--border-divider)",
        overflowY:       "auto",
        display:         "flex",
        flexDirection:   "column",
        overflowX:       "hidden",
        scrollbarWidth:  "none",
      }}
    >
      {/* Barre de recherche sticky */}
      <div style={{
        position:       "sticky",
        top:            0,
        zIndex:         10,
        padding:        "var(--space-3) var(--space-4)",
        borderBottom:   "1px solid var(--border-divider)",
        background:     "var(--glass-dropdown-bg)",
        backdropFilter: "var(--glass-dropdown-blur)",
        WebkitBackdropFilter: "var(--glass-dropdown-blur)",
      }}>
        <div style={{ position: "relative" }}>
          <Search style={{
            position:  "absolute",
            left:      "var(--space-3)",
            top:       "50%",
            transform: "translateY(-50%)",
            width:     "var(--icon-sm)",
            height:    "var(--icon-sm)",
            color:     "var(--surface-mutedForeground)",
          }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width:           "100%",
              background:      "var(--surface-glass)",
              border:          "1px solid var(--border-input)",
              borderRadius:    "var(--radius-md)",
              paddingLeft:     "var(--space-10)",
              paddingRight:    "var(--space-4)",
              paddingTop:      "var(--space-2)",
              paddingBottom:   "var(--space-2)",
              fontSize:        "var(--fs-sm)",
              color:           "var(--surface-foreground)",
              outline:         "none",
              transition:      "var(--transition-glass)",
            }}
          />
        </div>
      </div>

      {/* Liste filtrée */}
      <div style={{ flex: 1, paddingTop: "var(--space-1)", paddingBottom: "var(--space-1)", overflowY: "auto" }}>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <NavigationItemRow
                key={item.id}
                item={item}
                level={columnIndex}
                onHover={onHover}
                onNavigate={onNavigate}
                isActive={activeItems[columnIndex] === item.id}
                index={index}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                padding:        "var(--space-8) var(--space-4)",
                gap:            "var(--space-2)",
              }}
            >
              <Search style={{
                width:  "var(--icon-xl)",
                height: "var(--icon-xl)",
                color:  "var(--surface-mutedForeground)",
              }} />
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--surface-mutedForeground)" }}>
                Aucun résultat
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CASCADING NAV DROPDOWN
// ============================================================================
export const CascadingNavDropdown = ({
  onNavigate,
  initialPath = [],
}: {
  onNavigate?: (path: string) => void;
  initialPath?: string[];
}) => {
  const [isOpen, setIsOpen]           = useState(false);
  const [activeColumns, setActiveColumns] = useState([navigationData]);
  const [activeItems, setActiveItems] = useState<(string | null)[]>([null, null]);
  const glassDropdown = useGlass("dropdown");

  const handleItemHover = (item: NavigationItem, level: number) => {
    const newActive = [...activeItems];
    newActive[level] = item.id;
    if (item.children?.length) {
      setActiveColumns([...activeColumns.slice(0, level + 1), item.children]);
    } else {
      setActiveColumns(activeColumns.slice(0, level + 1));
    }
    setActiveItems(newActive);
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    onNavigate?.(path);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-1-5)",
          fontSize:     "var(--fs-xs)",
          padding:      "var(--space-1-5) var(--space-3)",
          background:   "var(--surface-glass)",
          color:        "var(--surface-foreground)",
          border:       "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          transition:   "var(--transition-glass)",
          cursor:       "pointer",
        }}
      >
        <span>Navigation</span>
        <ChevronDown style={{
          width:     "var(--icon-sm)",
          height:    "var(--icon-sm)",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition:"var(--transition-transform)",
        }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: "var(--z-overlay)", background: "var(--surface-overlay)" }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{
                opacity: 1, y: 0, scale: 1,
                width: `${activeColumns.length * 45}vw`,
                transition: {
                  opacity: { duration: 0.18 },
                  y:       { duration: 0.28, type: "spring", stiffness: 200, damping: 20 },
                  scale:   { duration: 0.18 },
                  width:   { duration: 0.28, ease: "easeOut" },
                },
              }}
              exit={{ opacity: 0, y: -10, scale: 0.96, transition: { duration: 0.18 } }}
              style={{
                position:  "fixed",
                top:       "calc(var(--header-height) + var(--space-2))",
                left:      "1vw",
                height:    "40vh",
                zIndex:    "var(--z-dropdown)",
                overflow:  "hidden",
                borderRadius: "var(--radius-xl)",
                ...glassDropdown,
              }}
            >
              <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
                <AnimatePresence mode="sync">
                  {activeColumns.map((columnItems, columnIndex) => (
                    <ColumnWithSearch
                      key={columnIndex}
                      columnItems={columnItems}
                      columnIndex={columnIndex}
                      onHover={handleItemHover}
                      onNavigate={handleNavigate}
                      activeItems={activeItems}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// COMPACT TOP BAR — composant principal
// ============================================================================
export const CompactTopBar = ({ className = "" }: { className?: string }) => {
  const { toast } = useToast();

  // ── Thème ─────────────────────────────────────────────────────────────────
  const { isDark, toggleDarkMode } = useTheme();
  const glassHeader = useGlass("header");

  // ── Auth Keycloak ─────────────────────────────────────────────────────────
  const { user }      = useAuth();
  const { user: kcUser } = useAuthContext();

  const kcFullName = [kcUser?.prenom, kcUser?.nom].filter(Boolean).join(" ")
    || kcUser?.username || user?.name || "Utilisateur";
  const kcEmail  = kcUser?.email || user?.email || "";
  const kcInitials = (() => {
    const f = kcUser?.prenom?.trim()?.[0] ?? "";
    const l = kcUser?.nom?.trim()?.[0]   ?? "";
    if (f || l) return `${f}${l}`.toUpperCase();
    return (kcUser?.username?.trim()?.[0] ?? "U").toUpperCase();
  })();

  // ── État local ────────────────────────────────────────────────────────────
  const navigate          = useNavigate();
  const profileRef        = useRef<HTMLDivElement>(null);
  const [menuOpen,           setMenuOpen]           = useState(false);
  const [showUserProfile,    setShowUserProfile]    = useState(false);
  const [showSearchPopup,    setShowSearchPopup]    = useState(false);
  const [showLanguageMenu,   setShowLanguageMenu]   = useState(false);
  const [selectedLanguage,   setSelectedLanguage]   = useState(LANGUAGES[0]);
  const [navigationPath,     setNavigationPath]     = useState<string[]>([]);
  const [history,            setHistory]            = useState<string[]>([]);
  const [historyIndex,       setHistoryIndex]       = useState(-1);
  const [query,              setQuery]              = useState("");
  const [expandedSections,   setExpandedSections]   = useState(new Set(["COMPONENTS"]));

  // ── Navigation depuis URL ─────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const segs   = parseUrlToPath(window.location.pathname);
      const navPath = findNavigationPath(segs);
      setNavigationPath(navPath);
    };
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  // ── Click outside profil ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowUserProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigateTo = (path: string) => {
    navigate(path);
    const next = [...history.slice(0, historyIndex + 1), path];
    setHistory(next);
    setHistoryIndex(next.length - 1);
    setNavigationPath(findNavigationPath(parseUrlToPath(path)));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STYLES INLINE CENTRALISÉS (vars CSS → aucune valeur statique)
  // ─────────────────────────────────────────────────────────────────────────

  /** Bouton icône générique de la topbar */
  const iconBtn: React.CSSProperties = {
    display:      "flex",
    alignItems:   "center",
    justifyContent: "center",
    padding:      "var(--space-2)",
    borderRadius: "var(--radius-md)",
    background:   "transparent",
    border:       "none",
    color:        "var(--surface-mutedForeground)",
    cursor:       "pointer",
    transition:   "var(--transition-glass)",
  };

  /** Bouton icône au hover — appliqué via onMouse* */
  const iconBtnHoverStyle: React.CSSProperties = {
    background: "var(--surface-glass)",
    color:      "var(--surface-foreground)",
  };

  /** Dropdown menu (langue, profil) */
  const dropdownStyle: React.CSSProperties = {
    position:    "absolute",
    right:       0,
    top:         "calc(100% + var(--space-2))",
    zIndex:      "var(--z-dropdown)" as unknown as number,
    minWidth:    "10rem",
    background:  "var(--glass-dropdown-bg)",
    backdropFilter:       "var(--glass-dropdown-blur)",
    WebkitBackdropFilter: "var(--glass-dropdown-blur)",
    border:      "var(--glass-dropdown-border)",
    boxShadow:   "var(--glass-dropdown-shadow)",
    borderRadius:"var(--radius-xl)",
    overflow:    "hidden",
    padding:     "var(--space-1) 0",
  };

  // ─── Hover state helpers (simples via ref)────────────────────────────────
  const useHover = () => {
    const [hovered, setHovered] = useState(false);
    return {
      hovered,
      hoverProps: {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      },
    };
  };

  const themeHover    = useHover();
  const bellHover     = useHover();
  const langHover     = useHover();
  const logoutHover   = useHover();

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Menu latéral (StaggeredPanel) */}
      <StaggeredMenuPanel
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        position="right"
        items={NAV_MENU_ITEMS}
        socialItems={NAV_SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        colors={["var(--secondary-300)", "var(--primary-600)"]}
        accentColor="var(--primary-600)"
        closeOnClickAway
      />

      {/* ─── TopBar wrapper ───────────────────────────────────────────────── */}
      <div
        className={`fixed flex flex-col top-0 left-0 right-0 ${className}`}
        style={{
          height:    "var(--header-height)",
          zIndex:    "var(--z-sticky)" as unknown as number,
          background:"transparent",
        }}
      >
        {/* ExpandableDock — recherche rapide */}
        <ExpandableDock
          headerContent={
            <div style={{
              display:        "flex",
              alignItems:     "center",
              gap:            "var(--space-2)",
              width:          "100%",
              padding:        "var(--space-2) var(--space-3)",
              borderRadius:   "var(--radius-lg)",
              background:     "var(--glass-sm-bg)",
              backdropFilter: "var(--glass-sm-blur)",
              WebkitBackdropFilter: "var(--glass-sm-blur)",
            }}>
              <Search style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", color: "var(--surface-mutedForeground)" }} />
              <span style={{ fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)", color: "var(--surface-foreground)" }}>
                Recherche
              </span>
              <div style={{
                marginLeft:   "auto",
                fontSize:     "var(--fs-xs)",
                background:   "var(--surface-glass)",
                color:        "var(--surface-mutedForeground)",
                padding:      "var(--space-0-5) var(--space-1)",
                borderRadius: "var(--radius-sm)",
              }}>
                ⌘ F
              </div>
            </div>
          }
          className="bg-transparent"
        >
          {/* Panneau search étendu */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{
              marginBottom: "var(--space-6)",
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--space-3)",
              background:   "var(--surface-muted)",
              borderRadius: "var(--radius-xl)",
              padding:      "var(--space-3) var(--space-4)",
              border:       "1px solid var(--border-default)",
            }}>
              <Search style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", color: "var(--surface-mutedForeground)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher composants, guides..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex:       1,
                  background: "transparent",
                  border:     "none",
                  outline:    "none",
                  fontSize:   "var(--fs-sm)",
                  color:      "var(--surface-foreground)",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  style={{ fontSize: "var(--fs-sm)", color: "var(--surface-mutedForeground)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </ExpandableDock>

        {/* ─── Barre principale ─────────────────────────────────────────────── */}
        <div style={{
          height:         "var(--header-height)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 var(--space-4)",
          background:     glassHeader.background,
          backdropFilter: glassHeader.backdropFilter,
          WebkitBackdropFilter: glassHeader.backdropFilter,
          borderBottom:   glassHeader.border,
          boxShadow:      glassHeader.boxShadow,
          transition:     "var(--transition-glass)",
        }}>

          {/* ── LOGO / MagicRings ────────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            marginRight: "var(--space-2)",
          }}>
            <div style={{ width: "80px", height: "48px", position: "relative" }}>
              <MagicRings
                color="#818cf8"
                colorTwo="#4f46e5"
                ringCount={6}
                speed={1}
                attenuation={10}
                lineThickness={0.02}
                baseRadius={0.15}
                radiusStep={0.06}
                scaleRate={0.6}
                opacity={1}
                blur={0}
                noiseAmount={0.1}
                rotation={0}
                ringGap={1.5}
                fadeIn={0.7}
                fadeOut={0.5}
                followMouse={false}
                mouseInfluence={0.2}
                hoverScale={1.2}
                parallax={0.05}
                clickBurst={false}
              />
            </div>
          </div>

          {/* ── PARTIE GAUCHE : breadcrumb + config ──────────────────────── */}
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "space-between",
            flex:           1,
            minWidth:       0,
            height:         "100%",
            padding:        "var(--space-2) 0",
            gap:            "var(--space-1)",
          }}>
            {/* Lien Configurations */}
            <TopSheet>
              <TopSheetTrigger asChild>
                <button style={{
                  background:  "none",
                  border:      "none",
                  cursor:      "pointer",
                  fontSize:    "var(--fs-sm)",
                  fontWeight:  "var(--fw-medium)",
                  color:       "var(--surface-foreground)",
                  transition:  "var(--transition-colors)",
                  textAlign:   "left",
                  padding:     0,
                }}>
                  Configurations
                </button>
              </TopSheetTrigger>
              <TopSheetContent>
                <TopSheetHeader>
                  <TopSheetTitle>Structure</TopSheetTitle>
                  <TopSheetDescription>Informations sur la structure courante</TopSheetDescription>
                </TopSheetHeader>
                <StructureInfoCard />
                <TopSheetFooter>
                  <TopSheetClose asChild>
                    <Button variant="ghost">Fermer</Button>
                  </TopSheetClose>
                </TopSheetFooter>
              </TopSheetContent>
            </TopSheet>

            {/* Breadcrumb */}
            <div style={{
              display:    "flex",
              alignItems: "center",
              gap:        "var(--space-1)",
              fontSize:   "var(--fs-xs)",
              color:      "var(--surface-mutedForeground)",
              overflow:   "hidden",
            }}>
              {navigationPath.length > 0 ? (
                navigationPath.map((seg, i) => (
                  <React.Fragment key={seg}>
                    {i > 0 && (
                      <ChevronRight style={{ width: "var(--icon-xs)", height: "var(--icon-xs)", flexShrink: 0 }} />
                    )}
                    <span style={{
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                      maxWidth:     "8rem",
                    }}>{seg}</span>
                  </React.Fragment>
                ))
              ) : (
                <>
                  <span>Accueil</span>
                  <ChevronRight style={{ width: "var(--icon-xs)", height: "var(--icon-xs)", flexShrink: 0 }} />
                  <span>Tableau de bord</span>
                </>
              )}
            </div>
          </div>

          {/* ── PARTIE DROITE : actions ───────────────────────────────────── */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        "var(--space-2)",
            flexShrink: 0,
          }}>

            {/* Toggle dark / light */}
            <button
              title="Basculer le thème"
              onClick={toggleDarkMode}
              {...themeHover.hoverProps}
              style={{
                ...iconBtn,
                ...(themeHover.hovered ? iconBtnHoverStyle : {}),
              }}
            >
              {isDark
                ? <Sun  style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
                : <Moon style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
              }
            </button>

            {/* Cloche notifications */}
            <button
              {...bellHover.hoverProps}
              style={{
                ...iconBtn,
                position: "relative",
                ...(bellHover.hovered ? iconBtnHoverStyle : {}),
              }}
            >
              <Bell style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
              {/* Badge */}
              <span style={{
                position:     "absolute",
                top:          "var(--space-1)",
                right:        "var(--space-1)",
                width:        "var(--space-2)",
                height:       "var(--space-2)",
                background:   "var(--warning-500)",
                borderRadius: "var(--radius-full)",
              }} />
            </button>

            {/* Profil utilisateur */}
            <div style={{ position: "relative" }} ref={profileRef}>
              <button
                onClick={() => setShowUserProfile(!showUserProfile)}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "var(--space-2)",
                  padding:      "var(--space-1)",
                  borderRadius: "var(--radius-lg)",
                  background:   showUserProfile ? "var(--surface-glass)" : "transparent",
                  border:       "none",
                  cursor:       "pointer",
                  transition:   "var(--transition-glass)",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width:          "var(--space-8)",
                  height:         "var(--space-8)",
                  borderRadius:   "var(--radius-full)",
                  background:     `linear-gradient(135deg, var(--primary-500), var(--secondary-600))`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  boxShadow:      "var(--shadow-sm)",
                }}>
                  <span style={{
                    fontSize:   "var(--fs-xs)",
                    fontWeight: "var(--fw-bold)",
                    color:      "#ffffff",
                    userSelect: "none",
                  }}>{kcInitials}</span>
                </div>

                {/* Nom + email */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
                  <span style={{
                    fontSize:     "var(--fs-sm)",
                    fontWeight:   "var(--fw-medium)",
                    color:        "var(--surface-foreground)",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                    maxWidth:     "7.5rem",
                  }}>{kcFullName}</span>
                  <span style={{
                    fontSize:     "var(--fs-xs)",
                    color:        "var(--surface-mutedForeground)",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                    maxWidth:     "7.5rem",
                  }}>{kcEmail}</span>
                </div>

                <ChevronDown style={{
                  width:     "var(--icon-sm)",
                  height:    "var(--icon-sm)",
                  color:     "var(--surface-mutedForeground)",
                  transform: showUserProfile ? "rotate(180deg)" : "rotate(0deg)",
                  transition:"var(--transition-transform)",
                  flexShrink:0,
                }} />
              </button>

              {/* Dropdown profil */}
              <AnimatePresence>
                {showUserProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.42, 0, 0.18, 1] }}
                    style={dropdownStyle}
                  >
                    <div style={{ padding: "var(--space-1)", minWidth: "16rem" }}>
                      <UserProfileCard />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sélecteur de langue */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                {...langHover.hoverProps}
                style={{
                  ...iconBtn,
                  flexDirection: "row",
                  gap:           "var(--space-1)",
                  ...(langHover.hovered ? iconBtnHoverStyle : {}),
                }}
              >
                <span style={{ fontSize: "var(--fs-sm)" }}>{selectedLanguage.flag}</span>
                <ChevronDown style={{ width: "var(--icon-xs)", height: "var(--icon-xs)" }} />
              </button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18, ease: [0.42, 0, 0.18, 1] }}
                    style={dropdownStyle}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLanguage(lang); setShowLanguageMenu(false); }}
                        style={{
                          display:    "flex",
                          alignItems: "center",
                          gap:        "var(--space-2)",
                          width:      "100%",
                          textAlign:  "left",
                          padding:    "var(--space-2) var(--space-3)",
                          fontSize:   "var(--fs-sm)",
                          color:      "var(--surface-foreground)",
                          background: selectedLanguage.code === lang.code
                            ? "var(--surface-accent)" : "transparent",
                          border:     "none",
                          cursor:     "pointer",
                          transition: "var(--transition-colors)",
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bouton logout */}
            <button
              title="Déconnexion"
              {...logoutHover.hoverProps}
              onClick={() => {
                toast({
                  variant:     "warning",
                  title:       "Déconnexion",
                  description: "Voulez-vous vous déconnecter ?",
                  duration:    0,
                  action: {
                    label:   "Confirmer",
                    onClick: () => {
                      toast({ variant: "success", title: "Déconnexion en cours", description: "Fermeture de la session...", duration: 3000 });
                      navigate("/auth/logout");
                    },
                  },
                  cancel: { label: "Annuler", onClick: () => {} },
                });
              }}
              style={{
                ...iconBtn,
                color: logoutHover.hovered ? "var(--error-400)"  : "var(--surface-mutedForeground)",
                background: logoutHover.hovered ? "rgba(var(--error-500), 0.10)" : "transparent",
              }}
            >
              <LogOut style={{ width: "var(--icon-sm)", height: "var(--icon-sm)" }} />
            </button>

            {/* Bouton menu hamburger */}
            <MenuToggleButton
              isOpen={menuOpen}
              onToggle={() => setMenuOpen((p) => !p)}
              menuButtonColor="var(--surface-foreground)"
              openMenuButtonColor="var(--surface-foreground)"
              changeMenuColorOnOpen
            />
          </div>
        </div>

        {/* Popup recherche */}
        <SearchPopup isOpen={showSearchPopup} onClose={() => setShowSearchPopup(false)} />

        {/* Overlay fermeture menus */}
        <AnimatePresence>
          {(showLanguageMenu || showSearchPopup) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0"
              style={{ zIndex: "calc(var(--z-dropdown) - 1)" as unknown as number, background: "transparent" }}
              onClick={() => { setShowLanguageMenu(false); setShowSearchPopup(false); }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// ============================================================================
// TREE ITEM — Side Sheet navigation
// ============================================================================
interface TreeItemProps {
  item: NavigationItem;
  level: number;
  onSelect: (path: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = !!item.children?.length;
  const Icon = item.icon || Home;

  return (
    <div>
      <button
        onClick={() => hasChildren ? setIsExpanded(!isExpanded) : onSelect(item.path)}
        style={{
          width:        "100%",
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-2)",
          paddingLeft:  `calc(${level} * var(--space-4) + var(--space-3))`,
          paddingRight: "var(--space-3)",
          paddingTop:   "var(--space-2)",
          paddingBottom:"var(--space-2)",
          borderRadius: "var(--radius-lg)",
          border:       "none",
          background:   "transparent",
          cursor:       "pointer",
          textAlign:    "left",
          fontSize:     "var(--fs-sm)",
          color:        "var(--surface-foreground)",
          transition:   "var(--transition-glass)",
        }}
      >
        {hasChildren && (
          <span style={{ color: "var(--surface-mutedForeground)" }}>
            {isExpanded
              ? <ChevronDown style={{ width: "var(--icon-xs)", height: "var(--icon-xs)" }} />
              : <ChevronRight style={{ width: "var(--icon-xs)", height: "var(--icon-xs)" }} />
            }
          </span>
        )}
        {!hasChildren && <span style={{ width: "var(--icon-xs)" }} />}
        <Icon style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", color: "var(--surface-mutedForeground)" }} />
        <span style={{ flex: 1 }}>{item.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div style={{ marginTop: "var(--space-1)" }}>
          {item.children!.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompactTopBar;
