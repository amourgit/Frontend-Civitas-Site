
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Code, Clock, User } from "lucide-react";

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationProps {
  /** Titre de la notification */
  title?: string;
  /** Message principal */
  message?: string;
  /** Code d'erreur ou identifiant */
  code?: string;
  /** Type de notification qui détermine le style */
  type?: NotificationType;
  /** Durée d'auto-fermeture en millisecondes (0 = pas d'auto-fermeture) */
  duration?: number;
  /** Callback appelé lors de la fermeture */
  onClose?: () => void;
  /** Afficher ou masquer le bouton de fermeture */
  closable?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Afficher l'animation d'entrée */
  animate?: boolean;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    title: "Opération réussie",
    message: "La tâche a été exécutée avec succès",
    colors: {
      bg: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      title: "text-emerald-900 dark:text-emerald-100",
      message: "text-emerald-700 dark:text-emerald-300",
      code: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
      glow: "shadow-emerald-500/20 dark:shadow-emerald-400/10"
    }
  },
  error: {
    icon: AlertCircle,
    title: "Erreur détectée",
    message: "Une erreur inattendue s'est produite",
    colors: {
      bg: "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
      message: "text-red-700 dark:text-red-300",
      code: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      glow: "shadow-red-500/20 dark:shadow-red-400/10"
    }
  },
  warning: {
    icon: AlertTriangle,
    title: "Attention requise",
    message: "Veuillez vérifier les informations avant de continuer",
    colors: {
      bg: "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      message: "text-amber-700 dark:text-amber-300",
      code: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
      glow: "shadow-amber-500/20 dark:shadow-amber-400/10"
    }
  },
  info: {
    icon: Info,
    title: "Information",
    message: "Nouvelle information disponible",
    colors: {
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-700 dark:text-blue-300",
      code: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      glow: "shadow-blue-500/20 dark:shadow-blue-400/10"
    }
  },
  loading: {
    icon: Clock,
    title: "Traitement en cours",
    message: "Veuillez patienter pendant le chargement",
    colors: {
      bg: "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
      border: "border-violet-200 dark:border-violet-800",
      icon: "text-violet-600 dark:text-violet-400",
      title: "text-violet-900 dark:text-violet-100",
      message: "text-violet-700 dark:text-violet-300",
      code: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
      glow: "shadow-violet-500/20 dark:shadow-violet-400/10"
    }
  }
};

export const Notification = ({
  title,
  message,
  code,
  type = 'info',
  duration = 5000,
  onClose,
  closable = true,
  className,
  animate = true
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = notificationConfig[type];
  const Icon = config.icon;

  // Auto-fermeture
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    if (animate) {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 500); // Durée augmentée pour correspondre à l'animation
    } else {
      setIsVisible(false);
      onClose?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        // Position fixe à droite, initialement cachée hors écran
        "fixed top-4 z-[9999]",
        // Positionnement avec transform pour l'animation
        "right-4", // Position finale visible
        // Taille responsive
        "w-[calc(100vw-2rem)] max-w-md", // Mobile: presque plein écran avec marge
        "sm:w-96 md:w-[28rem] lg:w-[32rem]", // Desktop: tailles fixes progressives
        // Hauteur adaptative
        "min-h-[4rem] max-h-[50vh]",
        // Base styles
        "relative overflow-hidden rounded-xl border backdrop-blur-sm",
        "shadow-xl transition-all duration-500 ease-out",
        // Couleurs selon le type
        config.colors.bg,
        config.colors.border,
        config.colors.glow,
        // Animations de slide depuis l'extrême droite
        animate && !isLeaving && "animate-in slide-in-from-right duration-500 ease-out",
        animate && isLeaving && "animate-out slide-out-to-right duration-500 ease-in",
        // Style futuriste
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        className
      )}
    >
      {/* Barre de progression pour l'auto-fermeture */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-current opacity-60 transition-transform duration-linear origin-left"
            style={{
              transform: 'translateX(-100%)',
              animation: `progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <div className="relative p-3 sm:p-4 md:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icône avec animation */}
          <div className={cn(
            "flex-shrink-0 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm",
            "bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/10",
            config.colors.icon
          )}>
            <Icon 
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5",
                type === 'loading' && "animate-spin"
              )} 
            />
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0 py-0.5">
            {/* Titre */}
            <h3 className={cn(
              "font-semibold text-sm sm:text-base mb-1 line-clamp-2",
              config.colors.title
            )}>
              {title || config.title}
            </h3>

            {/* Message */}
            <p className={cn(
              "text-xs sm:text-sm leading-relaxed line-clamp-3",
              config.colors.message
            )}>
              {message || config.message}
            </p>

            {/* Code d'erreur */}
            {code && (
              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                <Code className="w-3 h-3 opacity-60 flex-shrink-0" />
                <span className={cn(
                  "text-xs font-mono px-2 py-1 rounded-md truncate",
                  config.colors.code
                )}>
                  {code}
                </span>
              </div>
            )}
          </div>

          {/* Bouton de fermeture */}
          {closable && (
            <button
              onClick={handleClose}
              className={cn(
                "flex-shrink-0 p-1 rounded-md transition-colors duration-200",
                "hover:bg-black/10 dark:hover:bg-white/10",
                "focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50",
                "touch-manipulation", // Meilleur support tactile
                config.colors.icon
              )}
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Effet de brillance futuriste */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
          animation: 'shimmer 3s infinite'
        }}
      />

      <style>{`
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        /* Animations de slide depuis l'extrême droite */
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0.8;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-out-to-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0.8;
          }
        }

        .animate-in.slide-in-from-right {
          animation: slide-in-from-right 0.5s ease-out forwards;
        }

        .animate-out.slide-out-to-right {
          animation: slide-out-to-right 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
};