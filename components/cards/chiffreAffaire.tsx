import React, { useState } from 'react';

const SalesHistoryChart = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [clickedPoint, setClickedPoint] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  
  // Données fictives pour la démonstration
  const currentCommunityData = [
    { year: years[0], revenue: 13000, community: 'Tech Hub', members: 450 },
    { year: years[1], revenue: 12500, community: 'Tech Hub', members: 520 },
    { year: years[2], revenue: 11000, community: 'Tech Hub', members: 680 },
    { year: years[3], revenue: 14500, community: 'Tech Hub', members: 920 },
    { year: years[4], revenue: 19000, community: 'Tech Hub', members: 1250 }
  ];
  
  // Points dispersés pour autres communautés
  const otherCommunitiesData = [
    { year: years[0], revenue: 17000, community: 'Design Collective', color: '#ff1f8f' },
    { year: years[0], revenue: 20000, community: 'Dev Network', color: '#ff1f8f' },
    { year: years[1], revenue: 19500, community: 'AI Research', color: '#8b5cf6' },
    { year: years[1], revenue: 16500, community: 'Startup Hub', color: '#8b5cf6' },
    { year: years[2], revenue: 17000, community: 'Creative Space', color: '#8b5cf6' },
    { year: years[2], revenue: 13500, community: 'Code Academy', color: '#8b5cf6' },
    { year: years[3], revenue: 18000, community: 'Innovation Lab', color: '#3b82f6' },
    { year: years[3], revenue: 16000, community: 'Makers Guild', color: '#3b82f6' },
    { year: years[4], revenue: 20000, community: 'Future Tech', color: '#00d4ff' },
    { year: years[4], revenue: 17500, community: 'Digital Arts', color: '#00d4ff' }
  ];
  
  const maxRevenue = 24000;
  const minRevenue = 8000;
  
  const getYPosition = (revenue) => {
    return 100 - ((revenue - minRevenue) / (maxRevenue - minRevenue)) * 100;
  };
  
  const getXPosition = (yearIndex) => {
    return (yearIndex / (years.length - 1)) * 100;
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const activePoint = clickedPoint || hoveredPoint;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-[15.625rem] h-[15.625rem] flex flex-col">
      <h3 className="text-white text-sm font-bold mb-3">Sales History</h3>
      
      <div className="relative flex-1">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/40 text-[0.65rem] pr-2">
          <span>≡ 24k</span>
          <span>≡ 20k</span>
          <span>≡ 16k</span>
          <span>≡ 12k</span>
          <span>≡ 8k</span>
        </div>

        {/* Chart area */}
        <div className="ml-6 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-white/5" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute bottom-0 w-full flex justify-between px-1">
            {years.map((year, i) => (
              <div key={year} className="flex flex-col items-center" style={{ width: '12%' }}>
                <div 
                  className="w-full bg-white/10 rounded-t"
                  style={{ height: `${((currentCommunityData[i].revenue - minRevenue) / (maxRevenue - minRevenue)) * 100}%` }}
                />
              </div>
            ))}
          </div>

          {/* SVG for lines and points */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Current community curve */}
            <polyline
              points={currentCommunityData.map((data, i) => 
                `${getXPosition(i)},${getYPosition(data.revenue)}`
              ).join(' ')}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff1f8f" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* Points - Current Community */}
          {currentCommunityData.map((data, i) => (
            <div
              key={`current-${i}`}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform"
              style={{
                left: `${getXPosition(i)}%`,
                top: `${getYPosition(data.revenue)}%`
              }}
              onMouseEnter={() => setHoveredPoint(data)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => setClickedPoint(clickedPoint?.year === data.year ? null : data)}
            />
          ))}

          {/* Points - Other Communities */}
          {otherCommunitiesData.map((data, i) => (
            <div
              key={`other-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform opacity-60 hover:opacity-100"
              style={{
                left: `${getXPosition(years.indexOf(data.year))}%`,
                top: `${getYPosition(data.revenue)}%`,
                backgroundColor: data.color
              }}
              onMouseEnter={() => setHoveredPoint({ ...data, isOther: true })}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => setClickedPoint(clickedPoint?.community === data.community ? null : { ...data, isOther: true })}
            />
          ))}

          {/* Tooltip */}
          {activePoint && (
            <div className="absolute z-10 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-white text-xs pointer-events-none"
              style={{
                left: `${getXPosition(years.indexOf(activePoint.year))}%`,
                top: `${getYPosition(activePoint.revenue)}%`,
                transform: 'translate(-50%, -120%)',
                minWidth: '100px'
              }}
            >
              <div className="font-bold text-cyan-400 mb-1">{activePoint.community}</div>
              <div className="text-white/80">{activePoint.year}</div>
              <div className="font-semibold text-green-400">{formatCurrency(activePoint.revenue)}</div>
              {!activePoint.isOther && (
                <div className="text-white/60 text-[0.65rem] mt-1">{activePoint.members} members</div>
              )}
            </div>
          )}

          {/* X-axis labels */}
          <div className="absolute -bottom-4 w-full flex justify-between text-white/40 text-[0.6rem]">
            {years.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryChart;