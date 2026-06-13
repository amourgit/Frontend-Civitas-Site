import React, { useState, useMemo, useCallback, memo } from 'react';
import { 
  Home, 
  FileText, 
  Mail, 
  Users, 
  Bell, 
  Users2, 
  FileEdit, 
  Gamepad2, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MenuItem {
  id: string;
  title: string;
  icon: 'home' | 'post' | 'messages' | 'friends' | 'notifications' | 'group' | 'pages' | 'games' | 'settings' | 'logout';
  link?: string;
  description?: string;
  notificationCount?: number;
  items?: MenuItem[];
}

interface FacenoteGlassSidebarProps {
  title?: string;
  userDisplayName?: string;
  userSubtitle?: string;
  userAvatar?: string;
  menuItems?: MenuItem[];
  onMenuItemClick?: (item: MenuItem) => void;
}

// Memoized Icon component to prevent unnecessary re-renders
const IconComponent = memo(({ iconType, className = "w-5 h-5" }: { iconType: string; className?: string }) => {
  switch (iconType) {
    case 'home':
      return <Home className={className} />;
    case 'post':
      return <FileText className={className} />;
    case 'messages':
      return <Mail className={className} />;
    case 'friends':
      return <Users className={className} />;
    case 'notifications':
      return <Bell className={className} />;
    case 'group':
      return <Users2 className={className} />;
    case 'pages':
      return <FileEdit className={className} />;
    case 'games':
      return <Gamepad2 className={className} />;
    case 'settings':
      return <Settings className={className} />;
    case 'logout':
      return <LogOut className={className} />;
    default:
      return <Home className={className} />;
  }
});

IconComponent.displayName = 'IconComponent';

// Memoized menu item content to prevent re-renders
const MenuItemContent = memo(({ 
  item, 
  level, 
  isExpanded, 
  hasChildren, 
  onToggleExpanded, 
  onMenuItemClick 
}: {
  item: MenuItem;
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpanded: () => void;
  onMenuItemClick?: (item: MenuItem) => void;
}) => {
  const paddingLeft = level * 24;
  
  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggleExpanded();
    }
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
  }, [hasChildren, onToggleExpanded, onMenuItemClick, item]);

  return (
    <div 
      className="group flex items-center justify-between p-3 hover:bg-white/10 transition-colors duration-150 cursor-pointer w-full will-change-auto"
      style={{ paddingLeft: `${16 + paddingLeft}px` }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 text-white/90 group-hover:text-white transition-colors duration-150">
          <IconComponent iconType={item.icon} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium text-sm truncate">
              {item.title}
            </span>
            {item.notificationCount && item.notificationCount > 0 && (
              <span className="bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.25rem] text-center backdrop-blur-sm">
                {item.notificationCount > 99 ? '99+' : item.notificationCount}
              </span>
            )}
          </div>
          
          {item.description && (
            <p className="text-white/70 text-xs mt-0.5 truncate">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className={`text-white/60 transition-transform duration-200 ease-out ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
});

MenuItemContent.displayName = 'MenuItemContent';

// Memoized menu item component
const MenuItem = memo(({ 
  item, 
  level, 
  expandedItems, 
  onToggleExpanded, 
  onMenuItemClick 
}: {
  item: MenuItem;
  level: number;
  expandedItems: Set<string>;
  onToggleExpanded: (itemId: string) => void;
  onMenuItemClick?: (item: MenuItem) => void;
}) => {
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = Boolean(item.items && item.items.length > 0);
  
  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded(item.id);
  }, [item.id, onToggleExpanded]);

  const content = (
    <MenuItemContent
      item={item}
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggleExpanded={handleToggleExpanded}
      onMenuItemClick={onMenuItemClick}
    />
  );

  return (
    <div className="w-full">
      {item.link && !hasChildren ? (
        <Link href={item.link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}

      {hasChildren && (
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-black/5 backdrop-blur-sm">
            {item.items!.map((subItem) => (
              <MenuItem
                key={subItem.id}
                item={subItem}
                level={level + 1}
                expandedItems={expandedItems}
                onToggleExpanded={onToggleExpanded}
                onMenuItemClick={onMenuItemClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

// Default menu data - memoized to prevent recreation
const defaultMenuData: MenuItem[] = [
  {
    id: 'home',
    title: 'Home',
    icon: 'home',
    link: '/home',
    description: 'Main dashboard and feed'
  },
  {
    id: 'post',
    title: 'Post',
    icon: 'post',
    description: 'Create and manage posts',
    items: [
      {
        id: 'create-post',
        title: 'Create Post',
        icon: 'post',
        link: '/post/create',
        description: 'Write a new post'
      },
      {
        id: 'drafts',
        title: 'Drafts',
        icon: 'post',
        link: '/post/drafts',
        description: 'Saved drafts',
        items: [
          {
            id: 'auto-save',
            title: 'Auto-saved',
            icon: 'post',
            link: '/post/drafts/auto'
          },
          {
            id: 'manual-save',
            title: 'Manually saved',
            icon: 'post',
            link: '/post/drafts/manual'
          }
        ]
      },
      {
        id: 'scheduled',
        title: 'Scheduled Posts',
        icon: 'post',
        link: '/post/scheduled'
      }
    ]
  },
  {
    id: 'community',
    title: 'Community',
    icon: 'messages',
    link: '/communities',
    description: 'Community and groups'
  },
  {
    id: 'friends',
    title: 'Friends',
    icon: 'friends',
    description: 'Manage your network',
    items: [
      {
        id: 'all-friends',
        title: 'All Friends',
        icon: 'friends',
        link: '/friends/all'
      },
      {
        id: 'friend-requests',
        title: 'Friend Requests',
        icon: 'friends',
        link: '/friends/requests',
        notificationCount: 5
      },
      {
        id: 'find-friends',
        title: 'Find Friends',
        icon: 'friends',
        description: 'Discover new connections',
        items: [
          {
            id: 'nearby',
            title: 'People Nearby',
            icon: 'friends',
            link: '/friends/find/nearby'
          },
          {
            id: 'suggested',
            title: 'Suggested Friends',
            icon: 'friends',
            link: '/friends/find/suggested'
          }
        ]
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    link: '/apps/community',
    notificationCount: 2,
    description: 'Recent activity'
  },
  {
    id: 'group',
    title: 'Groups',
    icon: 'group',
    description: 'Communities and groups',
    items: [
      {
        id: 'my-groups',
        title: 'My Groups',
        icon: 'group',
        link: '/groups/my'
      },
      {
        id: 'discover-groups',
        title: 'Discover Groups',
        icon: 'group',
        link: '/groups/discover'
      }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    icon: 'pages',
    link: '/pages'
  },
  {
    id: 'games',
    title: 'Games',
    icon: 'games',
    description: 'Play and discover games',
    items: [
      {
        id: 'my-games',
        title: 'My Games',
        icon: 'games',
        link: '/games/my'
      },
      {
        id: 'trending-games',
        title: 'Trending Games',
        icon: 'games',
        link: '/games/trending'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    description: 'Privacy settings',
    items: [
      {
        id: 'account',
        title: 'Account Settings',
        icon: 'settings',
        link: '/settings/account'
      },
      {
        id: 'privacy',
        title: 'Privacy',
        icon: 'settings',
        description: 'Control your privacy',
        items: [
          {
            id: 'profile-privacy',
            title: 'Profile Privacy',
            icon: 'settings',
            link: '/settings/privacy/profile'
          },
          {
            id: 'post-privacy',
            title: 'Post Privacy',
            icon: 'settings',
            link: '/settings/privacy/posts'
          }
        ]
      },
      {
        id: 'notifications-settings',
        title: 'Notifications',
        icon: 'notifications',
        link: '/settings/notifications'
      }
    ]
  },
  {
    id: 'logout',
    title: 'Log Out',
    icon: 'logout',
    link: '/logout'
  }
];

const FacenoteGlassSidebar: React.FC<FacenoteGlassSidebarProps> = ({
  title = "Menu generale",
  userDisplayName = "Samuel Kim",
  userSubtitle = "Développeur",
  userAvatar,
  menuItems = defaultMenuData,
  onMenuItemClick
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const memoizedMenuItems = useMemo(() => 
    menuItems.map((item) => (
      <MenuItem
        key={item.id}
        item={item}
        level={0}
        expandedItems={expandedItems}
        onToggleExpanded={toggleExpanded}
        onMenuItemClick={onMenuItemClick}
      />
    )), 
    [menuItems, expandedItems, toggleExpanded, onMenuItemClick]
  );

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <style>{`
        .glass-sidebar {
          contain: layout style paint;
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: scroll-position;
        }
        
        .glass-background {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(99, 102, 241, 0.1) 50%, 
            rgba(79, 70, 229, 0.1) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        .scroll-container::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .scroll-container,
          .scroll-container * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Background with optimized glass effect */}
      {/* <div className="glass-background absolute inset-0" /> */}

      {/* Main content */}
      <div className="glass-sidebar relative z-10 h-full flex flex-col text-white">
        {/* macOS window controls */}
        <div className="flex items-center space-x-2 p-4 flex-shrink-0">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>

        {/* App title */}
        <div className="px-4 pb-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-wide truncate">
            {title}
          </h1>
        </div>

        {/* Separator */}
        <div className="mx-4 h-px bg-white/20 mb-3 flex-shrink-0" />

        {/* User section */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userDisplayName} 
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-black/60 rounded-full" />
                  </div>
                  <div className="absolute top-2 left-2 w-2 h-1 bg-white/40 rounded transform -rotate-45" />
                  <div className="absolute top-3 left-3 w-2 h-1 bg-white/40 rounded transform -rotate-45" />
                  <div className="absolute top-4 left-4 w-2 h-1 bg-white/40 rounded transform -rotate-45" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-white font-semibold text-base truncate">
                  {userDisplayName}
                </h2>
                <ChevronDown className="w-4 h-4 text-white/60 flex-shrink-0" />
              </div>
              <p className="text-white/70 text-sm truncate">
                {userSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mx-4 h-px bg-white/20 mb-3 flex-shrink-0" />

        {/* Menu label */}
        <div className="px-4 mb-3 flex-shrink-0">
          <h3 className="text-white/70 font-medium text-sm tracking-wide">
            MENU
          </h3>
        </div>

        {/* Menu items with optimized scrolling */}
        <div className="scroll-container flex-1 overflow-y-auto overflow-x-hidden px-1">
          <div className="pb-4">
            {memoizedMenuItems}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FacenoteGlassSidebar);