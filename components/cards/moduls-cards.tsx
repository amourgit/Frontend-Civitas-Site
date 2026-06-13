import { useState } from "react";

const ModuleCard3D = ({
  module = {
    id: 1,
    name: "Gestion Caisse",
    description: "Module de gestion",
    image: "/api/placeholder/200/120",
    link: "/caisse",
    color: "from-blue-500 to-purple-600",
    icon: "💰"
  },
  onClick,
  isActive = false,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(module);
    } else if (module.link) {
      window.location.href = module.link;
    }
  };

  // Couleurs prédéfinies pour les modules
  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600", 
    "from-orange-500 to-red-600",
    "from-purple-500 to-pink-600",
    "from-teal-500 to-blue-600",
    "from-red-500 to-orange-600"
  ];

  const cardColor = module.color || colors[index % colors.length];

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 transform-gpu ${
        isActive ? 'scale-105 z-10' : 'scale-95 z-5'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: '1000px'
      }}
    >
      {/* Card Container */}
      <div 
        className={`relative w-64 h-80 transition-all duration-700 transform-gpu ${
          isHovered ? 'rotateY-12 rotateX-5' : ''
        } ${
          isActive ? 'rotateY-0' : 'rotateY-15'
        }`}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main Card */}
        <div className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br ${cardColor} transform-gpu transition-all duration-700`}>
          {/* Background Pattern/Texture */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col p-6">
            {/* Header avec icône */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">
                {module.icon || "📱"}
              </div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>

            {/* Image/Visual */}
            <div className="flex-1 flex items-center justify-center mb-4">
              {module.image ? (
                <img 
                  src={module.image}
                  alt={module.name}
                  className="w-full h-32 object-cover rounded-xl shadow-lg opacity-90"
                />
              ) : (
                <div className="w-full h-32 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-6xl opacity-50">{module.icon || "📱"}</span>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                {module.name}
              </h3>
              {module.description && (
                <p className="text-white/80 text-sm leading-relaxed drop-shadow">
                  {module.description}
                </p>
              )}
            </div>

            {/* Bottom indicator */}
            <div className="flex justify-center mt-4">
              <div className="w-8 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Glossy overlay effect */}
          <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-70'
          }`}></div>

          {/* Border highlight */}
          <div className="absolute inset-0 rounded-2xl border border-white/20"></div>
        </div>

        {/* Shadow/Reflection */}
        <div 
          className={`absolute -bottom-2 left-2 right-2 h-4 bg-black/20 rounded-2xl blur-xl transition-all duration-700 ${
            isHovered ? 'opacity-60 scale-110' : 'opacity-40 scale-100'
          }`}
        ></div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
        </div>
      )}
    </div>
  );
};

export default ModuleCard3D;