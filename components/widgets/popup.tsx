import { useState, useEffect, useRef } from "react";
import ModuleCard3D from "../cards/moduls-cards";

const ModulesPopup = ({
  modules = [],
  isOpen,
  onClose,
  onModuleSelect
}: {
  modules?: any[];
  isOpen: boolean;
  onClose?: () => void;
  onModuleSelect?: (module: any) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);

  // Modules par défaut
  const defaultModules = [
    {
      id: 1,
      name: "Gestion Caisse",
      description: "Module de gestion de caisse et transactions",
      icon: "💰",
      link: "/caisse",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 2,
      name: "Inventaire",
      description: "Gestion des stocks et inventaires",
      icon: "📦",
      link: "/inventaire",
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 3,
      name: "Comptabilité",
      description: "Module de comptabilité générale",
      icon: "📊",
      link: "/comptabilite",
      color: "from-purple-500 to-violet-600"
    },
    {
      id: 4,
      name: "Ressources Humaines",
      description: "Gestion du personnel et RH",
      icon: "👥",
      link: "/rh",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      name: "Ventes",
      description: "Gestion des ventes et clients",
      icon: "🛒",
      link: "/ventes",
      color: "from-teal-500 to-blue-600"
    },
    {
      id: 6,
      name: "Achats",
      description: "Gestion des achats et fournisseurs",
      icon: "🛍️",
      link: "/achats",
      color: "from-pink-500 to-rose-600"
    }
  ];

  const actualModules = modules.length > 0 ? modules : defaultModules;

  // Navigation avec les flèches du clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => 
          prev === 0 ? actualModules.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => 
          prev === actualModules.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Enter') {
        handleModuleSelect(actualModules[currentIndex]);
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, actualModules]);

  // Gestion du drag/swipe
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX || e.touches?.[0]?.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100; // Seuil de déclenchement
    
    if (dragOffset > threshold) {
      // Swipe vers la droite - module précédent
      setCurrentIndex((prev) => 
        prev === 0 ? actualModules.length - 1 : prev - 1
      );
    } else if (dragOffset < -threshold) {
      // Swipe vers la gauche - module suivant
      setCurrentIndex((prev) => 
        prev === actualModules.length - 1 ? 0 : prev + 1
      );
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleModuleSelect = (module) => {
    onModuleSelect?.(module);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background transparent avec blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Container principal */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {/* Carrousel 3D */}
        <div 
          className={`relative flex items-center justify-center transition-transform duration-500 ease-out ${
            isDragging ? '' : 'transform-gpu'
          }`}
          style={{
            transform: `translateX(${dragOffset}px)`,
            perspective: '1200px'
          }}
        >
          {actualModules.map((module, index) => {
            const distance = index - currentIndex;
            const isActive = index === currentIndex;
            
            // Calcul des positions 3D
            const translateX = distance * 280; // Espacement horizontal
            const translateZ = isActive ? 0 : -200; // Profondeur
            const rotateY = distance * 25; // Rotation
            const opacity = Math.abs(distance) > 2 ? 0 : 1 - Math.abs(distance) * 0.3;
            const scale = isActive ? 1 : 0.8 - Math.abs(distance) * 0.1;

            return (
              <div
                key={module.id}
                className={`absolute transition-all duration-700 ease-out ${
                  Math.abs(distance) > 2 ? 'pointer-events-none' : ''
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: isActive ? 10 : 5 - Math.abs(distance)
                }}
              >
                <ModuleCard3D
                  module={module}
                  isActive={isActive}
                  index={index}
                  onClick={handleModuleSelect}
                />
              </div>
            );
          })}
        </div>

        {/* Indicateurs de navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          {actualModules.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-white/80 text-sm">
            Glissez pour naviguer • Appuyez sur Entrée pour sélectionner
          </p>
        </div>

        {/* Navigation mobile (hidden sur desktop) */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:hidden">
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? actualModules.length - 1 : prev - 1
            )}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === actualModules.length - 1 ? 0 : prev + 1
            )}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModulesPopup;