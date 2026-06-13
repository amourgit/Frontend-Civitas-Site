
import React, { useState } from 'react';
import { ChevronRight, MoreHorizontal, Home, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  title: React.ReactNode;
  href?: string;
  menu?: {
    items: Array<{
      key: string;
      label: React.ReactNode;
    }>;
  };
}

interface AntdBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const AntdBreadcrumb: React.FC<AntdBreadcrumbProps> = ({ 
  items, 
  separator = <ChevronRight className="w-4 h-4" />,
  className 
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getIcon = (title: React.ReactNode) => {
    if (typeof title === 'string') {
      switch (title.toLowerCase()) {
        case 'home':
          return <Home className="w-4 h-4" />;
        case 'application center':
        case 'application list':
        case 'component':
          return <FileText className="w-4 h-4" />;
        case 'settings':
          return <Settings className="w-4 h-4" />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center space-x-1", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const hasMenu = item.menu?.items && item.menu.items.length > 0;
        const icon = getIcon(item.title);

        return (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div className="relative group">
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors",
                      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      isLast 
                        ? "text-gray-900 dark:text-gray-100 font-medium cursor-default" 
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {icon}
                    <span>{item.title}</span>
                    {hasMenu && (
                      <MoreHorizontal className="w-3 h-3 ml-1 opacity-60" />
                    )}
                  </a>
                ) : (
                  <span
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-md text-sm",
                      isLast 
                        ? "text-gray-900 dark:text-gray-100 font-medium" 
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {icon}
                    <span>{item.title}</span>
                    {hasMenu && (
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `dropdown-${index}` ? null : `dropdown-${index}`)}
                        className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreHorizontal className="w-3 h-3 opacity-60" />
                      </button>
                    )}
                  </span>
                )}

                {/* Dropdown Menu */}
                {hasMenu && openDropdown === `dropdown-${index}` && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                    {item.menu?.items.map((menuitem) => (
                      <a
                        key={menuitem.key}
                        href="#"
                        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDropdown(null);
                        }}
                      >
                        {menuitem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <span className="text-gray-400 dark:text-gray-600 mx-1">
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default AntdBreadcrumb;
