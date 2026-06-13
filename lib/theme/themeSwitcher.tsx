// lib/theme/ThemeSwitcher.tsx


import React, { useState, useRef } from 'react';
import { useTheme } from './themeContext';
import { Theme } from './types';
import { Moon, Sun, Palette, Download, Upload, Check, ChevronDown } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
  showDarkModeToggle?: boolean;
  showThemeSelector?: boolean;
  showImportExport?: boolean;
  position?: 'dropdown' | 'inline';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showDarkModeToggle = true,
  showThemeSelector = true,
  showImportExport = true,
  position = 'dropdown'
}) => {
  const { 
    theme, 
    themeName, 
    isDark, 
    toggleDarkMode, 
    loadTheme, 
    availableThemes,
    setTheme 
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion de l'export du thème
  const handleExportTheme = () => {
    if (!theme) return;

    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${themeName || 'theme'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // Gestion de l'import du thème
  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoading(true);
        const themeData = JSON.parse(e.target?.result as string) as Theme;
        
        // Valider le thème importé
        if (!themeData.meta || !themeData.colors || !themeData.typography) {
          throw new Error('Invalid theme file structure');
        }

        await setTheme(themeData, 'custom');
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Erreur lors de l\'import du thème. Vérifiez que le fichier est valide.');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsText(file);
  };

  // Changement de thème prédéfini
  const handleThemeChange = async (newThemeName: string) => {
    if (newThemeName === themeName) return;
    
    try {
      setIsLoading(true);
      await loadTheme(newThemeName);
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (position === 'inline') {
    return (
      <div className={`theme-switcher-inline flex items-center gap-2 ${className}`}>
        {showDarkModeToggle && (
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        {showThemeSelector && availableThemes.length > 1 && (
          <select
            value={themeName}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleThemeChange(e.target.value)}
            className="px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-sm"
            disabled={isLoading}
          >
            {availableThemes.map((name) => (
              <option key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
        )}

        {showImportExport && (
          <div className="flex gap-1">
            <button
              onClick={handleExportTheme}
              className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Exporter le thème"
            >
              <Download size={16} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Importer un thème"
              disabled={isLoading}
            >
              <Upload size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Mode dropdown
  return (
    <div className={`theme-switcher-dropdown relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Palette size={16} />
        <span className="text-sm">Thème</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Contenu du dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20 py-2">
            
            {/* Mode sombre */}
            {showDarkModeToggle && (
              <div className="px-3 py-2 border-b">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                >
                  <div className="flex items-center gap-2">
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
                  </div>
                  {isDark && <Check size={14} />}
                </button>
              </div>
            )}

            {/* Sélecteur de thème */}
            {showThemeSelector && availableThemes.length > 1 && (
              <div className="px-3 py-2 border-b">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                  Thèmes disponibles
                </div>
                {availableThemes.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      handleThemeChange(name);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    disabled={isLoading}
                  >
                    <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    {themeName === name && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}

            {/* Import/Export */}
            {showImportExport && (
              <div className="px-3 py-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                  Actions
                </div>
                
                <button
                  onClick={handleExportTheme}
                  className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                >
                  <Download size={16} />
                  <span>Exporter le thème</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportTheme}
                  className="hidden"
                />

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                  disabled={isLoading}
                >
                  <Upload size={16} />
                  <span>Importer un thème</span>
                </button>
              </div>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="px-3 py-2 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="animate-spin w-3 h-3 border border-gray-300 border-t-transparent rounded-full"></div>
                  <span>Chargement...</span>
                </div>
              </div>
            )}

            {/* Info du thème actuel */}
            {theme && (
              <div className="px-3 py-2 border-t text-xs text-gray-500 dark:text-gray-400">
                <div>Thème: {theme.meta.name}</div>
                <div>Version: {theme.meta.version}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Composant simplifié pour juste le toggle dark/light
export const DarkModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// Composant pour preview des couleurs
export const ThemeColorPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useTheme();

  if (!theme) return null;

  return (
    <div className={`theme-color-preview grid grid-cols-8 gap-1 ${className}`}>
      {/* Primary colors */}
      {Object.entries(theme.colors.primary).map(([shade, color]) => (
        <div
          key={`primary-${shade}`}
          className="w-8 h-8 rounded border"
          style={{ backgroundColor: color }}
          title={`Primary ${shade}: ${color}`}
        />
      ))}
    </div>
  );
};