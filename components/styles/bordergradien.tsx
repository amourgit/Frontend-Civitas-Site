import { useMemo } from "react";

// Composant réutilisable pour les bordures dégradées
export const GradientBorder = ({ gradient, isActive }: { gradient: string; isActive: boolean }) => {
    const randomShape = useMemo(() => {
      const points = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * 360;
        const baseRadius = 45;
        const variation = 5 + Math.random() * 10;
        const radius = baseRadius + (Math.sin(angle * Math.PI / 180) * variation);
        const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
        const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
        return `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
      });
      return `polygon(${points.join(', ')})`;
    }, []);
  
    return (
      <div 
        className={`
          absolute inset-0 border border-transparent 
          bg-gradient-to-r ${gradient} 
          transition-opacity duration-300 ease-out
          ${isActive ? 'opacity-40' : 'opacity-20'}
        `}
        style={{
          membrePath: randomShape,
          borderRadius: "20px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract"
        }}
      />
    );
  };