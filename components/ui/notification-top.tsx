import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Link, 
  Search, 
  Heart, 
  Plus, 
  Share, 
  X, 
  Settings,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Mic2,
  Volume2
} from 'lucide-react';

interface SpotifyNotification {
  id: string;
  type: 'song' | 'playlist' | 'album' | 'artist';
  title: string;
  subtitle?: string;
  image?: string;
  time?: string;
  isPlaying?: boolean;
  duration?: string;
  currentTime?: string;
  artist?: string;
  album?: string;
  year?: string;
}

interface SpotifyNotificationBarProps {
  notifications?: SpotifyNotification[];
  currentPlaying?: SpotifyNotification;
  onNotificationClick?: (notification: SpotifyNotification) => void;
}

const SpotifyNotificationBar: React.FC<SpotifyNotificationBarProps> = ({
  notifications = [],
  currentPlaying,
  onNotificationClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(currentPlaying?.isPlaying || false);
  const barRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  // Fermer quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded && !isClosing &&
        expandedRef.current &&
        !expandedRef.current.contains(event.target as Node) &&
        barRef.current &&
        !barRef.current.contains(event.target as Node)
      ) {
        closeBar();
      }
    };

    // Petit délai pour éviter la fermeture immédiate après l'ouverture
    if (isExpanded && !isClosing) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, isClosing]);

  // Gestion simplifiée : clic direct + drag optionnel
  const [startTime, setStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setStartTime(Date.now());
    setHasMoved(false);
  };

  const handleMove = (clientY: number) => {
    if (isDragging) {
      const deltaY = clientY - dragStartY;
      
      // Marquer qu'il y a eu mouvement si on a bougé de plus de 5px
      if (Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }
      
      // Ouvrir si on glisse vers le bas de plus de 20px
      if (deltaY > 20) {
        setIsExpanded(true);
        setIsDragging(false);
        setHasMoved(false);
      }
    }
  };

  const handleEnd = () => {
    if (isDragging) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Si c'était un clic rapide sans mouvement (moins de 300ms et pas de mouvement significatif)
      if (duration < 300 && !hasMoved) {
        setIsExpanded(true);
      }
      
      setIsDragging(false);
      setHasMoved(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.touches[0].clientY);
  };

  // Gérer le drag au niveau du document
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0].clientY);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, startTime, hasMoved]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Fonction pour fermer avec animation
  const closeBar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 600); // Durée de l'animation de fermeture
  };

  // Barre minimale (état initial)
  const MinimalBar = () => (
    <div
      ref={barRef}
      className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/5 h-8 bg-black z-50 flex items-center justify-end px-4 cursor-pointer select-none rounded-b-2xl"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'pointer',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Logo Spotify */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <div className="text-black text-xs font-bold">♪</div>
        </div>
      </div>
    </div>
  );

  // Barre étendue (état actif)
  const ExpandedBar = () => (
    <div
      ref={expandedRef}
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 bg-transparent backdrop-blur-xl text-white z-50 rounded-b-3xl shadow-2xl transition-all duration-500 ease-out ${
        isClosing
          ? 'w-2/5 opacity-0 animate-contract-bounce'
          : 'w-4/5 opacity-100 animate-expand-bounce'
      }`}
      style={{
        animation: isClosing ? 'contractBounce 0.6s ease-out' : 'expandBounce 0.6s ease-out'
      }}
    >
      {/* Header avec icônes */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <Menu className="w-5 h-5 text-gray-400" />
          <Link className="w-5 h-5 text-gray-400" />
          <Search className="w-5 h-5 text-gray-400" />
          <Heart className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4">
          <Plus className="w-5 h-5 text-gray-400" />
          <Share className="w-5 h-5 text-gray-400" />
          <X className="w-5 h-5 text-gray-400" onClick={closeBar} />
          <button className="border border-green-500 text-green-500 px-3 py-1 rounded-full text-sm">
            Settings
          </button>
        </div>
      </div>

      {/* Lecteur principal */}
      {currentPlaying && (
        <div className="p-6">
          <div className="flex items-center space-x-6">
            {/* Album art */}
            <div className="relative">
              <img 
                src={currentPlaying.image || '/api/placeholder/120/120'} 
                alt={currentPlaying.title}
                className="w-20 h-20 rounded-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="text-black text-xs font-bold">♪</div>
              </div>
            </div>

            {/* Info de la chanson */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{currentPlaying.title}</h2>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-black" />
                </div>
              </div>
              
              <p className="text-green-500 text-sm mb-1">
                Album: {currentPlaying.album || 'Live at Pompeii'}
              </p>
              
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <img 
                  src="/api/placeholder/24/24" 
                  alt={currentPlaying.artist}
                  className="w-6 h-6 rounded-full"
                />
                <span>{currentPlaying.artist || 'David Gilmour'}</span>
                <span>•</span>
                <span>{currentPlaying.year || '2017'}</span>
              </div>
            </div>

            {/* Contrôles de lecture */}
            <div className="flex items-center space-x-4">
              <Shuffle className="w-5 h-5 text-gray-400" />
              <SkipBack className="w-6 h-6 text-gray-400" />
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-black" />
                ) : (
                  <Play className="w-6 h-6 text-black ml-1" />
                )}
              </button>
              <SkipForward className="w-6 h-6 text-gray-400" />
              <Repeat className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-6 flex items-center space-x-4 text-sm text-gray-400">
            <span>{currentPlaying.currentTime || '0:32'}</span>
            <div className="flex-1 relative">
              <div className="h-1 bg-gray-700 rounded-full">
                <div className="h-1 bg-green-500 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
            <span>-{currentPlaying.duration || '8:59'}</span>
            <Mic2 className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            <div className="w-20 h-1 bg-gray-700 rounded-full">
              <div className="h-1 bg-white rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      {notifications.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick?.(notification)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
              >
                <img 
                  src={notification.image || '/api/placeholder/48/48'} 
                  alt={notification.title}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-white">{notification.title}</h4>
                  {notification.subtitle && (
                    <p className="text-sm text-gray-400">{notification.subtitle}</p>
                  )}
                  {notification.artist && (
                    <p className="text-xs text-gray-500">{notification.artist}</p>
                  )}
                </div>
                {notification.time && (
                  <span className="text-xs text-gray-500">{notification.time}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes expandBounce {
          0% {
            width: 20%;
            transform: translateX(-50%) translateY(-20px) scale(0.98);
            opacity: 0.8;
          }
          30% {
            width: 45%;
            transform: translateX(-50%) translateY(15px) scale(1.02);
            opacity: 0.9;
          }
          60% {
            width: 75%;
            transform: translateX(-50%) translateY(-5px) scale(1.01);
            opacity: 1;
          }
          100% {
            width: 80%;
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes contractBounce {
          0% {
            width: 80%;
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
          25% {
            width: 75%;
            transform: translateX(-50%) translateY(-8px) scale(0.98);
            opacity: 0.9;
          }
          50% {
            width: 60%;
            transform: translateX(-50%) translateY(5px) scale(1.01);
            opacity: 0.7;
          }
          75% {
            width: 45%;
            transform: translateX(-50%) translateY(-3px) scale(0.99);
            opacity: 0.4;
          }
          100% {
            width: 20%;
            transform: translateX(-50%) translateY(-10px) scale(0.95);
            opacity: 0;
          }
        }
      `}</style>
      {(isExpanded || isClosing) ? <ExpandedBar /> : <MinimalBar />}
      
      {/* Overlay pour fermer en cliquant ailleurs */}
      {(isExpanded || isClosing) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={closeBar}
        />
      )}
    </div>
  );
};


export default SpotifyNotificationBar;