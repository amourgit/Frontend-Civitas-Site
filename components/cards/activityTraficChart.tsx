
import React, { useState } from 'react';

// Composant Activity Traffic Chart
export default function ActivityTrafficChart () {
    const [selectedYear, setSelectedYear] = useState(2024);
    
    const monthlyData = [
      { month: 'Jan', values: [17, 16, 17] },
      { month: 'Feb', values: [19, 17, 18] },
      { month: 'Mar', values: [14, 20, 19] },
      { month: 'Apr', values: [16, 22, 20] },
      { month: 'May', values: [18, 19, 21] },
      { month: 'Jun', values: [19, 13, 23] }
    ];
  
    const colors = ['#ff1f8f', '#8b5cf6', '#3b82f6'];
  
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-[15.625rem] h-[15.625rem] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-bold">Overview</h3>
          <div className="flex items-center space-x-1 bg-white/10 rounded px-2 py-1">
            <button onClick={() => setSelectedYear(selectedYear - 1)} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-white font-semibold text-xs px-1">{selectedYear}</span>
            <button onClick={() => setSelectedYear(selectedYear + 1)} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
  
        <div className="relative flex-1">
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/40 text-[0.65rem] pr-2">
            <span>24</span>
            <span>20</span>
            <span>16</span>
            <span>12</span>
            <span>8</span>
          </div>
  
          <div className="ml-6 h-full relative">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-white/5" />
              ))}
            </div>
  
            <div className="absolute bottom-0 w-full flex items-end justify-between">
              {monthlyData.map((data, i) => (
                <div key={data.month} className="flex space-x-0.5">
                  {data.values.map((value, j) => (
                    <div key={j} className="w-1 bg-white/10 rounded-t" style={{ height: `${(value / 24) * 100}%` }} />
                  ))}
                </div>
              ))}
            </div>
  
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {colors.map((color, lineIndex) => {
                const points = monthlyData.map((data, i) => {
                  const x = ((i + 0.5) / monthlyData.length) * 100;
                  const y = 100 - ((data.values[lineIndex] / 24) * 100);
                  return `${x},${y}`;
                }).join(' ');
  
                return (
                  <polyline key={lineIndex} points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                );
              })}
            </svg>
  
            <div className="absolute -bottom-4 w-full flex justify-between text-white/40 text-[0.6rem]">
              {monthlyData.map((data) => (
                <span key={data.month}>{data.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
