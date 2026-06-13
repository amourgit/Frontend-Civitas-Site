import React from 'react';

// Composant MemberCard
export const MemberCard = ({ member }: { member: any }) => {
    return (
      <div className="relative w-[380px] h-[520px] rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer">
        {/* Image de fond */}
        <img 
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${member.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-between p-8">
          {/* Nom en haut */}
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-membre-text bg-gradient-to-r from-purple-400 to-pink-400">
              {member.name}
            </h3>
          </div>
          
          {/* Informations en bas */}
          <div className="space-y-4">
            <h4 className="text-3xl font-bold text-white leading-tight">
              {member.title}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm font-medium">{member.type}</span>
                <span className="text-white font-semibold text-lg">{member.price}</span>
              </div>
              
              <button className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-lg transition-all group/btn border border-white/20">
                <span className="font-medium">Event Details</span>
                <svg 
                  className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};