import {
  SideSheet,
  SideSheetTrigger,
  SideSheetContent,
  SideSheetHeader,
  SideSheetTitle,
  SideSheetDescription,
  SideSheetFooter,
  SideSheetClose,
} from "@/components/side-sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import ExpandableDock from "@/components/ui/expandable-dock";
import { Link } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Languages,
  DollarSign,
  ChevronDown,
  Package,
  Zap,
  Settings,
  Sparkles,
  Loader2,
  Phone,
  Mail,
  Grid3x3,
  LogIn,
  UserPlus,
  Plus,
  Menu,
  Home,
  MessageSquare,
  FileText,
  Book,
  Users,
  Award,
  Calendar,
} from "lucide-react";
import { navigationData, NavigationItem } from "../services/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserProfileCard from "@/components/cards/user-profile-card";
import StructureInfoCard from "@/components/widgets/structure-info-cards";
import ModulesPopup from "@/components/widgets/popup";
import SearchPopup from "@/components/searchPopup";
import { Button } from "./ui/button";
import SpotifyNotificationBar from "./ui/notification-top";

import {
  TopSheet,
  TopSheetClose,
  TopSheetContent,
  TopSheetDescription,
  TopSheetFooter,
  TopSheetHeader,
  TopSheetTitle,
  TopSheetTrigger,
} from "@/components/ui/top-sheet";
import { toast, useToast } from "@/components/ui/toast";

// Données des langues disponibles
const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

// Données des modules disponibles
const AVAILABLE_MODULES = [
  {
    id: 1,
    name: "Gestion Caisse",
    description: "Module de gestion de caisse et transactions",
    category: "Finance",
    icon: null,
    path: "/caisse",
  },
  {
    id: 2,
    name: "Inventaire",
    description: "Gestion des stocks et inventaires",
    category: "Stock",
    icon: null,
    path: "/inventaire",
  },
  {
    id: 3,
    name: "Comptabilité",
    description: "Module de comptabilité générale",
    category: "Finance",
    icon: null,
    path: "/comptabilite",
  },
  {
    id: 4,
    name: "Ressources Humaines",
    description: "Gestion du personnel et des ressources humaines",
    category: "RH",
    icon: null,
    path: "/rh",
  },
  {
    id: 5,
    name: "Ventes",
    description: "Gestion des ventes et des clients",
    category: "Commercial",
    icon: null,
    path: "/ventes",
  },
  {
    id: 6,
    name: "Achats",
    description: "Gestion des achats et des fournisseurs",
    category: "Commercial",
    icon: null,
    path: "/achats",
  },
];

// ============================================================================
// URL PARSING UTILITY
// ============================================================================

/**
 * Parse l'URL du navigateur et retourne le chemin de navigation
 * Exemple: /etablissement/inptic/cours -> ["etablissement", "inptic", "cours"]
 */
const parseUrlToPath = (url: string): string[] => {
  if (typeof window === "undefined") return [];

  const pathname = url || window.location.pathname;
  // Retirer le slash initial et split par "/"
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  return segments;
};

/**
 * Trouve les items de navigation correspondant à un chemin
 * Retourne un tableau d'IDs correspondant au chemin
 */
