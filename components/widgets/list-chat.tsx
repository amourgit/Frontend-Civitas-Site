import React, { useState } from 'react';
import { Search, MoreHorizontal, Video, Edit, Heart, ThumbsUp, Monitor } from 'lucide-react';

interface ChatItem {
  id: string;
  name: string;
  message?: string;
  time?: string;
  avatar?: string;
  isGroup?: boolean;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbs';
  isHighlighted?: boolean;
  hasAttachment?: boolean;
  hasNotification?: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

interface ChatMessengerInterfaceProps {
  title?: string;
  searchPlaceholder?: string;
  chats?: ChatItem[];
  activeTab?: 'inbox' | 'communities';
  onTabChange?: (tab: 'inbox' | 'communities') => void;
  onChatClick?: (chat: ChatItem) => void;
  onSearchChange?: (value: string) => void;
}

const ChatMessengerInterface: React.FC<ChatMessengerInterfaceProps> = ({
  title = "Chats",
  searchPlaceholder = "Search Messenger",
  chats = [],
  activeTab = 'inbox',
  onTabChange,
  onChatClick,
  onSearchChange
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />;
      case 'thumbs':
        return <ThumbsUp className="w-4 h-4 text-blue-500" fill="currentColor" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className="text-2rem font-bold text-gray-900">{title}</h1>
        
        <div className="flex items-center space-x-2">
          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
            <Video className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-1rem"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex space-x-1">
          <button
            onClick={() => onTabChange?.('inbox')}
            className={`px-4 py-2 rounded-full text-0.875rem font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => onTabChange?.('communities')}
            className={`px-4 py-2 rounded-full text-0.875rem font-medium transition-colors ${
              activeTab === 'communities'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Communities
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="pb-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                if (chat.onClick) chat.onClick();
                if (onChatClick) onChatClick(chat);
              }}
              className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                chat.isHighlighted ? 'bg-blue-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {chat.avatar ? (
                  <img 
                    src={chat.avatar} 
                    alt={chat.name} 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">
                      {chat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Notification dot */}
                {chat.hasNotification && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-1rem">
                    {chat.name}
                  </h3>
                  {chat.time && (
                    <span className="text-0.75rem text-gray-500 flex-shrink-0 ml-2">
                      {chat.time}
                    </span>
                  )}
                </div>

                {/* Message with reaction */}
                {chat.message && (
                  <div className="flex items-center space-x-2">
                    {chat.hasReaction && chat.reactionType && (
                      <div className="flex-shrink-0">
                        {getReactionIcon(chat.reactionType)}
                      </div>
                    )}
                    <p className="text-0.875rem text-gray-600 truncate">
                      {chat.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Unread count or notification indicator */}
              {chat.unreadCount && chat.unreadCount > 0 && (
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-0.75rem font-bold">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </span>
                </div>
              )}

              {chat.hasNotification && !chat.unreadCount && (
                <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No chats available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Monitor className="w-5 h-5" />
          <span className="text-0.875rem font-medium">Try Messenger for Mac</span>
        </div>
      </div>
    </div>
  );
};

// Exemple d'utilisation avec des données complètes
const ExampleUsage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'communities'>('inbox');

  const chatData: ChatItem[] = [
    {
      id: '1',
      name: 'Adam West',
      time: '4d',
      avatar: '/api/placeholder/56/56',
      hasReaction: true,
      reactionType: 'heart'
    },
    {
      id: '2',
      name: 'Brian Griffin',
      message: 'Yay, this will be the best time of...',
      time: '1w',
      avatar: '/api/placeholder/56/56'
    },
    {
      id: '3',
      name: 'Marketplace',
      time: '3w',
      avatar: '/api/placeholder/56/56'
    },
    {
      id: '4',
      name: 'Lois Griffin',
      message: 'Reacted 👍 to your message',
      time: '5w',
      avatar: '/api/placeholder/56/56',
      hasReaction: true,
      reactionType: 'thumbs',
      isHighlighted: true
    },
    {
      id: '5',
      name: 'Joe Swanson',
      message: 'Scott sent an attachment.',
      time: '6w',
      avatar: '/api/placeholder/56/56',
      hasAttachment: true
    },
    {
      id: '6',
      name: 'Meg Griffin',
      message: 'You: Hey! Would Wynn like to co...',
      time: '8w',
      avatar: '/api/placeholder/56/56',
      hasNotification: true
    },
    {
      id: '7',
      name: 'Neil, Quagmire, Stewie, Brian, Meg',
      message: 'Jen: Gosh she looks so much lik...',
      time: '8w',
      avatar: '/api/placeholder/56/56',
      isGroup: true
    },
    {
      id: '8',
      name: 'Herbert',
      message: 'bye',
      time: '12w',
      avatar: '/api/placeholder/56/56'
    }
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <ChatMessengerInterface 
        chats={chatData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChatClick={(chat) => {
          console.log('Chat clicked:', chat.name);
        }}
        onSearchChange={(value) => {
          console.log('Search:', value);
        }}
      />
    </div>
  );
};

export default ChatMessengerInterface;