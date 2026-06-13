
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactTopBar } from "@/components/topbar";
import AnimeSphereAnimation from "@/components/widgets/anime-sphere-animation";
import Layout from "./BaseContent";

interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  middle?: React.ReactNode;
  rightPanel?: React.ReactNode;
  background?: React.ReactNode;
  sidebarWidth?: number;
  rightPanelWidth?: number;
  sidebarMinWidth?: number;
  sidebarMaxWidth?: number;
  rightPanelMinWidth?: number;
  rightPanelMaxWidth?: number;
  mainMinWidth?: number;
  onSidebarToggle?: (isOpen: boolean) => void;
  onResize?: (leftSize: number, middleSize: number, rightSize: number) => void;
  className?: string;
  isSombre ?: boolean;
}

export default function BasePage({
  header,
  sidebar,
  main,
  middle,
  rightPanel,
  background,
  sidebarWidth = 280,
  rightPanelWidth = 320,
  sidebarMinWidth = 100,
  sidebarMaxWidth = 500,
  rightPanelMinWidth = 200,
  rightPanelMaxWidth = 600,
  mainMinWidth = 300,
  onSidebarToggle,
  onResize,
  className,
  isSombre = true,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(sidebarWidth > 0);
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [leftWidth, setLeftWidth] = React.useState(sidebarWidth);
  const [rightWidth, setRightWidth] = React.useState(rightPanelWidth);
  const [isDraggingSidebar, setIsDraggingSidebar] = React.useState(false);
  const [isDraggingInternal, setIsDraggingInternal] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1920
  );
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);

  const customEasing = [0.16, 1, 0.3, 1];

  // Responsive breakpoints
  const isTablet = windowWidth < 700;
  const isMobile = windowWidth < 400;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  
  
  const handleSidebarDragStart = (e: React.MouseEvent) => {
    if (isMobile || isTablet) return;
    e.preventDefault();
    setIsDraggingSidebar(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleInternalDragStart = (e: React.MouseEvent) => {
    if (isTablet) return;
    e.preventDefault();
    setIsDraggingInternal(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (isDraggingSidebar) {
        const newWidth = Math.max(
          sidebarMinWidth,
          Math.min(e.clientX - containerRect.left, sidebarMaxWidth)
        );
        setLeftWidth(newWidth);
      }

      if (isDraggingInternal && mainContainerRef.current) {
        const mainContainerRect =
          mainContainerRef.current.getBoundingClientRect();
        const mainContainerWidth = mainContainerRect.width;
        const relativeX = e.clientX - mainContainerRect.left;

        const newRightWidth = Math.max(
          rightPanelMinWidth,
          Math.min(mainContainerWidth - relativeX, rightPanelMaxWidth)
        );
        const calculatedMainWidth = mainContainerWidth - newRightWidth;

        // Ensure main content respects minimum width
        if (calculatedMainWidth >= mainMinWidth) {
          setRightWidth(newRightWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSidebar(false);
      setIsDraggingInternal(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Notify parent of resize
      if (onResize && mainContainerRef.current) {
        const mainWidth =
          mainContainerRef.current.getBoundingClientRect().width - rightWidth;
        onResize(leftWidth, mainWidth, rightWidth);
      }
    };

    if (isDraggingSidebar || isDraggingInternal) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingSidebar,
    isDraggingInternal,
    sidebarMinWidth,
    sidebarMaxWidth,
    rightPanelMinWidth,
    rightPanelMaxWidth,
    mainMinWidth,
    leftWidth,
    rightWidth,
    onResize,
  ]);

  return (
    <div className={`relative w-full h-full overflow-hidden mt-2 ${className}`}>
      {/* Image de fond — z-index:0 → au-dessus du body (transparent),
           en-dessous du contenu (z:10+) et de la TopBar (z:200) */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        {background ? (
          background
        ) : (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/iam-lock.webp')",
                opacity: 1,
              }}
            ><AnimeSphereAnimation /></div>
            {isSombre ? (
              <div className="absolute inset-0 bg-black/30"></div>
            ):(null)}
          </>
        )}
      </div>
  
      {/* Header Fixed */}
      {header && (
        <motion.header
          className="sticky top-0 left-0 right-0 z-5 h-12"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: customEasing }}
        >
          {header}
        </motion.header>
      )}
  
      {/* Main Container - Parent commun pour les 3 sections */}
      <div
        ref={containerRef}
        className={`flex w-full h-full`}
      >
          
        {/* LEFT SIDEBAR - Desktop/Tablet */}
        {!isMobile && (
          <AnimatePresence mode="popLayout">
            {isSidebarOpen && (
              <motion.aside
                key="desktop-sidebar"
                initial={{ x: -leftWidth, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -leftWidth, opacity: 0 }}
                transition={{ duration: 0.5, ease: customEasing }}
                style={{ width: leftWidth }}
                className="relative flex-shrink-0 h-full overflow-y-auto no-scrollbar"
              >
                {sidebar}
              </motion.aside>
            )}
            {!isTablet && isSidebarOpen && sidebarWidth > 0 && (
              <div
                className={cn(
                  "relative w-1 flex-shrink-0 cursor-col-resize group hover:w-1 transition-all",
                  isDraggingSidebar && "w-1"
                )}
                onMouseDown={handleSidebarDragStart}
              >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 flex items-center justify-center">
                  <div className="h-12 w-1 rounded-full bg-white/20 group-hover:bg-purple-500/50 transition-colors" />
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
  
        {/* MAIN CONTENT CONTAINER - Au même niveau */}
        <div ref={mainContainerRef} className={`flex-1 h-full flex relative ${className}`}>
          {/* Loader
          <AnimatePresence mode="popLayout">
            {isLoading && (
              <motion.div
                key="loader-overlay"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center no-scrollbar"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}
  
          {/* Main Content */}
          <main
            className="h-full overflow-y-auto flex-1"
            style={{
              minWidth: isTablet ? "auto" : mainMinWidth,
            }}
          >
            {main || (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/50 text-lg">Main Content Area</p>
              </div>
            )}
          </main>


          {/* Internal Resizer - Only on desktop */}
          {!isTablet && rightPanel && (
            <div
              className={cn(
                "relative w-1 flex-shrink-0 cursor-col-resize group hover:w-1 transition-all",
                isDraggingInternal && "w-1"
              )}
              onMouseDown={handleInternalDragStart}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 flex items-center justify-center">
                <div className="h-12 w-1 rounded-full bg-white/20 group-hover:bg-purple-500/50 transition-colors" />
              </div>
            </div>
          )}
  
  
          {/* RIGHT PANEL - Desktop only - Au même niveau */}
          {!isTablet && rightPanel && (
            <aside
              style={{
                width: rightWidth,
                minWidth: rightPanelMinWidth,
                maxWidth: rightPanelMaxWidth,
              }}
              className="relative flex-shrink-0 h-full overflow-y-auto border-l border-white/10"
            >
              {rightPanel}
            </aside>
          )}
        </div>
      </div>

      {/* no-scrollbar via <style> standard — styled-jsx non supporté par Vite */}
      <style>{`
        .no-scrollbar {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
