import React from 'react';
import { EventCard } from '../cards/eventCard';

// Composant EventsSection
export const EventsSection = ({ events }: { events: any[] }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>(['All']);
  const [isSearching, setIsSearching] = React.useState(false);
  const [visibleItems, setVisibleItems] = React.useState<number[]>([]);
  const [isSticky, setIsSticky] = React.useState(false);
  const searchFilterRef = React.useRef<HTMLDivElement>(null);
  
  const eventsList = Array.isArray(events) && events.length > 0 ? events : defaultEvents;
  
  const filters = ['All', 'Cook Studio', 'UX', 'Case Study', 'Music', 'Bnagla Lofi', 'Tour', 'Saintmartin', 'Tech', 'iPhone 13', 'User Interface Design', 'Computer Program'];
  
  // Gestion du filtre multiple
  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      setSelectedFilters(prev => {
        const withoutAll = prev.filter(f => f !== 'All');
        if (withoutAll.includes(filter)) {
          const newFilters = withoutAll.filter(f => f !== filter);
          return newFilters.length === 0 ? ['All'] : newFilters;
        } else {
          return [...withoutAll, filter];
        }
      });
    }
  };
  
  const filteredEvents = eventsList.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.channelName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilters.includes('All') || 
                         selectedFilters.some(f => event.category === f);
    return matchesSearch && matchesFilter;
  });
  
  // Gestion du sticky
  React.useEffect(() => {
    const handleScroll = () => {
      if (searchFilterRef.current) {
        const rect = searchFilterRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 10);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animation au scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.event-card');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [filteredEvents]);
  
  // Animation à la recherche
  React.useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      setVisibleItems([]);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);
  
  // Animation au filtre
  React.useEffect(() => {
    setVisibleItems([]);
  }, [selectedFilters]);
  
  return (
    <section className="py-3 relative">
      {/* Recherche et Filtres - Sticky */}
      <div 
        ref={searchFilterRef}
        className={`transition-all duration-300 sticky top-0 left-0 right-0 z-50 shadow-lg`}
      >
        {/* Recherche */}
        <div className="px-[1%] py-2 flex justify-center w-full">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent backdrop-blur-xl text-white/90 px-6 py-3 rounded-full text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all border border-white/10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-all bg-white/10">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filtres */}
        <div className="px-[1%] pb-2">
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
            {filters.map((filter, index) => {
              const isActive = selectedFilters.includes(filter);
              return (
                <button
                  key={index}
                  onClick={() => toggleFilter(filter)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    isActive
                      ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-transparent backdrop-blur-xl text-white/80 border-transparent hover:border-gray-500'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      
      {/* Liste des événements */}
      <div className="px-[1%] mt-2 flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-full scrollbar-hide">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              data-index={index}
              className={`event-card transition-all duration-500  ${
                visibleItems.includes(index) || !isSearching
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};