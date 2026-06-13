

import React, { useState } from 'react';

// Composant 2: Countries List Chart
export const CountriesChart = ({ title = "Top Countries" }) => {
  const countries = [
    { name: 'Norway', value: 95 },
    { name: 'Australia', value: 88 },
    { name: 'Switzerland', value: 82 },
    { name: 'Netherlands', value: 75 },
    { name: 'USA', value: 68 },
    { name: 'Germany', value: 55 },
    { name: 'NZ', value: 42 },
    { name: 'Canada', value: 35 }
  ];

  const maxValue = Math.max(...countries.map(c => c.value));

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-[15.625rem] h-[15.625rem] flex flex-col">
      <h3 className="text-white text-sm font-bold mb-1">{title}</h3>
      <p className="text-white/60 text-xs mb-2">Member distribution</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-xs">Countries</span>
        <span className="text-white/60 text-xs">{countries.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scroll-container">
        {countries.map((country, index) => (
          <div key={country.name} className="relative overflow-hidden rounded" style={{ width: `${(country.value / maxValue) * 100}%`, minWidth: '60px' }}>
            <div className="px-2 py-1.5 font-semibold text-black text-xs transition-all duration-500" style={{ background: `linear-gradient(90deg, hsl(${200 + index * 15}, 80%, ${60 - index * 5}%), hsl(${180 + index * 15}, 70%, ${50 - index * 5}%))` }}>
              {country.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};