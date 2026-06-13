// ============================================================
// components/ui/toast.tsx
// Système de toast — refactorisé avec les variables CSS du thème
// Logique et structure préservées intégralement
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastCancel {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info" | "loading";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duration?: number;
  action?: React.ReactNode | ToastAction;
  cancel?: ToastCancel;
  onClose?: () => void;
  stackIndex?: number;
  isVisible?: boolean;
  isStacked?: boolean;
  isHovered?: boolean;
  stackDirection?: "up" | "down";
  isExiting?: boolean;
  totalCount?: number;
}

interface ToastState extends ToastProps {
  id: string;
  timestamp: number;
}

interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info" | "loading";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duration?: number;
  action?: React.ReactNode | ToastAction;
  cancel?: ToastCancel;
}

type ToastListener = (toasts: ToastState[]) => void;

// ─── Tokens de variante ───────────────────────────────────────────────────────
// Chaque variante définit couleur d'accent, fond teinté, bordure tintée
const VARIANT_TOKENS: Record<
  string,
  { accent: string; bg: string; border: string; shadow: string; iconColor: string }
> = {
  default: {
    accent:    "var(--surface-foreground)",
    bg:        "var(--glass-toast-bg)",
    border:    "var(--glass-toast-border)",
    shadow:    "var(--glass-toast-shadow)",
    iconColor: "var(--surface-mutedForeground)",
  },
  success: {
    accent:    "var(--success-400)",
    bg:        "var(--glass-toast-bg)",
    border:    "1px solid rgba(var(--success-400-rgb, 74,222,128), .30)",
    shadow:    "0 8px 32px rgba(74,222,128,.12), inset 0 1px 0 rgba(255,255,255,.06)",
    iconColor: "var(--success-400)",
  },
  destructive: {
    accent:    "var(--error-400)",
    bg:        "var(--glass-toast-bg)",
    border:    "1px solid rgba(var(--error-400-rgb, 248,113,113), .30)",
    shadow:    "0 8px 32px rgba(248,113,113,.12), inset 0 1px 0 rgba(255,255,255,.06)",
    iconColor: "var(--error-400)",
  },
  warning: {
    accent:    "var(--warning-400)",
    bg:        "var(--glass-toast-bg)",
    border:    "1px solid rgba(var(--warning-400-rgb, 251,191,36), .30)",
    shadow:    "0 8px 32px rgba(251,191,36,.12), inset 0 1px 0 rgba(255,255,255,.06)",
    iconColor: "var(--warning-400)",
  },
  info: {
    accent:    "var(--primary-400)",
    bg:        "var(--glass-toast-bg)",
    border:    "1px solid rgba(var(--primary-400-rgb, 79,156,249), .30)",
    shadow:    "0 8px 32px rgba(79,156,249,.12), inset 0 1px 0 rgba(255,255,255,.06)",
    iconColor: "var(--primary-400)",
  },
  loading: {
    accent:    "var(--primary-400)",
    bg:        "var(--glass-toast-bg)",
    border:    "1px solid rgba(var(--primary-400-rgb, 79,156,249), .30)",
    shadow:    "0 8px 32px rgba(79,156,249,.12), inset 0 1px 0 rgba(255,255,255,.06)",
    iconColor: "var(--primary-400)",
  },
};

