
import React, { useState } from 'react';

// Composant Market Share Chart
const MarketShareChart = ({ percentage = 98, title = "Browser market shares" }) => {
    const colors = ['#00d4ff', '#ff1f8f', '#ffd000', '#00ff88', '#8b5cf6'];
    
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-[15.625rem] h-[15.625rem] flex flex-col">
        <div className="mb-2">
          <p className="text-cyan-400 text-xs mb-1">January, 2018</p>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-white text-sm font-semibold truncate">{title}</h3>
          </div>
        </div>
  
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              {[0, 1, 2, 3, 4].map((i) => (
                <circle key={`bg-${i}`} cx="70" cy="70" r={60 - i * 7.5} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              ))}
              {colors.map((color, i) => {
                const radius = 60 - i * 7.5;
                const circ = 2 * Math.PI * radius;
                const offset = (100 - (percentage - i * 5)) / 100 * circ;
                return (
                  <circle key={`arc-${i}`} cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-white">{percentage}%</p>
              <p className="text-white/60 text-xs">Market</p>
            </div>
          </div>
        </div>
  
        <button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-2 text-xs rounded-lg transition-colors">
          ACTION
        </button>
      </div>
    );
  };

export default MarketShareChart;
