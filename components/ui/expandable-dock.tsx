
import React, { useState, ReactNode, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableDockProps {
  headerContent: ReactNode;
  children: ReactNode;
  className?: string;
}

const ExpandableDock = ({
  headerContent,
  children,
  className,
}: ExpandableDockProps) => {
  const [animationStage, setAnimationStage] = useState<
    | "collapsed"
    | "widthExpanding"
    | "heightExpanding"
    | "fullyExpanded"
    | "contentFadingOut"
    | "heightCollapsing"
    | "widthCollapsing"
  >("collapsed");

  const containerRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    setAnimationStage("widthExpanding");
    setTimeout(() => setAnimationStage("heightExpanding"), 400);
    setTimeout(() => setAnimationStage("fullyExpanded"), 850);
  };

  const handleCollapse = () => {
    setAnimationStage("contentFadingOut");
    setTimeout(() => setAnimationStage("heightCollapsing"), 250);
    setTimeout(() => setAnimationStage("widthCollapsing"), 650);
    setTimeout(() => setAnimationStage("collapsed"), 1050);
  };

  const isCollapsed = animationStage === "collapsed";
  const isExpanded = animationStage === "fullyExpanded";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (isExpanded || animationStage === "widthExpanding" || animationStage === "heightExpanding")
      ) {
        handleCollapse();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, animationStage]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full px-2 sm:px-0">
      <motion.div
        ref={containerRef}
        initial={{
          width: "min(95vw, 320px)",
          height: 52,
          borderRadius: 999,
        }}
        animate={{
          width:
            animationStage === "collapsed" ||
            animationStage === "widthCollapsing"
              ? "min(95vw, 320px)"
              : animationStage === "widthExpanding"
              ? "min(95vw, 480px)"
              : "95vw",
          height:
            animationStage === "collapsed" ||
            animationStage === "widthExpanding" ||
            animationStage === "widthCollapsing"
              ? 52
              : animationStage === "heightExpanding"
              ? "min(70vh, 400px)"
              : "70vh",
          borderRadius: isCollapsed ? 999 : 16,
        }}
        transition={{
          width: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
          height: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
          borderRadius: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
        }}
        className={cn(
          "bg-transparent dark:bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col-reverse mx-auto",
          className
        )}
      >
        <div
          onClick={isCollapsed ? handleExpand : handleCollapse}
          className="flex items-center gap-2 px-3 py-2 text-white w-full h-auto whitespace-nowrap cursor-pointer border-t border-gray-800 flex-shrink-0"
        >
          {headerContent}
        </div>
        <motion.div
          animate={{
            opacity:
              animationStage === "fullyExpanded" ? 1 :
              animationStage === "contentFadingOut" ? 0 : 0,
            height:
              animationStage === "fullyExpanded" ? "auto" :
              animationStage === "heightExpanding" ? "auto" : 0,
          }}
          transition={{
            opacity: { duration: 0.3, delay: animationStage === "heightExpanding" ? 0 : 0 },
            height: { duration: 0.3, delay: 0 }
          }}
          className="p-2 sm:p-3 flex-1 flex flex-col overflow-hidden bg-transparent dark:bg-black/70 backdrop-blur-xl rounded-lg mx-2"
        >
          <div className="overflow-y-hidden overflow-x-auto scrollbar-none">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExpandableDock;
