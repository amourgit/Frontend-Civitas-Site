import React, { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Video, 
  Lock, 
  Users, 
  Calendar,
  Mail,
  Zap,
  ChevronRight,
  ChevronLeft,
  User
} from 'lucide-react';

interface RightbarProps {
  className?: string;
}

const Rightbar: React.FC<RightbarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Bell, label: 'Notifications', color: 'text-orange-400', active: false },
    { icon: User, label: 'Profil', color: 'text-gray-400', active: false },
    { icon: Phone, label: 'Téléphone', color: 'text-green-500', active: false },
    { icon: Video, label: 'Vidéo', color: 'text-blue-500', active: false },
    { icon: MessageSquare, label: 'Messages', color: 'text-blue-400', active: true },
    { icon: Lock, label: 'Sécurité', color: 'text-teal-500', active: false },
    { icon: Lock, label: 'Verrouillage', color: 'text-teal-400', active: false },
    { icon: User, label: 'Contact', color: 'text-purple-400', active: false },
    { icon: Users, label: 'Équipe', color: 'text-blue-500', active: false },
    { icon: MessageSquare, label: 'Chat', color: 'text-cyan-400', active: false },
    { icon: Calendar, label: 'Calendrier', color: 'text-blue-400', active: false },
    { icon: Users, label: 'Groupe', color: 'text-green-400', active: false },
    { icon: Mail, label: 'Email', color: 'text-red-400', active: false },
    { icon: Zap, label: 'Actions', color: 'text-yellow-400', active: false },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 right-2 bg-transparent text-white p-2 rounded-l-lg z-50 transition-all duration-300 shadow-lg"
      >
        {isOpen ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
            <rect y="2" width="20" height="2" />
            <rect y="9" width="20" height="2" />
            <rect y="16" width="20" height="2" />
          </svg>
        )}
      </button>

      {/* Rightbar */}
      <div
        className={`fixed top-20 right-0 bottom-0 bg-transparent shadow-2xl z-40 transition-all duration-300 ease-in-out overflow-hidden ${className}`}
        style={{ 
          width: isOpen ? '240px' : '0px',
          opacity: isOpen ? 1 : 0,
          // backdropFilter: isOpen ? 'blur(100px)' : 'blur(0px)',
        }}
      >
        <div className="h-full flex flex-col py-2">
          {menuItems.map((item, index) => (
            <div key={index} className="relative group">
              <button
                className={`w-full flex items-center gap-4 px-2 py-2 hover:bg-white/10 transition-all duration-200 ${
                  item.active ? 'bg-white/20 border-r-4 border-cyan-400' : 'border-r-4 border-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        {isOpen && (
          <div className="absolute bottom-4 left-0 right-0 px-4 transition-opacity duration-300">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-white/70 text-xs mb-2">Notifications actives</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-1">
                <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-white/60 text-xs">8 nouvelles notifications</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Rightbar;