const findNavigationPath = (
  segments: string[],
  navData: NavigationItem[] = navigationData
): string[] => {
  if (segments.length === 0) return [];

  const result: string[] = [];
  let currentItems = navData;

  for (const segment of segments) {
    // Chercher l'item qui correspond au segment (par path ou id)
    const found = currentItems.find((item) => {
      const itemPathSegment = item.path.split("/").filter(Boolean).pop();
      return itemPathSegment === segment || item.id === segment;
    });

    if (found) {
      result.push(found.id);
      if (found.children && found.children.length > 0) {
        currentItems = found.children;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return result;
};

// ============================================================================
// CASCADING DROPDOWN COMPONENT CascadingNavDropdown
// ============================================================================
const NavigationItem = ({ item, level, onHover, isActive, onNavigate, index }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (!hasChildren && item.path) {
      onNavigate(item.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onMouseEnter={() => onHover(item, level)}
      onClick={handleClick}
      className={`
        flex items-center justify-between cursor-pointer
        transition-colors duration-200
        px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3
        ${isActive ? 'bg-blue-500/30' : 'hover:bg-white/15'}
      `}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {Icon && <Icon className="w-4 h-4 sm:w-[1.125rem] sm:h-[1.125rem] md:w-5 md:h-5 text-white flex-shrink-0" />}
        <span className="text-sm sm:text-[0.9375rem] md:text-base font-medium text-white">{item.label}</span>
      </div>
      {hasChildren && (
        <ChevronRight className="w-4 h-4 sm:w-[1.125rem] sm:h-[1.125rem] md:w-5 md:h-5 text-white/70 flex-shrink-0 ml-2 sm:ml-2.5 md:ml-3" />
      )}
    </motion.div>
  );
};

const ColumnWithSearch = ({ columnItems, columnIndex, onHover, onNavigate, activeItems }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = columnItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ 
        opacity: 1, 
        width: '45vw',
        transition: { 
          width: { duration: 0.3, ease: "easeOut" },
          opacity: { duration: 0.2, delay: 0.1 }
        }
      }}
      exit={{ 
        opacity: 0, 
        width: 0,
        transition: { 
          width: { duration: 0.3, ease: "easeIn" },
          opacity: { duration: 0.15 }
        }
      }}
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      className="flex-shrink-0 border-r border-white/10 last:border-r-0 overflow-y-auto flex flex-col overflow-hidden"
    >
      <style>{`
        .flex-shrink-0::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Barre de recherche */}
      <div className="sticky top-0 bg-black/60 backdrop-blur-md border-b border-white/10 p-3 sm:p-3.5 md:p-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 sm:left-3.5 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-[1.125rem] sm:h-[1.125rem] md:w-5 md:h-5 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 sm:pl-11 md:pl-12 pr-3 sm:pr-3.5 md:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-[0.9375rem] md:text-base text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
      </div>

      {/* Liste des items */}
      <div className="flex-1 py-1 sm:py-1.5 md:py-2 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .flex-1::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <NavigationItem
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
              className="flex flex-col items-center justify-center py-6 sm:py-7 md:py-8 px-3 sm:px-3.5 md:px-4"
            >
              <Search className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white/30 mb-2 sm:mb-2.5 md:mb-3" />
              <p className="text-xs sm:text-sm text-white/50 text-center">Aucun résultat</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const CascadingNavDropdown = ({ onNavigate, initialPath = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColumns, setActiveColumns] = useState([navigationData]);
  const [activeItems, setActiveItems] = useState([null, null]);

  const handleItemHover = (item, level) => {
    const newActiveItems = [...activeItems];
    newActiveItems[level] = item.id;
    
    if (item.children && item.children.length > 0) {
      const newColumns = activeColumns.slice(0, level + 1);
      newColumns.push(item.children);
      setActiveColumns(newColumns);
      setActiveItems(newActiveItems);
    } else {
      // Si pas d'enfants, on ferme la deuxième colonne
      setActiveColumns(activeColumns.slice(0, level + 1));
      setActiveItems(newActiveItems);
    }
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  // Calcul dynamique de la largeur basé sur le nombre de colonnes visibles
  const getPopupWidth = () => {
    const visibleColumnsCount = activeColumns.length;
    return `${visibleColumnsCount * 45}vw`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-primary-100/10 hover:bg-primary-500 text-primary-100 hover:text-white rounded transition-all duration-200"
      >
        <span>Navigation</span>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div
              className="fixed inset-0 z-40 bg-black/60 w-[100vw] h-[100vh]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Popup avec backdrop-blur */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: getPopupWidth(),
                transition: {
                  opacity: { duration: 0.2 },
                  y: { duration: 0.3, type: "spring", stiffness: 200, damping: 20 },
                  scale: { duration: 0.2 },
                  width: { duration: 0.3, ease: "easeOut" }
                }
              }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
              style={{ 
                left: '1vw',
                height: '40vh',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              className="fixed top-full mt-2 z-50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl bg-black border border-white/20"
            >
              <style>{`
                .fixed::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex h-full overflow-hidden">
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




export const CompactTopBar = ({ className = '' }: { className?: string }) => {
  const { toast } = useToast();
  const [currentPath, setCurrentPath] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showModulesPopup, setShowModulesPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [navigationPath, setNavigationPath] = useState<string[]>([]); // NOUVEAU

  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState(
    new Set(["COMPONENTS"])
  );

  const currentTrack: SpotifyNotification = {
    id: "1",
    type: "song",
    title: "High Hopes",
    album: "Live at Pompeii",
    artist: "David Gilmour",
    year: "2017",
    image: "/api/placeholder/120/120",
    currentTime: "0:32",
    duration: "8:59",
    isPlaying: true,
  };

  const notifications: SpotifyNotification[] = [
    {
      id: "2",
      type: "song",
      title: "Comfortably Numb",
      subtitle: "Added to your Liked Songs",
      artist: "Pink Floyd",
      time: "2m ago",
      image: "/api/placeholder/48/48",
    },
    {
      id: "3",
      type: "playlist",
      title: "Discover Weekly",
      subtitle: "New songs just for you",
      time: "1h ago",
      image: "/api/placeholder/48/48",
    },
    {
      id: "4",
      type: "album",
      title: "Dark Side of the Moon",
      subtitle: "Album • Pink Floyd",
      artist: "Pink Floyd",
      time: "3h ago",
      image: "/api/placeholder/48/48",
    },
  ];

  const groupedNavigation = [
    {
      title: "GETTING STARTED",
      icon: Zap,
      children: [],
    },
    {
      title: "INSTALLATION GUIDE",
      icon: Settings,
      children: [],
    },
    {
      title: "COMPONENTS",
      icon: Package,
      children: [],
    },
  ];

  const filteredItems = groupedNavigation
    .map((section) => ({
      ...section,
      children: section.children.filter(
        (child) =>
          query === "" ||
          child.title.toLowerCase().includes(query.toLowerCase()) ||
          section.title.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter(
      (section) =>
        section.children.length > 0 ||
        section.title.toLowerCase().includes(query.toLowerCase())
    );

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) newExpanded.delete(title);
    else newExpanded.add(title);
    setExpandedSections(newExpanded);
  };

  const { user, isAuthenticated, loading, logout } = useAuth();
  const test = true;

  // Fermer le profil quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowUserProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Synchroniser l'URL avec le chemin de navigation
  useEffect(() => {
    const updateNavigationFromUrl = () => {
      if (typeof window === "undefined") return;

      const pathname = window.location.pathname;
      setCurrentPath(pathname);

      // Parser l'URL et mettre à jour le chemin de navigation
      const segments = parseUrlToPath(pathname);
      const navPath = findNavigationPath(segments);
      setNavigationPath(navPath);
    };

    // Mise à jour initiale
    updateNavigationFromUrl();

    // Écouter les changements d'URL (boutons précédent/suivant du navigateur)
    const handlePopState = () => {
      updateNavigationFromUrl();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const segments = parseUrlToPath(url);
      const navPath = findNavigationPath(segments);
      setNavigationPath(navPath);
    };

    router.events?.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const navigateTo = (path: string) => {
    // ✅ Navigation interne Next.js sans rechargement de page
    navigate(path);

    // ✅ Mise à jour de l'état local pour la topbar (historique, surbrillance, etc.)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);

    // ✅ Synchronisation de la topbar avec la nouvelle URL
    const segments = parseUrlToPath(path);
    const navPath = findNavigationPath(segments);
    setNavigationPath(navPath);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageMenu(false);
    console.log("Langue sélectionnée:", language);
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  const handleModuleSelect = (module) => {
    console.log("Module sélectionné:", module);
    if (module.path) {
      navigateTo(module.path);
    }
  };

  return (
    <div className={`fixed flex flex-col top-0 px-[40px] left-0 right-0 h-12 bg-transparent z-50 ${className}`}>
      <ExpandableDock
        headerContent={
          <div className="flex items-center gap-2 text-white w-full bg-transparent dark:bg-black/70 backdrop-blur-xl rounded-lg px-3 py-2">
            <Search className="w-3 h-3" />
            <span className="font-medium text-sm">Search</span>
            <div className="ml-auto text-xs bg-black/30 dark:bg-white/30 text-white px-1 py-0.5 rounded">
              {filteredItems.reduce(
                (acc, section) => acc + section.children.length,
                0
              )}{" "}
              results
            </div>
          </div>
        }
        className="bg-transparent"
      >
        <div className="flex flex-col h-full">
          <div className="mb-6 flex items-center gap-3 bg-gray-100 dark:bg-black rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search components, guides, and more..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[70vh]">
            {filteredItems.length > 0 ? (
              filteredItems.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-3 h-3" />
                      <span>{section.title}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ({section.children.length})
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform group-hover:text-gray-900 dark:group-hover:text-gray-100 ${
                        expandedSections.has(section.title) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.has(section.title) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                      {section.children.map((child, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => (window.location.href = child.href)}
                          className="text-left p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 group"
                        >
                          <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {child.title}
                            {child.category === "new" && (
                              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-2 h-2" />
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Component • Ready to use
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No results found
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or{" "}
                  <button
                    onClick={() => setQuery("")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    clear the search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ExpandableDock>

      {/* <SpotifyNotificationBar
        currentPlaying={currentTrack}
        notifications={notifications}
        onNotificationClick={(notification) => {
          console.log("Clicked notification:", notification);
        }}
      /> */}

      {/* Niveau Navigation - TopBar avec navigation en cascade */}
      <div className="h-10 bg-transparent backdrop-blur-sm flex items-center justify-between px-3 shadow-md theme-transition border-b border-border/50">
        {/* Navigation en cascade à gauche */}
        <div className="flex items-center gap-2">
          <TopSheet>
            <TopSheetTrigger asChild>
              <button className="text-xs px-2 py-1 bg-primary-100/10 hover:bg-primary-500 text-primary-100 hover:text-white rounded transition-all duration-200 theme-transition">
                Structure
              </button>
            </TopSheetTrigger>
            <TopSheetContent>
              <TopSheetHeader>
                <TopSheetTitle>Structure</TopSheetTitle>
                <TopSheetDescription>Description</TopSheetDescription>
              </TopSheetHeader>
              content..
              <TopSheetFooter>
                <TopSheetClose asChild>
                  <Button>Close</Button>
                </TopSheetClose>
              </TopSheetFooter>
            </TopSheetContent>
          </TopSheet>
          <CascadingNavDropdown
            onNavigate={navigateTo}
            initialPath={navigationPath}
          />
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-1">
          {/* <Popover>
            <PopoverTrigger>
              <button
                className="p-1.5 text-primary-100 hover:text-white hover:bg-primary-500 rounded transition-all duration-200 flex items-center gap-1 theme-transition"
                title="Navigation rapide"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="ml-2 flex p-4 w-auto h-auto backdrop-blur-xl">
              <CascadingNavDropdown
                onNavigate={navigateTo}
                initialPath={navigationPath}
              />
            </PopoverContent>
          </Popover>

          <TopSheet>
            <TopSheetTrigger asChild>
              <button className="text-xs px-2 py-1 bg-primary-100/10 hover:bg-primary-500 text-primary-100 hover:text-white rounded transition-all duration-200 theme-transition">
                Structure
              </button>
            </TopSheetTrigger>
            <TopSheetContent>
              <TopSheetHeader>
                <TopSheetTitle>Structure</TopSheetTitle>
                <TopSheetDescription>Description</TopSheetDescription>
              </TopSheetHeader>
              content..
              <TopSheetFooter>
                <TopSheetClose asChild>
                  <Button>Close</Button>
                </TopSheetClose>
              </TopSheetFooter>
            </TopSheetContent>
          </TopSheet> */}

          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1 p-1 text-primary-100 hover:text-white hover:bg-primary-500 rounded transition-all duration-200 theme-transition"
            >
              <span className="text-xs">{selectedLanguage.flag}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 top-8 bg-card rounded-lg shadow-xl border border-border py-1 min-w-36 z-50 theme-transition">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors theme-transition"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <Loader2 className="w-4 h-4 text-primary-200 animate-spin" />
          ) : test ? (
            <>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleUserProfile}
                  className="flex items-center gap-1 p-1 text-primary-100 hover:text-white hover:bg-primary-500 rounded transition-all duration-200 theme-transition"
                >
                  <div className="w-5 h-5 bg-primary-700 rounded-full flex items-center justify-center shadow-sm theme-transition">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-white text-xs hidden sm:inline">
                    {user?.name || user?.email || "Utilisateur"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-all duration-200 theme-transition ${
                      showUserProfile ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 sm:right-0 top-full mt-1 transition-all duration-300 ease-out transform origin-top-right z-50 ${
                    showUserProfile
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <UserProfileCard
                    img={user?.avatar || "/logo-ioi.png"}
                    name={user?.name || "Utilisateur"}
                    bio={user?.bio || "Aucune biographie disponible"}
                    skills={user?.skills || []}
                    socialLinks={user?.socialLinks || []}
                    position={user?.position || "Utilisateur"}
                    spotlight={true}
                    spotlightColor="14, 165, 233"
                  />
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1 text-primary-100 hover:text-white hover:bg-error-500 rounded transition-all duration-200 theme-transition"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button
                  onClick={() => (window.location.href = "/auth/login")}
                  className="p-1.5 text-primary-100 hover:text-white hover:bg-primary-500 rounded transition-all duration-200 theme-transition"
                  title="Se connecter"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/auth/register">
                <button
                  className="p-1.5 text-primary-100 hover:text-white hover:bg-primary-500 rounded transition-all duration-200 theme-transition"
                  title="S'inscrire"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Popup de recherche */}
      <SearchPopup
        isOpen={showSearchPopup}
        onClose={() => setShowSearchPopup(false)}
      />

      {/* Overlay thématique pour fermer les menus */}
      {(showLanguageMenu || showSearchPopup) && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/10 theme-transition"
          onClick={() => {
            setShowLanguageMenu(false);
            setShowSearchPopup(false);
          }}
        ></div>
      )}

      {/* Styles CSS personnalisés pour les transitions thématiques */}
      <style>{`
        .menu-button {
          transition: all 300ms ease-in-out;
          cursor: pointer;
          background-color: transparent;
          border: none;
          color: var(--foreground);
          padding: 0;
          margin: 0;
          font-size: 1.5rem;
        }

        .menu-button:hover {
          background-color: var(--primary-500);
          color: var(--background);
        }

        .theme-transition {
          transition: background-color var(--duration-300) var(--easing-out),
            border-color var(--duration-300) var(--easing-out),
            color var(--duration-300) var(--easing-out),
            box-shadow var(--duration-300) var(--easing-out),
            transform var(--duration-200) var(--easing-out);
        }

        .dropdown-enter {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }

        .dropdown-enter-active {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: all var(--duration-200) var(--easing-out);
        }

        .hover-glow:hover {
          box-shadow: 0 0 0 1px var(--primary-300), 0 0 8px var(--primary-200);
        }

        .icon-bounce {
          animation: iconBounce 2s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// TREE ITEM COMPONENT FOR SIDE SHEET
// ============================================================================

interface TreeItemProps {
  item: NavigationItem;
  level: number;
  onSelect: (path: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const IconComponent = item.icon || Home;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(item.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left hover:bg-accent text-foreground hover:text-accent-foreground theme-transition"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren && (
          <span className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-3" />}
        <IconComponent className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 text-sm">{item.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
