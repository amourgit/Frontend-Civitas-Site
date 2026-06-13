import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';

const SearchPopup = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: '',
    category: '',
    status: '',
    user: ''
  });
  const [recentSearches] = useState([
    'Facture client ABC',
    'Inventaire produits',
    'Rapport mensuel',
    'Gestion stock'
  ]);
  const [suggestions] = useState([
    { type: 'client', name: 'Client ABC Corp', category: 'Clients' },
    { type: 'product', name: 'Produit XYZ-001', category: 'Inventaire' },
    { type: 'invoice', name: 'Facture FAC-2024-001', category: 'Facturation' },
    { type: 'report', name: 'Rapport de ventes Q1', category: 'Rapports' }
  ]);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Focus sur le champ de recherche quand la popup s'ouvre
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      console.log('Recherche:', query, 'Filtres:', selectedFilters);
      // Ici on implementerait la logique de recherche
    }
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
      <div className="w-full h-full bg-background flex flex-col">
        {/* Header de la popup */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Recherche avancée</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Barre de recherche principale */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher dans toute l'application..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-border rounded-xl focus:border-primary-500 focus:outline-none bg-background text-foreground placeholder-muted-foreground transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  Rechercher
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtres</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Période
                </label>
                <select
                  value={selectedFilters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
              </div>

              {/* Filtre par catégorie */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  Catégorie
                </label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Toutes</option>
                  <option value="clients">Clients</option>
                  <option value="produits">Produits</option>
                  <option value="factures">Factures</option>
                  <option value="rapports">Rapports</option>
                </select>
              </div>

              {/* Filtre par statut */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Statut
                </label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>

              {/* Filtre par utilisateur */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="w-4 h-4" />
                  Créé par
                </label>
                <select
                  value={selectedFilters.user}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Tous les utilisateurs</option>
                  <option value="me">Moi</option>
                  <option value="admin">Administrateur</option>
                  <option value="team">Équipe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section des résultats / suggestions */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recherches récentes */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Recherches récentes</h3>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="w-full text-left p-2 hover:bg-accent rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions populaires */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Suggestions populaires</h3>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(suggestion.name)}
                    className="w-full text-left p-2 hover:bg-accent rounded-lg transition-colors group"
                  >
                    <div className="text-sm text-foreground group-hover:text-foreground">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Raccourcis clavier */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Raccourcis clavier</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-muted-foreground">Enter</kbd>
                  <span className="text-muted-foreground">Rechercher</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-muted-foreground">Esc</kbd>
                  <span className="text-muted-foreground">Fermer</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-muted-foreground">↑↓</kbd>
                  <span className="text-muted-foreground">Navigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-muted-foreground">Tab</kbd>
                  <span className="text-muted-foreground">Filtres</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;