import React from 'react';
import { MemberCard } from '../cards/membreCard';

// Composant MembersCarousel
export const MembersCarousel = ({ members }: { members: any[] }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    const membersList = Array.isArray(members) && members.length > 0 ? members : defaultMembers;
    
    const nextSlide = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % membersList.length);
      setTimeout(() => setIsAnimating(false), 500);
    };
    
    const prevSlide = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + membersList.length) % membersList.length);
      setTimeout(() => setIsAnimating(false), 500);
    };
    
    // Auto-play
    React.useEffect(() => {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      
      return () => clearInterval(interval);
    }, [currentIndex, isAnimating]);
    
    // Calculer les cartes visibles
    const getVisibleCards = () => {
      const cards = [];
      for (let i = -1; i <= 1; i++) {
        const index = (currentIndex + i + membersList.length) % membersList.length;
        cards.push({
          member: membersList[index],
          position: i,
          index: index
        });
      }
      return cards;
    };
    
    return (
      <div className="relative">
        {/* Conteneur du carrousel */}
        <div className="relative h-[520px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center">
            {getVisibleCards().map(({ member, position, index }) => (
              <div
                key={index}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${position * 420}px) scale(${position === 0 ? 1 : 0.85})`,
                  opacity: Math.abs(position) <= 1 ? 1 : 0,
                  zIndex: position === 0 ? 20 : 10 - Math.abs(position),
                  filter: position !== 0 ? 'brightness(0.6)' : 'brightness(1)'
                }}
              >
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Boutons de navigation */}
        <button
          onClick={prevSlide}
          disabled={isAnimating}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed z-30"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          disabled={isAnimating}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed z-30"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Indicateurs */}
        <div className="flex justify-center space-x-2 mt-8">
          {membersList.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };