
import { useState } from "react";
import {
  Star,
  Zap,
  Shield,
  Eye,
  User,
  Calendar
} from "lucide-react";

interface FuturisticCardProps {
  title: string;
  content: string;
  author: string;
  timestamp: string;
  type: "announcement" | "urgent" | "premium" | "public";
  privilegeLevel: "admin" | "vip" | "member" | "guest";
}

export const FuturisticCard = ({ 
  title, 
  content, 
  author, 
  timestamp, 
  type, 
  privilegeLevel 
}: FuturisticCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Configuration des couleurs et icônes selon le type
  const typeConfig = {
    announcement: { 
      gradient: "from-blue-500/30 via-cyan-400/20 to-blue-600/30", 
      border: "border-blue-400/50",
      glow: "shadow-blue-400/25",
      icon: Star,
      label: "Annonce"
    },
    urgent: { 
      gradient: "from-red-500/30 via-orange-400/20 to-red-600/30", 
      border: "border-red-400/50",
      glow: "shadow-red-400/25",
      icon: Zap,
      label: "Urgent"
    },
    premium: { 
      gradient: "from-purple-500/30 via-pink-400/20 to-purple-600/30", 
      border: "border-purple-400/50",
      glow: "shadow-purple-400/25",
      icon: Shield,
      label: "Premium"
    },
    public: { 
      gradient: "from-green-500/30 via-emerald-400/20 to-green-600/30", 
      border: "border-green-400/50",
      glow: "shadow-green-400/25",
      icon: Eye,
      label: "Public"
    }
  };

  // Configuration des privilèges
  const privilegeConfig = {
    admin: { color: "bg-red-500", label: "ADMIN" },
    vip: { color: "bg-yellow-500", label: "VIP" },
    member: { color: "bg-blue-500", label: "MEMBRE" },
    guest: { color: "bg-gray-500", label: "INVITÉ" }
  };

  const config = typeConfig[type];
  const privilege = privilegeConfig[privilegeLevel];
  const IconComponent = config.icon;

  return (
    <div
      className="relative group cursor-pointer transition-all duration-500 ease-out transform hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        membrePath: `polygon(
          ${2 + Math.random() * 3}% ${15 + Math.random() * 10}%, 
          ${8 + Math.random() * 5}% ${Math.random() * 8}%, 
          ${88 + Math.random() * 8}% ${Math.random() * 6}%, 
          ${94 + Math.random() * 4}% ${12 + Math.random() * 8}%, 
          ${96 + Math.random() * 3}% ${75 + Math.random() * 15}%, 
          ${92 + Math.random() * 6}% ${92 + Math.random() * 6}%, 
          ${10 + Math.random() * 8}% ${94 + Math.random() * 4}%, 
          ${Math.random() * 6}% ${85 + Math.random() * 10}%
        )`,
        borderRadius: "20px"
      }}
    >
      {/* Background avec effet de verre et dégradé */}
      <div className={`
        backdrop-blur-xl bg-gradient-to-br ${config.gradient} 
        border ${config.border} border-opacity-30
        shadow-xl ${config.glow}
        p-6 h-48 relative overflow-hidden
        transition-all duration-300 ease-out
      `}>
        
        {/* Effet de particules flottantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-white/30 rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Marque de privilège */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className={`${privilege.color} px-2 py-0.5 rounded-full`}>
            <span className="text-white text-xs font-bold">{privilege.label}</span>
          </div>
        </div>

        {/* Badge de type avec icône */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <div className={`p-1.5 rounded-lg backdrop-blur-sm bg-white/20 border ${config.border}`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-white/80 font-medium">{config.label}</span>
        </div>

        {/* Contenu principal */}
        <div className="mt-12 space-y-3">
          <h3 className="text-lg font-bold text-white">
            {title}
          </h3>
          
          <p className="text-white/90 text-sm line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>

        {/* Footer avec auteur et timestamp */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-white/70" />
            <span className="text-xs text-white/70">{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-white/70" />
            <span className="text-xs text-white/70">{timestamp}</span>
          </div>
        </div>

        {/* Effet de bordure animée */}
        <div className={`
          absolute inset-0 border border-transparent opacity-20
          bg-gradient-to-r ${config.gradient} 
          transition-opacity duration-300 ease-out group-hover:opacity-40
        `} 
        style={{
          membrePath: `polygon(
            ${2 + Math.random() * 3}% ${15 + Math.random() * 10}%, 
            ${8 + Math.random() * 5}% ${Math.random() * 8}%, 
            ${88 + Math.random() * 8}% ${Math.random() * 6}%, 
            ${94 + Math.random() * 4}% ${12 + Math.random() * 8}%, 
            ${96 + Math.random() * 3}% ${75 + Math.random() * 15}%, 
            ${92 + Math.random() * 6}% ${92 + Math.random() * 6}%, 
            ${10 + Math.random() * 8}% ${94 + Math.random() * 4}%, 
            ${Math.random() * 6}% ${85 + Math.random() * 10}%
          )`,
          borderRadius: "20px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor"
        }} />

        {/* Effet de lumière subtil */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
          transform -skew-x-12 -translate-x-full group-hover:translate-x-full
          transition-transform duration-1000 ease-out
        `} />
      </div>

      {/* Ombre projetée */}
      <div className={`
        absolute -bottom-1 left-4 right-4 h-2 
        bg-gradient-to-r ${config.gradient} blur-lg opacity-20
        transition-all duration-300 ease-out
        group-hover:opacity-30
      `} 
      style={{
        membrePath: "ellipse(45% 100% at 50% 0%)",
        borderRadius: "50%"
      }} />
    </div>
  );
};

// Exemple d'utilisation avec différents types
export const FuturisticCardShowcase = () => {
  const cards = [
    {
      title: "Nouvelle Fonctionnalité IA",
      content: "Découvrez notre assistant intelligent qui révolutionne votre workflow. Une expérience utilisateur repensée avec des capacités d'automatisation avancées.",
      author: "Sarah Chen",
      timestamp: "Il y a 2h",
      type: "announcement" as const,
      privilegeLevel: "admin" as const
    },
    {
      title: "Maintenance Programmée",
      content: "Intervention critique prévue ce soir de 22h à 2h. Services temporairement indisponibles. Veuillez sauvegarder vos travaux en cours.",
      author: "Équipe Technique",
      timestamp: "Il y a 30min",
      type: "urgent" as const,
      privilegeLevel: "admin" as const
    },
    {
      title: "Fonctionnalités Premium",
      content: "Accédez aux outils avancés d'analyse et de reporting. Tableaux de bord personnalisables et exports illimités maintenant disponibles.",
      author: "Marketing Team",
      timestamp: "Hier",
      type: "premium" as const,
      privilegeLevel: "vip" as const
    },
    {
      title: "Événement Communautaire",
      content: "Rejoignez notre webinaire mensuel sur les meilleures pratiques. Échanges, démonstrations et Q&A avec notre équipe d'experts.",
      author: "Community Manager",
      timestamp: "Il y a 3 jours",
      type: "public" as const,
      privilegeLevel: "member" as const
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Publications Futuristes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {cards.map((card, index) => (
          <FuturisticCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

// Styles CSS personnalisés pour les animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
    50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}