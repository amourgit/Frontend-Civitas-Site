import React from 'react';
import AntdBreadcrumb from './antd-breadcrumb';

// Basic Demo Component
const BasicBreadcrumbDemo: React.FC = () => {
  const items = [
    {
      title: 'Home',
    },
    {
      title: <a href="">Application Center</a>,
    },
    {
      title: <a href="">Application List</a>,
    },
    {
      title: 'An Application',
    },
  ];

  return <AntdBreadcrumb items={items} />;
};

// Advanced Demo with Dropdown Menu
const AdvancedBreadcrumbDemo: React.FC = () => {
  const menuItems = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
          General
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
          Layout
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
          Navigation
        </a>
      ),
    },
  ];

  const items = [
    {
      title: 'Ant Design',
    },
    {
      title: <a href="">Component</a>,
    },
    {
      title: <a href="">General</a>,
      menu: { items: menuItems },
    },
    {
      title: 'Button',
    },
  ];

  return <AntdBreadcrumb items={items} />;
};

// Demo Page Component
const AntdBreadcrumbDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Ant Design Breadcrumb Components
        </h1>
        
        <div className="space-y-8">
          {/* Basic Example */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Basic Breadcrumb
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Simple breadcrumb with navigation links
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
              <BasicBreadcrumbDemo />
            </div>
          </div>

          {/* Advanced Example */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Advanced Breadcrumb with Dropdown Menu
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Breadcrumb with dropdown menu for additional navigation options
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
              <AdvancedBreadcrumbDemo />
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
              Usage Instructions
            </h2>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>• Import the component: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">import AntdBreadcrumb from '@/components/ui/antd-breadcrumb'</code></p>
              <p>• Pass an array of items with title, href, and optional menu properties</p>
              <p>• Use lucide-react icons for visual enhancement (automatically included)</p>
              <p>• Supports dark mode and responsive design</p>
              <p>• Dropdown menus for additional navigation options</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntdBreadcrumbDemo;
