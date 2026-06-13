import React, { useState } from 'react';
import { Section } from './Section';
import { ChevronRight, Filter, Grid, List, Search } from 'lucide-react';

// ============================================
// EXEMPLE 1: Section Brands (ton exemple initial)
// ============================================

interface Brand {
  id: number;
  name: string;
  logo: string;
  category: string;
}

const BRANDS: Brand[] = [
  { id: 1, name: 'TechGear', logo: 'TG', category: 'Électronique' },
  { id: 2, name: 'StyleMax', logo: 'SM', category: 'Mode' },
  { id: 3, name: 'FitLife', logo: 'FL', category: 'Sport' },
  { id: 4, name: 'LuxeTime', logo: 'LT', category: 'Accessoires' },
];

const CATEGORIES = ['Tous', 'Électronique', 'Mode', 'Sport', 'Accessoires'];

export const BrandsSectionExample = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBrands = selectedCategory === 'Tous'
    ? BRANDS
    : BRANDS.filter((b) => b.category === selectedCategory);

  return (
    <Section maxWidth="7xl" py="xl" background="linear-gradient(to bottom, #0f172a, #1e1b4b)">
      {/* HEADER */}
      <Section.Header justify="between" align="start" pb="lg" border={true}>
        <div>
          <Section.Title size="2xl" gradient>
            Nos marques préférées
          </Section.Title>
          <Section.Description mt="xs">
            Les marques que vous adorez, toutes réunies ici.
          </Section.Description>
        </div>

        <Section.Actions gap="sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white/20' : 'bg-white/5'} hover:bg-white/10 transition-colors`}
          >
            <Grid size={18} className="text-white" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white/20' : 'bg-white/5'} hover:bg-white/10 transition-colors`}
          >
            <List size={18} className="text-white" />
          </button>
        </Section.Actions>
      </Section.Header>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-white text-gray-900'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* BODY */}
      <Section.Body
        layout="grid"
        gridCols={viewMode === 'grid' ? 2 : 1}
        gridColsMd={viewMode === 'grid' ? 3 : 1}
        gridColsLg={viewMode === 'grid' ? 4 : 1}
        gap="md"
      >
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-gradient-to-br from-indigo-900/40 to-gray-900 p-6 rounded-lg border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
          >
            <div className="text-3xl font-black text-white/80 mb-2">{brand.logo}</div>
            <h3 className="text-white font-semibold">{brand.name}</h3>
            <p className="text-white/50 text-sm">{brand.category}</p>
          </div>
        ))}
      </Section.Body>

      {/* FOOTER */}
      <Section.Footer justify="center" pt="lg">
        <button className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-2 transition-colors">
          Voir toutes les marques
          <ChevronRight size={16} />
        </button>
      </Section.Footer>
    </Section>
  );
};

// ============================================
// EXEMPLE 2: Section Produits avec Search
// ============================================

export const ProductsSectionExample = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Section maxWidth="7xl" py="xl" background="transparent">
      <Section.Header direction="col" align="start" gap="lg">
        <div className="w-full flex justify-between items-start">
          <div>
            <Section.Title as="h2" size="3xl" weight="black">
              Produits populaires
            </Section.Title>
            <Section.Description size="base">
              Découvrez notre sélection de produits tendance
            </Section.Description>
          </div>

          <Section.Actions>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors">
              Ajouter un produit
            </button>
          </Section.Actions>
        </div>

        {/* Search Bar */}
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </Section.Header>

      <Section.Body layout="grid" gridCols={1} gridColsMd={2} gridColsLg={3} gap="lg">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-indigo-500/30 transition-all">
            <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg mb-3" />
            <h3 className="text-white font-semibold mb-1">Produit {i}</h3>
            <p className="text-white/50 text-sm mb-3">Description du produit</p>
            <div className="flex justify-between items-center">
              <span className="text-indigo-400 font-bold">299.99 €</span>
              <button className="text-sm text-white/70 hover:text-white">Voir détails</button>
            </div>
          </div>
        ))}
      </Section.Body>
    </Section>
  );
};

// ============================================
// EXEMPLE 3: Section Stats (Layout Flex)
// ============================================

export const StatsSectionExample = () => {
  const stats = [
    { label: 'Utilisateurs actifs', value: '12,543', icon: '👥' },
    { label: 'Ventes totales', value: '€ 2.4M', icon: '💰' },
    { label: 'Produits', value: '1,234', icon: '📦' },
    { label: 'Satisfaction', value: '98%', icon: '⭐' },
  ];

  return (
    <Section maxWidth="7xl" py="2xl" background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
      <Section.Header justify="center" border={false}>
        <Section.Title size="3xl" weight="black" color="text-white">
          Nos performances en chiffres
        </Section.Title>
      </Section.Header>

      <Section.Body
        layout="flex"
        direction="row"
        gap="lg"
        justifyContent="around"
        alignItems="stretch"
        className="flex-wrap"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex-1 min-w-[200px] bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center"
          >
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-white/70 text-sm">{stat.label}</div>
          </div>
        ))}
      </Section.Body>
    </Section>
  );
};

// ============================================
// EXEMPLE 4: Section Newsletter (Stack Layout)
// ============================================

export const NewsletterSectionExample = () => {
  return (
    <Section maxWidth="2xl" py="xl" background="transparent">
      <Section.Body layout="stack" gap="lg" className="text-center">
        <Section.Title as="h2" size="3xl" weight="extrabold" gradient>
          Restez informé
        </Section.Title>
        
        <Section.Description size="base" color="text-white/70">
          Inscrivez-vous à notre newsletter pour recevoir les dernières nouveautés et offres exclusives.
        </Section.Description>

        <div className="flex gap-2 max-w-md mx-auto w-full">
          <input
            type="email"
            placeholder="votre@email.com"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50"
          />
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            S'abonner
          </button>
        </div>

        <p className="text-white/40 text-xs">
          En vous inscrivant, vous acceptez nos conditions d'utilisation
        </p>
      </Section.Body>
    </Section>
  );
};

// ============================================
// EXEMPLE 5: Section Complexe avec Tabs
// ============================================

export const TabsSectionExample = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Section maxWidth="7xl" py="xl" background="transparent">
      <Section.Header justify="between" align="center">
        <Section.Title size="2xl">Tableau de bord</Section.Title>
        
        <Section.Actions gap="xs">
          {['overview', 'analytics', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </Section.Actions>
      </Section.Header>

      <Section.Body layout="grid" gridCols={1} gap="md">
        {activeTab === 'overview' && (
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-2">Vue d'ensemble</h3>
            <p className="text-white/60">Contenu de la vue d'ensemble...</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-2">Analytiques</h3>
            <p className="text-white/60">Contenu des analytiques...</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-2">Rapports</h3>
            <p className="text-white/60">Contenu des rapports...</p>
          </div>
        )}
      </Section.Body>

      <Section.Footer justify="end">
        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          Exporter les données
        </button>
      </Section.Footer>
    </Section>
  );
};