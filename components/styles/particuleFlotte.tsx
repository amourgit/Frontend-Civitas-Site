
import { useMemo } from "react";

// Composant réutilisable pour les particules flottantes
export const FloatingParticles = ({ count = 3, color = "white" }) => {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: i * 0.8,
      duration: 4 + Math.random() * 2
    })), 
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full opacity-30 animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
};