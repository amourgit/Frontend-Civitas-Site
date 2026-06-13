import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3 } from 'lucide-react';

interface MessageStats {
  comments: number;
  reposts: number;
  likes: number;
  views: number;
}

interface ChatMessageCardProps {
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  stats: MessageStats;
  isCurrentUser?: boolean;
}

export const ChatMessageCard: React.FC<ChatMessageCardProps> = ({
  username,
  avatar,
  message,
  timestamp,
  stats,
  isCurrentUser = false,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative pt-8 pb-6">
      {/* En-tête (Header) - Position absolue en haut */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatar.startsWith('http') ? (
              <img 
                src={avatar} 
                alt={username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">{avatar}</span>
            )}
          </div>

          {/* Username et Timestamp */}
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm whitespace-nowrap">
              {username}
            </h3>
          </div>
        </div>
      </div>

      {/* Message Content - Corps principal */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-8">
        <p className="text-white/90 text-sm leading-relaxed">
          {message}
        </p>
        
        {/* Timestamp dans le message */}
        <div className="mt-4 text-right">
          <span className="text-white/40 text-xs">
            {timestamp}
          </span>
        </div>
      </div>

      {/* Footer - Stats en position absolue en bas */}
      <div className="absolute -bottom-4 left-0 right-0 flex justify-end">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
          <div className="flex items-center gap-4 text-white/60">
            {/* Comments */}
            <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group">
              <MessageCircle 
                size={14} 
                className="group-hover:scale-110 transition-transform" 
              />
              <span className="text-xs font-medium">
                {formatNumber(stats.comments)}
              </span>
            </button>

            {/* Reposts */}
            <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors group">
              <Repeat2 
                size={14} 
                className="group-hover:scale-110 transition-transform" 
              />
              <span className="text-xs font-medium">
                {formatNumber(stats.reposts)}
              </span>
            </button>

            {/* Likes */}
            <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors group">
              <Heart 
                size={14} 
                className="group-hover:scale-110 transition-transform" 
              />
              <span className="text-xs font-medium">
                {formatNumber(stats.likes)}
              </span>
            </button>

            {/* Views */}
            <button className="flex items-center gap-1.5 hover:text-purple-400 transition-colors group">
              <BarChart3 
                size={14} 
                className="group-hover:scale-110 transition-transform" 
              />
              <span className="text-xs font-medium">
                {formatNumber(stats.views)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component
export default function ChatMessageExample() {
  const exampleMessages = [
    {
      username: "Username...",
      avatar: "🔴",
      message: "You successfully read this important message.",
      timestamp: "10:30 AM",
      stats: {
        comments: 268,
        reposts: 839,
        likes: 6707,
        views: 1700000,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-12">
      <div className="space-y-16">
        {exampleMessages.map((msg, index) => (
          <ChatMessageCard
            key={index}
            username={msg.username}
            avatar={msg.avatar}
            message={msg.message}
            timestamp={msg.timestamp}
            stats={msg.stats}
          />
        ))}
      </div>
    </div>
  );
}