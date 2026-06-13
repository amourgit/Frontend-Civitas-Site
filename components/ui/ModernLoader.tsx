// components/ui/ModernLoader.tsx
import React from 'react';

interface ModernLoaderProps {
  message?: string;
  subMessage?: string;
}

export const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  message = "Chargement du projet...",
  subMessage = "Préparation des détails"
}) => {
  return (
    <div className="absolute inset-0 z-50 backdrop-blur-xl bg-black/20 flex items-center justify-center">
      <div className="relative">
        {/* Cercles animés */}
        <div className="flex items-center justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
        
        {/* Texte de chargement */}
        <div className="mt-4 text-center">
          <div className="text-white/90 text-sm font-medium">{message}</div>
          <div className="text-white/60 text-xs mt-1">{subMessage}</div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{
              animation: 'loading-progress 3s ease-in-out forwards'
            }} 
          />
        </div>
      </div>
      
      <style>{`
        @keyframes loading-progress {
          0% { width: 0% }
          50% { width: 60% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
};