// ─── Manager ──────────────────────────────────────────────────────────────────
class ToastManager {
  private toasts: ToastState[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  add(props: ToastProps) {
    const id = props.id || Math.random().toString(36).substr(2, 9);
    const existing = this.toasts.findIndex((t) => t.id === id);
    if (existing !== -1) {
      this.toasts[existing] = { ...this.toasts[existing], ...props, id };
      this.notify();
      return id;
    }
    this.toasts = [{ ...props, id, timestamp: Date.now() }, ...this.toasts].slice(0, 10);
    this.notify();
    return id;
  }

  update(id: string, props: Partial<ToastProps>) {
    const idx = this.toasts.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.toasts[idx] = { ...this.toasts[idx], ...props };
      this.notify();
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  getToasts() {
    return [...this.toasts];
  }
}

const toastManager = new ToastManager();

// ─── API publique ─────────────────────────────────────────────────────────────
export function toast(message: string, options?: ToastOptions): string;
export function toast(options: ToastOptions & { title: string }): string;
export function toast(
  messageOrOptions: string | (ToastOptions & { title: string }),
  options?: ToastOptions
): string {
  const props: ToastOptions & { title: string } =
    typeof messageOrOptions === "string"
      ? { title: messageOrOptions, ...options }
      : messageOrOptions;
  return toastManager.add(props);
}

toast.success  = (msg: string, opts?: ToastOptions) => toast({ title: msg, variant: "success",     ...opts });
toast.error    = (msg: string, opts?: ToastOptions) => toast({ title: msg, variant: "destructive",  ...opts });
toast.warning  = (msg: string, opts?: ToastOptions) => toast({ title: msg, variant: "warning",      ...opts });
toast.info     = (msg: string, opts?: ToastOptions) => toast({ title: msg, variant: "info",         ...opts });
toast.loading  = (msg: string, opts?: ToastOptions) => toast({ title: msg, variant: "loading", duration: Infinity, ...opts });

toast.promise = <T,>(promise: Promise<T>, options: { loading: string; success: string; error: string }): Promise<T> => {
  const id = toast.loading(options.loading);
  promise
    .then(()  => toastManager.update(id, { title: options.success, variant: "success",     duration: 5000 }))
    .catch(() => toastManager.update(id, { title: options.error,   variant: "destructive", duration: 5000 }));
  return promise;
};

toast.dismiss = (id?: string) => {
  id ? toastManager.remove(id) : toastManager.clear();
};

// ─── Icônes de variante ───────────────────────────────────────────────────────
function ToastIcon({ variant }: { variant: string }) {
  const tokens = VARIANT_TOKENS[variant] ?? VARIANT_TOKENS.default;

  if (variant === "loading") {
    return (
      <div style={{ width: "var(--icon-sm)", height: "var(--icon-sm)", flexShrink: 0, position: "relative" }}>
        <motion.div
          style={{
            position: "absolute", inset: 0,
            background: tokens.iconColor,
            boxShadow: `0 0 6px ${tokens.iconColor}`,
            borderRadius: "var(--radius-xs)",
          }}
          animate={{ rotateX: [0, 180, 0], rotateY: [0, 180, 0] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        />
      </div>
    );
  }

  const iconProps = {
    style: { color: tokens.iconColor, flexShrink: 0 } as React.CSSProperties,
    size: 18,
  };

  if (variant === "success")     return <CheckCircle  {...iconProps} />;
  if (variant === "destructive") return <AlertCircle  {...iconProps} />;
  if (variant === "warning")     return <AlertCircle  {...iconProps} />;
  if (variant === "info")        return <Info         {...iconProps} />;
  return null;
}

// ─── Composant toast individuel ───────────────────────────────────────────────
const ToastComponent: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = "default",
  position = "top-right",
  duration = 5000,
  onClose,
  action,
  cancel,
  stackIndex = 0,
  isVisible = true,
  isStacked = false,
  isHovered = false,
  stackDirection = "down",
  isExiting = false,
  totalCount = 1,
}) => {
  const [translateX, setTranslateX]   = useState(0);
  const toastRef        = useRef<HTMLDivElement>(null);
  const closeButtonRef  = useRef<HTMLButtonElement>(null);
  const startX          = useRef(0);
  const isDragging      = useRef(false);
  const isTouchAction   = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const tokens = VARIANT_TOKENS[variant] ?? VARIANT_TOKENS.default;

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleClose = useCallback((e?: React.UIEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    onClose?.();
  }, [onClose]);

  // Drag / swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (e.target instanceof Element) {
      if (closeButtonRef.current?.contains(e.target) || (e.target as Element).closest('button[role="button"]')) {
        isTouchAction.current = true;
        return;
      }
    }
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startX.current   = clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isTouchAction.current || !isDragging.current || !toastRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = clientX - startX.current;
    if (isMobile) {
      setTranslateX(diff);
    } else {
      if (position.includes("right") && diff > 0) setTranslateX(diff);
      else if (position.includes("left") && diff < 0) setTranslateX(diff);
    }
  }, [position, isMobile]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isTouchAction.current) { isTouchAction.current = false; return; }
    if (!isDragging.current || !toastRef.current) return;
    e.stopPropagation();
    const threshold = toastRef.current.offsetWidth * 0.3;
    if (Math.abs(translateX) >= threshold) handleClose();
    else setTranslateX(0);
    isDragging.current = false;
  }, [translateX, handleClose]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!isHovered && duration !== Infinity && duration > 0 && !isExiting) {
      const t = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(t);
    }
  }, [duration, isHovered, handleClose, isExiting]);

  // Event listeners
  useEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart as unknown as EventListener, { passive: false });
    el.addEventListener("mousedown",  handleTouchStart as unknown as EventListener);
    window.addEventListener("touchmove", handleTouchMove as unknown as EventListener, { passive: false });
    window.addEventListener("mousemove", handleTouchMove as unknown as EventListener);
    window.addEventListener("touchend",  handleTouchEnd as unknown as EventListener);
    window.addEventListener("mouseup",   handleTouchEnd as unknown as EventListener);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart as unknown as EventListener);
      el.removeEventListener("mousedown",  handleTouchStart as unknown as EventListener);
      window.removeEventListener("touchmove", handleTouchMove as unknown as EventListener);
      window.removeEventListener("mousemove", handleTouchMove as unknown as EventListener);
      window.removeEventListener("touchend",  handleTouchEnd as unknown as EventListener);
      window.removeEventListener("mouseup",   handleTouchEnd as unknown as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!isVisible) return null;

  // ── Calculs de transform / opacity / zIndex ─────────────────────────────
  const getTransform = () => {
    if (isStacked && stackIndex > 0) {
      const offset = stackIndex * 8;
      const scale  = Math.max(0.85, 1 - stackIndex * 0.05);
      return stackDirection === "up"
        ? `translateX(${translateX}px) translateY(-${offset}px) scale(${scale})`
        : `translateX(${translateX}px) translateY(${offset}px) scale(${scale})`;
    }
    if (!isStacked && stackIndex > 0) {
      const offset = stackIndex * 88;
      return stackDirection === "up"
        ? `translateX(${translateX}px) translateY(-${offset}px)`
        : `translateX(${translateX}px) translateY(${offset}px)`;
    }
    return `translateX(${translateX}px)`;
  };

  const getOpacity = () => {
    if (translateX !== 0) return Math.max(0.3, 1 - Math.abs(translateX) / (toastRef.current?.offsetWidth || 320));
    if (isStacked && stackIndex >= 3) return 0.4;
    return 1;
  };

  const getZIndex = () => 1100 - stackIndex;

  // ── Render action ───────────────────────────────────────────────────────
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) {
      const el = action as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
      return (
        <div style={{ marginLeft: "var(--space-2)", flexShrink: 0 }}>
          {React.cloneElement(el, {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              el.props.onClick?.(e);
              handleClose();
            },
          })}
        </div>
      );
    }
    if (typeof action === "object" && action !== null && "label" in action && "onClick" in action) {
      const a = action as ToastAction;
      return (
        <div style={{ marginLeft: "var(--space-2)", flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); a.onClick(); handleClose(); }}
            style={{
              fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)",
              fontFamily: "var(--font-sans)",
              background: "rgba(255,255,255,.10)",
              color: "var(--surface-foreground)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              padding: "0.125rem var(--space-3)",
              cursor: "pointer",
              transition: "var(--transition-colors)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.10)"; }}
          >
            {a.label}
          </button>
        </div>
      );
    }
    return null;
  };

  // ── Accent bar couleur (left border) ────────────────────────────────────
  const showAccentBar = variant !== "default";

  return (
    <motion.div
      ref={toastRef}
      role="alert"
      aria-live="polite"
      initial={{
        x:       position.includes("right") ? 400 : -400,
        y:       position.includes("top")   ? -100 : 100,
        opacity: 0,
        scale:   0.9,
      }}
      animate={{
        x: 0, y: 0,
        opacity:   getOpacity(),
        scale:     isStacked && stackIndex > 0 ? Math.max(0.85, 1 - stackIndex * 0.05) : 1,
        transform: getTransform(),
      }}
      exit={{
        x:       position.includes("right") ? 400 : -400,
        opacity: 0,
        scale:   0.9,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      transition={{ type: "spring", damping: 30, stiffness: 400, duration: 0.3 }}
      style={{
        // ── Positionnement ──────────────────────────────────────────────
        // NB : position relative — le ToastStack parent est déjà fixed.
        // Un double position:fixed décale le toast hors de la vue.
        position:      "relative",
        pointerEvents: "auto",
        zIndex:        getZIndex(),
        width:         "min(24rem, calc(100vw - 2rem))",   // 384px max, respecte les petits écrans
        // ── Dimensions ─────────────────────────────────────────────────
        minHeight:     "var(--space-14, 3.5rem)",
        // ── Disposition ─────────────────────────────────────────────────
        display:       "flex",
        alignItems:    "center",
        justifyContent:"space-between",
        gap:           "var(--space-3)",
        // padding-right plus généreux pour laisser de l'espace au bouton ✕ (position:absolute)
        padding:       "var(--space-3) var(--space-10) var(--space-3) var(--space-4)",
        // ── Glass ───────────────────────────────────────────────────────
        background:          tokens.bg,
        backdropFilter:      "var(--glass-toast-blur)",
        WebkitBackdropFilter:"var(--glass-toast-blur)",
        border:              tokens.border,
        borderRadius:        "var(--radius-xl)",
        boxShadow:           tokens.shadow,
        // ── Accent bar gauche ───────────────────────────────────────────
        ...(showAccentBar && {
          borderLeft: `3px solid ${tokens.accent}`,
        }),
        // ── Overflow ────────────────────────────────────────────────────
        overflow:      "hidden",
      }}
    >
      {/* ── Contenu ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1, minWidth: 0 }}>

        {/* Icône variante */}
        {variant !== "default" && <ToastIcon variant={variant} />}

        {/* Texte */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{
              fontFamily:  "var(--font-sans)",
              fontSize:    "var(--fs-sm)",
              fontWeight:  "var(--fw-semibold)",
              color:       "var(--surface-foreground)",
              overflow:    "hidden",
              textOverflow:"ellipsis",
              whiteSpace:  "nowrap",
            }}>
              {title}
            </div>
          )}
          {description && (
            <div style={{
              fontFamily:  "var(--font-sans)",
              fontSize:    "var(--fs-xs)",
              color:       "var(--surface-mutedForeground)",
              marginTop:   "0.125rem",
              overflow:    "hidden",
              textOverflow:"ellipsis",
              whiteSpace:  "nowrap",
            }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* ── Badge count (stack) ──────────────────────────────────────── */}
      {isStacked && stackIndex === 0 && totalCount > 3 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            position:      "absolute",
            top:           "calc(-1 * var(--space-1, 0.25rem))",
            right:         "calc(-1 * var(--space-1, 0.25rem))",
            background:    "rgba(255,255,255,.20)",
            backdropFilter:"var(--glass-toast-blur)",
            color:         "var(--surface-foreground)",
            borderRadius:  "var(--radius-full)",
            border:        "1px solid var(--border-default)",
            width:         "1.25rem",
            height:        "1.25rem",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"center",
            fontFamily:    "var(--font-sans)",
            fontWeight:    "var(--fw-semibold)",
            fontSize:      "var(--fs-xs)",
            zIndex:        20,
          }}
        >
          +{totalCount - 3}
        </motion.div>
      )}

      {/* ── Action ───────────────────────────────────────────────────── */}
      {renderAction()}

      {/* ── Cancel ───────────────────────────────────────────────────── */}
      {cancel && (
        <div style={{ marginLeft: "var(--space-2)", flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); cancel.onClick(); handleClose(); }}
            style={{
              fontFamily:  "var(--font-sans)",
              fontSize:    "var(--fs-xs)",
              fontWeight:  "var(--fw-medium)",
              background:  "var(--surface-glass)",
              color:       "var(--surface-mutedForeground)",
              border:      "1px solid var(--border-default)",
              borderRadius:"var(--radius-sm)",
              padding:     "0.125rem var(--space-3)",
              cursor:      "pointer",
              transition:  "var(--transition-colors)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--surface-muted)";
              e.currentTarget.style.color      = "var(--surface-foreground)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--surface-glass)";
              e.currentTarget.style.color      = "var(--surface-mutedForeground)";
            }}
          >
            {cancel.label}
          </button>
        </div>
      )}

      {/* ── Bouton fermer ────────────────────────────────────────────── */}
      <button
        ref={closeButtonRef}
        onClick={handleClose}
        aria-label="Fermer"
        style={{
          position:      "absolute",
          top:           "var(--space-2)",
          right:         "var(--space-2)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          width:         "1.5rem",
          height:        "1.5rem",
          borderRadius:  "var(--radius-full)",
          background:    "transparent",
          border:        "none",
          color:         "var(--surface-mutedForeground)",
          cursor:        "pointer",
          transition:    "var(--transition-colors)",
          zIndex:        10,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--surface-muted)";
          e.currentTarget.style.color      = "var(--surface-foreground)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color      = "var(--surface-mutedForeground)";
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ─── ToastStack ───────────────────────────────────────────────────────────────
interface ToastStackProps {
  toasts: ToastState[];
  position: string;
  onRemoveToast: (id: string) => void;
}

const ToastStack: React.FC<ToastStackProps> = ({ toasts, position, onRemoveToast }) => {
  const [isHovered,  setIsHovered]  = useState(false);
  const [isTapped,   setIsTapped]   = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => () => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }, []);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; }
    setIsHovered(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return;
    hoverTimeout.current = setTimeout(() => { setIsHovered(false); hoverTimeout.current = null; }, 150);
  }, [isMobile]);

  const handleRemoveToast = useCallback((id: string) => {
    const item = toasts.find((t) => t.id === id);
    if (item && toasts.filter((t) => t.position === item.position).length === 1) {
      setIsHovered(false);
      setIsTapped(false);
    }
    onRemoveToast(id);
  }, [toasts, onRemoveToast]);

  if (toasts.length === 0) return null;

  const isExpanded      = isMobile ? isTapped : isHovered;
  const shouldStack     = toasts.length > 1;
  const visibleToasts   = toasts.slice(0, 3);
  const stackDirection  = position.includes("bottom") ? "up" : "down";

  return (
    <div
      style={{
        position:      "fixed",
        pointerEvents: "none",
        zIndex:        "var(--z-toast, 600)" as unknown as number,
        [position.includes("top")    ? "top"    : "bottom"]: "var(--space-4)",
        [position.includes("right")  ? "right"  : "left"  ]: "var(--space-4)",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          // Largeur fixée pour que les toasts s'empilent correctement
          // sans débordement hors de l'écran
          width: "min(24rem, calc(100vw - 2rem))",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => { if (isMobile) setIsTapped(!isTapped); }}
      >
        <AnimatePresence mode="popLayout">
          {visibleToasts.map((t, index) => (
            <ToastComponent
              key={t.id}
              {...t}
              stackIndex={index}
              isVisible
              isStacked={shouldStack && !isExpanded}
              isHovered={isHovered || isTapped}
              stackDirection={stackDirection}
              totalCount={toasts.length}
              onClose={() => handleRemoveToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── ToastContainer ───────────────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts,  setToasts]  = useState(toastManager.getToasts());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const unsub = toastManager.subscribe(setToasts);
    return unsub;
  }, []);

  const handleRemove = useCallback((id: string) => toastManager.remove(id), []);

  const processed = toasts.map((t) =>
    isMobile && t.variant !== "info" ? { ...t, position: "top-right" as const } : t
  );

  const byPosition = processed.reduce<Record<string, ToastState[]>>((acc, t) => {
    const pos = t.position || "top-right";
    (acc[pos] ||= []).push(t);
    return acc;
  }, {});

  if (toasts.length === 0) return null;

  return (
    <>
      {Object.entries(byPosition).map(([pos, pts]) => (
        <ToastStack key={pos} toasts={pts} position={pos} onRemoveToast={handleRemove} />
      ))}
    </>
  );
}

// ─── Hooks & Provider ─────────────────────────────────────────────────────────
export const useToast = () => ({ toast });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <ToastContainer />
  </>
);

export default ToastComponent;
